import type { ProjectFormErrors, ProjectFormInput, ProjectStatus } from "../../../types/project";
import {
  DEFAULT_PROJECT_COLOR,
  DEFAULT_PROJECT_ICON,
  PROJECT_CURRICULA,
  PROJECT_GRADES,
  PROJECT_SCHOOL_YEARS,
} from "../constants";

export function emptyProjectForm(
  overrides: Partial<ProjectFormInput> = {},
): ProjectFormInput {
  return {
    title: "",
    subject: "",
    grade: PROJECT_GRADES[2],
    description: "",
    schoolYear: PROJECT_SCHOOL_YEARS[1],
    curriculum: PROJECT_CURRICULA[0],
    status: "draft",
    color: DEFAULT_PROJECT_COLOR,
    icon: DEFAULT_PROJECT_ICON,
    favorite: false,
    ...overrides,
  };
}

export function validateProjectForm(
  form: ProjectFormInput,
  isTitleTaken: (title: string, excludeId?: string) => boolean,
  excludeId?: string,
): ProjectFormErrors {
  const errors: ProjectFormErrors = {};
  const title = form.title.trim();
  if (!title) errors.title = "Project name is required.";
  else if (isTitleTaken(title, excludeId))
    errors.title = "A project with this name already exists.";
  if (!form.subject.trim()) errors.subject = "Subject is required.";
  if (!form.grade.trim()) errors.grade = "Class is required.";
  if (!form.schoolYear.trim()) errors.schoolYear = "School year is required.";
  if (!form.curriculum.trim()) errors.curriculum = "Curriculum is required.";
  return errors;
}

export function statusLabel(status: ProjectStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

export function assetCount(resources: { status: string }[]): number {
  return resources.filter((r) => r.status !== "empty").length;
}
