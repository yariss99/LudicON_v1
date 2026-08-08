import { z } from "zod";
import { answerEmpty, textMissing } from "../../checks.js";
import type { ExerciseDefinition } from "../../definition.js";
import { exerciseLayout } from "../../layouts.js";
import { positionMarker } from "../../markers.js";
import {
  allOrNothing,
  matchesAccepted,
  stringFrom,
  unanswered,
} from "../../scoring.js";

/**
 * A problem with a text, room to work it out, and one box for the result.
 *
 * ## The barem holds two different things, and only one of them marks
 *
 * `accepted` is the set of spellings of the FINAL answer a marker takes — "12",
 * "12 mere", "douăsprezece" — and it is the only part `score` reads. `steps` is
 * the worked solution, printed on the barem so the person marking can see where
 * a pupil went wrong and award partial credit by hand. Merging the two into one
 * "răspuns" field was rejected on the first example: a solution written out in
 * three steps would then be compared, character by character, against what a
 * child wrote on one line, and every pupil would score zero.
 *
 * ## Several accepted spellings, not one
 *
 * `matchesAccepted` already folds case, diacritics and runs of whitespace, so
 * `accepted` does not exist to absorb typing noise — it exists because a
 * genuine final answer has more than one correct form. A single string was the
 * simpler field and it forces the teacher to choose between marking "12" right
 * and marking "12 mere" right, when both are.
 *
 * ## `workLines` may be zero
 *
 * A problem solved in the head — "de câte ori este 6 mai mare decât 2?" — wants
 * the box and nothing above it, and a floor of one line would print a rule the
 * exercise does not want. The value is a count of lines rather than a height in
 * millimetres so that the space stays in step with the theme's ruled spacing,
 * which is set for the class the paper is for.
 */

const NAME = "Problemă";

export const WordProblemConfig = z.object({
  /** What the pupil reads. Line breaks are the teacher's and are kept. */
  statement: z.string().max(2000).default(""),
  /** Ruled lines for working out. Zero prints none. */
  workLines: z.number().int().min(0).max(20).default(6),
  /** Printed before the box the result goes in. */
  answerLabel: z.string().max(40).default("Răspuns:"),
});
export type WordProblemConfig = z.infer<typeof WordProblemConfig>;

export const WordProblemAnswer = z.object({
  /** Spellings of the final answer the marker takes. The only part marked. */
  accepted: z.array(z.string().max(200)).max(8),
  /** The worked solution, printed in the barem for the person marking. */
  steps: z.array(z.string().max(300)).max(10),
});
export type WordProblemAnswer = z.infer<typeof WordProblemAnswer>;

export const wordProblemExercise: ExerciseDefinition<
  WordProblemConfig,
  WordProblemAnswer
> = {
  type: "word-problem",
  category: "problem_solving",

  labels: {
    name: NAME,
    description: "Elevul rezolvă o problemă cu text și scrie răspunsul.",
    keywords: [
      "problema",
      "problema cu text",
      "rezolvare",
      "rationament",
      "de cate ori",
      "cati",
      "cate",
    ],
  },

  disciplines: ["matematica"],

  configSchema: WordProblemConfig,
  answerSchema: WordProblemAnswer,

  /**
   * Empty statement, six lines, and the one word that is not sample text.
   *
   * "Răspuns:" is the label printed beside the box on every Romanian maths
   * paper, so it is the correct default rather than something to delete — the
   * teacher changes it when they want "Rezultatul:" and otherwise never opens
   * the field. `statement` starts empty for the usual reason: text a teacher
   * has to clear before they can write is not a head start.
   */
  defaults: { statement: "", workLines: 6, answerLabel: "Răspuns:" },

  layouts: [exerciseLayout("standard", 50), exerciseLayout("card", 56)],

  validate(config) {
    return config.statement.trim() === ""
      ? [
          textMissing(
            NAME,
            "textul problemei",
            "Scrie problema, ca elevii să știe ce au de rezolvat.",
          ),
        ]
      : [];
  },

  validateAnswer(_config, answer) {
    const written = answer.accepted.some((one) => one.trim() !== "");
    return written
      ? []
      : [answerEmpty(NAME, "Scrie răspunsul final pe care îl accepți.")];
  },

  /**
   * The result first, the working after it.
   *
   * A marker reads down a column of answers checking results, and only stops at
   * the steps for the papers that got it wrong. Putting the solution first
   * would make them read a paragraph to find a number on every single row.
   * The alternatives are separated by "/" because they are the same answer
   * spelled differently, and the working by "—" because it is a different kind
   * of thing.
   */
  describeAnswer(_config, answer) {
    const result = answer.accepted
      .map((text) => text.trim())
      .filter((text) => text !== "")
      .join(" / ");

    const working = answer.steps
      .map((text) => text.trim())
      .filter((text) => text !== "")
      .map((text, index) => `${positionMarker(index)} ${text}`)
      .join("  ");

    return working === "" ? result : `${result} — ${working}`;
  },

  /**
   * Only the final answer is marked here; the steps are for the person marking.
   *
   * Partial credit on a problem is a judgement about which step went wrong, and
   * that judgement is exactly what `steps` is printed on the barem to support.
   * Nothing in this file can make it.
   */
  score(_config, key, response) {
    const written = stringFrom(response);
    return written === null
      ? unanswered()
      : allOrNothing(matchesAccepted(key.accepted, written));
  },
};
