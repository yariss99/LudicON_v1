import { z } from "zod";
import type { ValidationIssue } from "@ludicon/domain";
import {
  answerEmpty,
  answerOutOfRange,
  duplicateItems,
  firstBlankItem,
  tooFewItems,
  type ItemNoun,
} from "../../checks.js";
import type { ExerciseDefinition } from "../../definition.js";
import { exerciseLayout } from "../../layouts.js";
import { describeOption } from "../../markers.js";
import { numbersFrom, proportional, unanswered } from "../../scoring.js";

/**
 * Bifează toate variantele care se potrivesc: several options, any number right.
 *
 * ## The right answers are NOT a flag on each option
 *
 * The obvious model for this type is `options: { text, correct }[]` — one row
 * per variant carrying its own tick — and it is rejected for the reason the
 * whole exercise system exists to keep. The config is what the pupil is handed;
 * a `correct` field inside it puts the barem on the pupil's sheet, where it
 * survives every copy of the block, every export and every move between pages.
 * Stripping it before printing would be a pass that only has to be missed once.
 *
 * So the answer is a list of POSITIONS, stored in `document.answerKey`. The
 * cost is real and worth naming: an index means nothing away from the config it
 * indexes. That is why `validateAnswer` exists, and why `describeAnswer` is a
 * member here rather than something the barem printer works out for itself.
 *
 * ## Three variants, where `single-choice` asks for two
 *
 * A multiple-answer question with two variants has four possible answers, and a
 * pupil who ticks both is right whenever the teacher meant "both" — it is a
 * true/false pair wearing a grilă's clothes, and `true-false` prints that
 * shape better. Three is where "bifează toate" starts to ask anything.
 *
 * The schema still permits nought to eight, because a freshly dropped exercise
 * has to parse: `validateProject` turns a parse failure into "nu este completat
 * corect", which is true and useless, whereas a check running on a config that
 * parsed can name the variant that is still empty.
 */

const NAME = "Alegere cu mai multe răspunsuri";
const NOUN: ItemNoun = { one: "varianta", many: "variante" };
const LEAST_OPTIONS = 3;

const ANSWER_EMPTY_REMEDY =
  "Bifează variantele corecte, ca baremul să poată fi tipărit.";

/**
 * How the options are labelled on the printed page.
 *
 * Letters are the Romanian convention from clasa a III-a up ("a) b) c)"), and
 * numbers are what infant classes use, where the alphabet is still being
 * learnt. Not a style question — it is which paper the teacher is writing.
 */
export const MultipleChoiceMarker = z.enum(["letters", "numbers"]);
export type MultipleChoiceMarker = z.infer<typeof MultipleChoiceMarker>;

export const MultipleChoiceConfig = z.object({
  options: z.array(z.string().max(300)).max(8).default([]),
  marker: MultipleChoiceMarker.default("letters"),
});
export type MultipleChoiceConfig = z.infer<typeof MultipleChoiceConfig>;

export const MultipleChoiceAnswer = z.object({
  /** Positions in `options`, zero-based. */
  correct: z.array(z.number().int().min(0).max(7)).max(8),
});
export type MultipleChoiceAnswer = z.infer<typeof MultipleChoiceAnswer>;

export const multipleChoiceExercise: ExerciseDefinition<
  MultipleChoiceConfig,
  MultipleChoiceAnswer
> = {
  type: "multiple-choice",
  category: "comprehension",

  labels: {
    name: NAME,
    description: "Elevul bifează toate variantele care se potrivesc.",
    keywords: [
      "grila",
      "bifeaza",
      "mai multe raspunsuri",
      "alegere multipla",
      "casute",
      "variante",
    ],
  },

  configSchema: MultipleChoiceConfig,
  answerSchema: MultipleChoiceAnswer,

  /**
   * Four empty options, one more than `single-choice` starts with.
   *
   * A question that asks for several answers needs room to be non-trivial: with
   * three variants the teacher is choosing between "one right" — which is a
   * different exercise — and "two of three", which a pupil can often reach by
   * elimination. Four is the smallest list where ticking all of them is a real
   * mistake rather than a near miss.
   *
   * Empty, never "Varianta 1": sample text is text the teacher has to delete
   * before they can write, and it would make every emptiness check answer "no"
   * for an exercise nobody has written yet.
   */
  defaults: { options: ["", "", "", ""], marker: "letters" },

  layouts: [
    exerciseLayout("standard", 30),
    exerciseLayout("two-column", 24),
    exerciseLayout("grid", 20),
    exerciseLayout("card", 36),
  ],

  validate(config) {
    const issues: ValidationIssue[] = [];

    if (config.options.length < LEAST_OPTIONS) {
      issues.push(
        tooFewItems(NAME, NOUN, config.options.length, LEAST_OPTIONS),
      );
    }

    issues.push(...firstBlankItem(NAME, NOUN, config.options));
    issues.push(...duplicateItems(NAME, NOUN, config.options));
    return issues;
  },

  validateAnswer(config, answer) {
    const issues: ValidationIssue[] = [];

    if (answer.correct.some((index) => index >= config.options.length)) {
      issues.push(answerOutOfRange(NAME, NOUN));
    }

    if (answer.correct.length === 0) {
      issues.push(answerEmpty(NAME, ANSWER_EMPTY_REMEDY));
    }

    return issues;
  },

  describeAnswer(config, answer) {
    return [...answer.correct]
      .sort((first, second) => first - second)
      .map((index) => describeOption(config.options, index, config.marker))
      .join(", ");
  },

  score(config, key, response) {
    const ticked = numbersFrom(response);
    if (ticked === null) return unanswered();

    const wanted = new Set(key.correct);
    const given = new Set(ticked);

    /**
     * Marks are for DECISIONS, not for hits.
     *
     * Scoring hits over `key.correct.length` hands full marks to a pupil who
     * ticked every box: they hit every right answer and were never charged for
     * the wrong ones. That is not a rounding quirk, it is a strategy, and one
     * class works it out per year.
     *
     * So every variant is one decision. Ticking a right one earns, and so does
     * leaving a wrong one alone, and the total is the number of variants — the
     * all-ticked paper then scores exactly the fraction of the list that
     * happened to be correct.
     */
    const rightDecisions = config.options.reduce(
      (total, _option, index) =>
        wanted.has(index) === given.has(index) ? total + 1 : total,
      0,
    );

    return proportional(rightDecisions, config.options.length);
  },
};
