/**
 * Issue codes, in one place, namespaced `evaluation.*`.
 *
 * Codes are the STABLE half of a `ValidationIssue` and the Romanian message is
 * the volatile half. A code is what a test asserts on, what the editor keys its
 * "jump to the problem" behaviour off, and what survives a rewording; the
 * message is what a teacher reads and is expected to be rewritten whenever it
 * reads badly. Keeping them apart means improving the wording never breaks a
 * test, and never breaks the `@ludicon/domain` contract either — `ValidationIssue`
 * already carries both fields, so this package invents no new shape.
 *
 * The namespace prefix matters because issues from several validators end up in
 * one list in front of the teacher, and "title_missing" from three different
 * documents is three different problems.
 */
export const EVALUATION_ISSUE_CODE = Object.freeze({
  documentEmpty: "evaluation.document.empty",
  titleMissing: "evaluation.meta.title_missing",
  disciplineMissing: "evaluation.meta.discipline_missing",
  gradeMissing: "evaluation.meta.grade_missing",
  answerMissing: "evaluation.answer_key.missing",
  answerOrphan: "evaluation.answer_key.orphan",
  answerTypeMismatch: "evaluation.answer_key.type_mismatch",
  answerPointsMismatch: "evaluation.answer_key.points_mismatch",
  answerInvalid: "evaluation.answer_key.invalid",
  exerciseUnknownType: "evaluation.exercise.unknown_type",
  exerciseConfigInvalid: "evaluation.exercise.config_invalid",
  freeBlockNotAllowed: "evaluation.block.free_not_allowed",
  danglingReference: "evaluation.structure.dangling_reference",
  layoutMismatch: "evaluation.structure.layout_mismatch",
});

export type EvaluationIssueCode =
  (typeof EVALUATION_ISSUE_CODE)[keyof typeof EVALUATION_ISSUE_CODE];
