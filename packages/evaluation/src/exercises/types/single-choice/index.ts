import { z } from "zod";
import type { ValidationIssue } from "@ludicon/domain";
import {
  answerOutOfRange,
  duplicateItems,
  firstBlankItem,
  tooFewItems,
  type ItemNoun,
} from "../../checks.js";
import type { ExerciseDefinition } from "../../definition.js";
import { exerciseLayout } from "../../layouts.js";
import { describeOption } from "../../markers.js";
import { allOrNothing, numberFrom, unanswered } from "../../scoring.js";

/**
 * Încercuiește litera corespunzătoare: one question, several options, one right.
 *
 * ## The right answer is NOT in the config
 *
 * `SingleChoiceConfig` holds what the pupil sees and nothing else. Which option
 * is correct lives in `document.answerKey`, keyed by the block's id, and this
 * file only says what shape that entry has. It is the single most important
 * rule in the exercise system and it is not about tidiness: the paper and the
 * barem are two separate printouts, and a pupil must never receive the file
 * that contains both. A `correctIndex` field on the config would put the answer
 * inside the block — surviving every copy, every export and every move between
 * pages — and stripping it before printing would be a pass that only has to
 * miss once.
 *
 * ## Why the schema is looser than the check
 *
 * The schema permits nought to eight options; `validate` is what says two is
 * the fewest that makes a question. A schema that demanded two would make a
 * freshly dropped exercise fail to parse, and `validateProject` turns a parse
 * failure into "nu este completat corect" — true, vague, and no help. Splitting
 * them lets the same half-finished exercise say "varianta de pe locul 1 nu are
 * text", which names the field the teacher has to go and fill in.
 */

const NAME = "Alegere cu un răspuns";
const NOUN: ItemNoun = { one: "varianta", many: "variante" };
const LEAST_OPTIONS = 2;

/**
 * How the options are labelled on the printed page.
 *
 * Letters are the Romanian convention from clasa a III-a up ("a) b) c)"), and
 * numbers are what infant classes use, where the alphabet is still being
 * learnt. Not a style question — it is which paper the teacher is writing.
 */
export const SingleChoiceMarker = z.enum(["letters", "numbers"]);
export type SingleChoiceMarker = z.infer<typeof SingleChoiceMarker>;

export const SingleChoiceConfig = z.object({
  options: z.array(z.string().max(300)).max(8).default([]),
  marker: SingleChoiceMarker.default("letters"),
});
export type SingleChoiceConfig = z.infer<typeof SingleChoiceConfig>;

export const SingleChoiceAnswer = z.object({
  /** Position in `options`, zero-based. */
  correct: z.number().int().min(0).max(7),
});
export type SingleChoiceAnswer = z.infer<typeof SingleChoiceAnswer>;

export const singleChoiceExercise: ExerciseDefinition<
  SingleChoiceConfig,
  SingleChoiceAnswer
> = {
  type: "single-choice",
  category: "comprehension",

  labels: {
    name: NAME,
    description: "Elevul alege o singură variantă din mai multe.",
    keywords: [
      "grila",
      "test grila",
      "alegere",
      "incercuieste",
      "varianta",
      "raspuns unic",
      "abc",
    ],
  },

  configSchema: SingleChoiceConfig,
  answerSchema: SingleChoiceAnswer,

  /**
   * Three empty options, not three filled with "Varianta 1".
   *
   * Sample text is text the teacher has to delete before they can write, and it
   * would make every emptiness check answer "no" for an exercise nobody has
   * written yet. Three is the count a Romanian grilă almost always has.
   */
  defaults: { options: ["", "", ""], marker: "letters" },

  layouts: [
    exerciseLayout("standard", 26),
    exerciseLayout("two-column", 20),
    exerciseLayout("grid", 16),
    exerciseLayout("compact", 14),
    exerciseLayout("card", 32),
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
    return answer.correct < config.options.length
      ? []
      : [answerOutOfRange(NAME, NOUN)];
  },

  describeAnswer(config, answer) {
    return describeOption(config.options, answer.correct, config.marker);
  },

  score(_config, key, response) {
    const chosen = numberFrom(response);
    return chosen === null
      ? unanswered()
      : allOrNothing(chosen === key.correct);
  },
};
