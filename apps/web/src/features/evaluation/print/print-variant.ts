import type { EvaluationProject } from "@ludicon/evaluation";

/**
 * The two outputs, as a FILTER OVER ONE DOCUMENT.
 *
 * A paper and its barem are one project. `answerKey` is a top-level record
 * beside the page tree — `packages/evaluation/src/model/answer-key.ts` explains
 * why, and the reason is precisely this moment: "the pupil must never receive
 * the file that contains both", and a top-level record can be dropped in one
 * step. So the pupil's paper is this project with that record emptied, and the
 * teacher's copy is this project untouched, with the barem printed after it.
 *
 * The rejected alternative was building a second document for the pupil — a
 * `toStudentPaper()` that walks the pages and rebuilds them without the
 * answers. It is more code, it has to be revisited every time a block kind is
 * added, and its failure mode is a stripping pass that misses one exercise on
 * page four. Emptying one record cannot miss one.
 *
 * The filter is deliberately not clever. It does not remove exercises, renumber
 * anything or change the layout, because the pupil's paper and the teacher's
 * copy have to be the SAME sheet: a teacher marking question 7 is looking at
 * the seventh question on the pupil's page, and any divergence between the two
 * documents is a marking mistake waiting to happen.
 */

export const PRINT_VARIANTS = ["student", "teacher"] as const;

export type PrintVariant = (typeof PRINT_VARIANTS)[number];

/**
 * The paper as this variant prints it.
 *
 * Returns the SAME OBJECT for the teacher rather than a copy: identity is what
 * lets React skip re-rendering the sheets when the dialog re-renders, and there
 * is nothing to change.
 *
 * For the pupil it returns a shallow copy with `answerKey` emptied. Nothing
 * downstream of `DocumentRenderer` reads the answer key today, so this is a
 * guarantee rather than a behaviour change — and that is the point. The
 * exercise renderers being written now will read it the day an exercise wants
 * to show the answer in a teacher's copy, and when they do, the pupil's paper
 * already cannot show one.
 */
export const paperFor = (
  document: EvaluationProject,
  variant: PrintVariant,
): EvaluationProject =>
  variant === "teacher" ? document : { ...document, answerKey: {} };

/** Whether this variant carries the barem after the paper. */
export const printsBarem = (variant: PrintVariant): boolean =>
  variant === "teacher";
