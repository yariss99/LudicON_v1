import type { IssueSeverity, ValidationIssue } from "@ludicon/domain";
import {
  blocksPrinting,
  validateProject,
  type EvaluationProject,
  type ExerciseRegistry,
} from "@ludicon/evaluation";

/**
 * Everything wrong with the paper, in one list, ordered by what to do first.
 *
 * Two sources meet here and neither knows about the other: `validateProject`
 * parses the document, and `overflow.ts` measures the rendered sheets. They are
 * concatenated rather than merged into a new type, because both already return
 * `@ludicon/domain`'s `ValidationIssue` — the package exists precisely so the
 * teacher sees one list of problems across their whole workspace, and inventing
 * a `PrintChecklistItem` here would be the tenth parallel issue family that
 * refactor removed.
 *
 * ## Why the checklist exists at all
 *
 * `validateProject` has been in the model since the first slice and nothing has
 * ever shown it to anyone. A validator whose output nobody reads is not a
 * safeguard, it is a comment. This is the surface that reads it, and it reads
 * it BEFORE the print window opens: the alternative — printing and discovering
 * afterwards — is the one thing a paper handed to thirty children cannot
 * afford.
 *
 * ## The order
 *
 * By severity, and stable within each level, so the list reads as "these first,
 * then these" rather than as the order the two validators happened to run in.
 * Sorting by page or by position was the rejected alternative: it groups a
 * blocking problem on page three below a note on page one, and the teacher's
 * question is "what stops me printing", not "what is where".
 */

const SEVERITY_ORDER: Readonly<Record<IssueSeverity, number>> = Object.freeze({
  blocking: 0,
  error: 1,
  warning: 2,
  info: 3,
});

export interface Checklist {
  readonly issues: readonly ValidationIssue[];
  /**
   * Whether the paper may be printed and handed out.
   *
   * Delegated to the model's own `blocksPrinting` rather than re-testing the
   * severity here. It is the model that decided a missing title blocks and a
   * points mismatch does not, and a second opinion in the app would be the one
   * that drifted — the server enforces the model's.
   */
  readonly canPrint: boolean;
}

export const buildChecklist = (
  document: EvaluationProject,
  registry: ExerciseRegistry,
  measured: readonly ValidationIssue[],
): Checklist => {
  const issues = [...validateProject(document, registry), ...measured].sort(
    (left, right) =>
      SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity],
  );

  return { issues, canPrint: !blocksPrinting(issues) };
};

/** How many of the issues are the ones standing between here and the printer. */
export const blockingCount = (checklist: Checklist): number =>
  checklist.issues.filter((issue) => issue.severity === "blocking").length;
