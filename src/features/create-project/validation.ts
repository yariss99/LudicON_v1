import type { QuickProjectErrors, QuickProjectInput } from "./types";

export function validateQuickProject(
  input: QuickProjectInput,
  isTitleTaken: (title: string) => boolean,
): QuickProjectErrors {
  const errors: QuickProjectErrors = {};
  const title = input.title.trim();
  if (!title) errors.title = "Project title is required.";
  else if (isTitleTaken(title))
    errors.title = "A project with this name already exists.";
  if (!input.subject.trim()) errors.subject = "Subject is required.";
  if (!input.grade.trim()) errors.grade = "Grade is required.";
  if (!input.schoolYear.trim()) errors.schoolYear = "School year is required.";
  return errors;
}

export const emptyQuickProject = (): QuickProjectInput => ({
  title: "",
  subject: "",
  grade: "",
  schoolYear: "2025-2026",
});
