import { z } from "zod";
import type { ValidationIssue } from "@ludicon/domain";
import {
  answerCountMismatch,
  duplicateItems,
  firstBlankItem,
  textMissing,
  tooFewItems,
  type ItemNoun,
} from "../../checks.js";
import type { ExerciseDefinition } from "../../definition.js";
import { exerciseLayout } from "../../layouts.js";
import { positionMarker } from "../../markers.js";
import {
  booleansFrom,
  countMatching,
  countOf,
  proportional,
  unanswered,
} from "../../scoring.js";

/**
 * Adevărat sau fals: a short list of statements, one letter beside each.
 *
 * ## Which statements are true is NOT in the config
 *
 * `statements: { text, isTrue }[]` is the shape this type asks for, and it is
 * the shape that prints the barem on the pupil's sheet. The statements are what
 * the pupil reads, so they are the config; which of them are true is the
 * marking scheme, so it is `TrueFalseAnswer` in `document.answerKey`, aligned
 * with the list by position.
 *
 * Two arrays that have to stay the same length is a real cost, and
 * `validateAnswer` is where it is paid. It is smaller than the alternative: an
 * `isTrue` field travels with the block through every copy and every export,
 * and the pass that would strip it before printing only has to be missed once.
 *
 * ## The two marks are the teacher's, not the product's
 *
 * A and F are the Romanian convention, and they are DEFAULTS rather than
 * constants because the same exercise at an English lesson wants T and F, and a
 * clasa pregătitoare paper sometimes wants a tick and a cross. They are printed
 * on the pupil's sheet — they are the thing that gets circled — so they belong
 * to the config, and `validate` refuses a blank one: a sheet with nothing to
 * circle cannot be answered at all.
 *
 * ## Six statements are six questions, so credit is proportional
 *
 * `score` marks per statement rather than all-or-nothing. A pupil who read five
 * of six correctly has not failed the exercise, and a type that said otherwise
 * would push teachers into writing six one-statement exercises just to get
 * marks that behave. `proportional` still calls the whole thing correct only
 * when every statement matches.
 */

const NAME = "Adevărat sau fals";
const NOUN: ItemNoun = { one: "enunțul", many: "enunțuri" };
const LEAST_STATEMENTS = 2;

export const TrueFalseConfig = z.object({
  statements: z.array(z.string().max(300)).max(12).default([]),
  /** What the pupil circles for a true statement. Four characters is a tick. */
  trueMark: z.string().max(4).default("A"),
  falseMark: z.string().max(4).default("F"),
});
export type TrueFalseConfig = z.infer<typeof TrueFalseConfig>;

export const TrueFalseAnswer = z.object({
  /** One per statement, in the same order as `statements`. */
  values: z.array(z.boolean()).max(12),
});
export type TrueFalseAnswer = z.infer<typeof TrueFalseAnswer>;

export const trueFalseExercise: ExerciseDefinition<
  TrueFalseConfig,
  TrueFalseAnswer
> = {
  type: "true-false",
  category: "comprehension",

  labels: {
    name: NAME,
    description: "Elevul scrie A sau F în dreptul fiecărui enunț.",
    keywords: [
      "adevarat",
      "fals",
      "a sau f",
      "enunturi",
      "afirmatii",
      "adevarat fals",
    ],
  },

  configSchema: TrueFalseConfig,
  answerSchema: TrueFalseAnswer,

  /**
   * Three empty statements, and the two Romanian marks already filled in.
   *
   * The statements are the teacher's words, so they start blank — sample text
   * is text that has to be deleted before anything can be written. The marks
   * are not the teacher's words but a convention almost every paper keeps, so
   * they start correct and are there to be changed rather than supplied.
   */
  defaults: { statements: ["", "", ""], trueMark: "A", falseMark: "F" },

  layouts: [
    exerciseLayout("standard", 28),
    exerciseLayout("compact", 20),
    exerciseLayout("card", 34),
  ],

  validate(config) {
    const issues: ValidationIssue[] = [];

    if (config.statements.length < LEAST_STATEMENTS) {
      issues.push(
        tooFewItems(NAME, NOUN, config.statements.length, LEAST_STATEMENTS),
      );
    }

    issues.push(...firstBlankItem(NAME, NOUN, config.statements));
    issues.push(...duplicateItems(NAME, NOUN, config.statements));

    if (config.trueMark.trim() === "" || config.falseMark.trim() === "") {
      issues.push(
        textMissing(
          NAME,
          "semnele pentru adevărat și fals",
          "Scrie ce trebuie să încercuiască elevul — de obicei A și F.",
        ),
      );
    }

    return issues;
  },

  validateAnswer(config, answer) {
    return answer.values.length === config.statements.length
      ? []
      : [answerCountMismatch(NAME, NOUN)];
  },

  describeAnswer(config, answer) {
    return answer.values
      .map(
        (value, index) =>
          `${positionMarker(index)} ${value ? config.trueMark : config.falseMark}`,
      )
      .join("  ");
  },

  score(_config, key, response) {
    const marked = booleansFrom(response);
    if (marked === null) return unanswered();

    return proportional(
      countMatching(
        key.values,
        marked,
        (expected, given) => expected === given,
      ),
      countOf(key.values),
    );
  },
};
