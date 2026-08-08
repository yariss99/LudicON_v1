import { z } from "zod";
import { answerEmpty, firstBlankItem, type ItemNoun } from "../../checks.js";
import type { ExerciseDefinition } from "../../definition.js";
import { exerciseLayout } from "../../layouts.js";
import { positionMarker } from "../../markers.js";
import { unanswered } from "../../scoring.js";

/**
 * Compunere: a cerință, a few things to remember, and ruled lines to fill.
 *
 * ## The reminders are the question; the criteria are the barem
 *
 * `reminders` is config — the two or three things the pupil is told to include,
 * printed under the cerință where they can read them while they write.
 * `criteria` is the answer — what the person marking looks for, printed only on
 * the barem. They are two lists that sound alike and they are not the same
 * list: "scrie despre ce ai făcut în vacanță" belongs on the pupil's sheet,
 * "folosește corect virgula la vocativ" belongs on the teacher's. Keeping one
 * list and printing it on both sheets was the obvious economy, and it hands the
 * marking scheme to the class — the single thing `document.answerKey` exists to
 * prevent.
 *
 * ## `lines`, not a word count
 *
 * The pupil is given a number of RULED LINES, because that is the constraint
 * they can actually see while writing. A `maxWords` field was rejected: nothing
 * on a printed page counts words, so it would be a limit only the teacher knew
 * about and only the marker could enforce, and a pupil in clasa a III-a cannot
 * estimate it. Twelve lines is roughly a page-and-a-bit of primary handwriting,
 * which is what a compunere at this level is.
 *
 * ## Nothing here can be marked by a machine
 *
 * Every other type in this package narrows a response and compares it. This one
 * cannot, and `score` says so rather than pretending. The consequence runs
 * backwards through the file: `validateAnswer` insists on criteria not because
 * anything computes with them, but because a barem with nothing on it is a
 * sheet the marker has to invent as they go, and two markers then disagree.
 */

const NAME = "Compunere";
const NOUN: ItemNoun = { one: "cerința", many: "cerințe" };

export const LongAnswerConfig = z.object({
  /** Ruled lines printed for the pupil to write on. */
  lines: z.number().int().min(4).max(40).default(12),
  /** What the pupil is told to include, printed under the cerință. */
  reminders: z.array(z.string().max(200)).max(6).default([]),
});
export type LongAnswerConfig = z.infer<typeof LongAnswerConfig>;

export const LongAnswerAnswer = z.object({
  /** What the marker looks for. Printed in the barem, never on the paper. */
  criteria: z.array(z.string().max(300)).max(8),
});
export type LongAnswerAnswer = z.infer<typeof LongAnswerAnswer>;

export const longAnswerExercise: ExerciseDefinition<
  LongAnswerConfig,
  LongAnswerAnswer
> = {
  type: "long-answer",
  category: "creative",

  labels: {
    name: NAME,
    description: "Elevul scrie un text mai lung pe rândurile date.",
    keywords: [
      "compunere",
      "text",
      "redactare",
      "eseu",
      "scrie o compunere",
      "raspuns lung",
      "creativitate",
    ],
  },

  configSchema: LongAnswerConfig,
  answerSchema: LongAnswerAnswer,

  /**
   * No reminders at all, and twelve lines.
   *
   * A compunere is complete with nothing but its cerință and its lines — the
   * reminders are an option, not a part — so the empty list is the honest
   * starting point rather than one blank row asking to be filled.
   */
  defaults: { lines: 12, reminders: [] },

  layouts: [exerciseLayout("standard", 60), exerciseLayout("card", 66)],

  validate(config) {
    return firstBlankItem(NAME, NOUN, config.reminders);
  },

  validateAnswer(_config, answer) {
    const written = answer.criteria.some((one) => one.trim() !== "");
    return written
      ? []
      : [
          answerEmpty(
            NAME,
            "Scrie ce urmărești la corectare, ca baremul să poată fi tipărit.",
          ),
        ];
  },

  /**
   * A compunere's barem IS its criteria — there is no other answer to state.
   *
   * Blanks are dropped BEFORE numbering, so the printed list runs 1, 2, 3 with
   * no gaps. That is the opposite of what `describeOption` does for a
   * positional answer, and the difference is what the number means: there it is
   * the answer, and losing it loses everything; here it is only ordering, so a
   * gap would send the marker hunting down the page for a criterion that was
   * never written.
   */
  describeAnswer(_config, answer) {
    return answer.criteria
      .map((text) => text.trim())
      .filter((text) => text !== "")
      .map((text, index) => `${positionMarker(index)} ${text}`)
      .join("  ");
  },

  /**
   * Marked by a person, and this says so instead of guessing.
   *
   * There is no machine-checkable answer to a compunere. Two pupils can write
   * the same good text in different words, and folding case and diacritics —
   * which is all `matchesAccepted` does — gets nowhere near that. The barem
   * prints the criteria for whoever is holding the red pen, and that is the
   * whole marking mechanism for this type.
   *
   * So `unanswered()` rather than `allOrNothing(false)`, even though the two
   * return the same numbers today. The day responses are captured digitally,
   * every type's `score` starts being believed, and a confident zero on a
   * compunere would be this file asserting a text was wrong when it never read
   * it. `unanswered` is the branch that means "no answer I could make sense
   * of", which is the truth here for every response, always. Whoever wires that
   * capture screen will find this comment before they find a bug.
   */
  score(_config, _key, _response) {
    return unanswered();
  },
};
