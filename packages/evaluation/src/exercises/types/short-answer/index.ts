import { z } from "zod";
import { answerEmpty } from "../../checks.js";
import type { ExerciseDefinition } from "../../definition.js";
import { exerciseLayout } from "../../layouts.js";
import {
  allOrNothing,
  matchesAccepted,
  stringFrom,
  unanswered,
} from "../../scoring.js";

/**
 * Răspuns scurt: a question, and the space to write the answer in.
 *
 * ## `validate` returns nothing, and that is a finding
 *
 * Every other type holds the WORDS of the question — the variants, the
 * statements, the pairs — so it can be half-written and has to say so. This one
 * holds only the shape of the answer space: how many ruled lines, and what unit
 * is printed after them. The words are the cerință, which lives on the block
 * and is checked once, for every type at once, by `validateProject`.
 *
 * So there is no pedagogical state left for a check to name. `lines` is bounded
 * at one to four by the schema and `unit` at thirty characters, and inventing a
 * rule anyway — "the unit is empty" — would put a blocking sentence on the
 * field that most short answers correctly leave blank.
 *
 * ## The barem is a list of spellings, not one string
 *
 * A short answer has more than one right form far more often than a grilă does:
 * „doi" and „2", „București" and „Bucuresti", „primăvara" and „în primăvară".
 * `matchesAccepted` already folds case, diacritics and runs of whitespace
 * before comparing, so the list carries genuinely different answers rather than
 * the same answer typed carefully and carelessly.
 *
 * ## Right or nothing
 *
 * `score` is all-or-nothing. There is one answer, so there is nothing to be
 * partly right about; a fraction here would have to be a similarity measure,
 * and a marker awarding 0.6 for a misspelling is making a pedagogical decision
 * the teacher never wrote down.
 */

const NAME = "Răspuns scurt";

export const ShortAnswerConfig = z.object({
  /** Ruled lines under the cerință. One for a word, four for a sentence. */
  lines: z.number().int().min(1).max(4).default(1),
  /** Printed after the writing space — "kg", "ani". Empty prints nothing. */
  unit: z.string().max(30).default(""),
});
export type ShortAnswerConfig = z.infer<typeof ShortAnswerConfig>;

export const ShortAnswerAnswer = z.object({
  /** Every spelling the marker accepts, any one of which is full marks. */
  accepted: z.array(z.string().max(300)).max(8),
});
export type ShortAnswerAnswer = z.infer<typeof ShortAnswerAnswer>;

export const shortAnswerExercise: ExerciseDefinition<
  ShortAnswerConfig,
  ShortAnswerAnswer
> = {
  type: "short-answer",
  category: "vocabulary",

  labels: {
    name: NAME,
    description: "Elevul scrie un cuvânt sau o propoziție pe rândurile date.",
    keywords: [
      "raspuns scurt",
      "completeaza",
      "un cuvant",
      "definitie",
      "scrie raspunsul",
      "vocabular",
    ],
  },

  configSchema: ShortAnswerConfig,
  answerSchema: ShortAnswerAnswer,

  /**
   * One line and no unit.
   *
   * The overwhelming majority of these ask for a single word, so one line is
   * the answer that needs no editing at all; a teacher wanting a sentence says
   * so once. The unit starts empty because it prints, and a placeholder that
   * prints is sample text the teacher has to notice before it reaches a class.
   */
  defaults: { lines: 1, unit: "" },

  layouts: [
    exerciseLayout("standard", 20),
    exerciseLayout("compact", 14),
    exerciseLayout("card", 26),
  ],

  validate() {
    return [];
  },

  validateAnswer(_config, answer) {
    return answer.accepted.some((spelling) => spelling.trim() !== "")
      ? []
      : [
          answerEmpty(
            NAME,
            "Scrie măcar un răspuns pe care îl accepți, ca baremul să fie complet.",
          ),
        ];
  },

  describeAnswer(_config, answer) {
    return answer.accepted
      .map((spelling) => spelling.trim())
      .filter((spelling) => spelling !== "")
      .join(" / ");
  },

  score(_config, key, response) {
    const written = stringFrom(response);
    return written === null
      ? unanswered()
      : allOrNothing(matchesAccepted(key.accepted, written));
  },
};
