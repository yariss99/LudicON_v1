import type { LucideIcon } from "lucide-react";

export type ProjectResourceType =
  | "blueprint"
  | "lesson"
  | "activities"
  | "worksheet"
  | "assessment"
  | "presentation"
  | "game"
  | "notes"
  | "reflection"
  | "resources"
  | "ai_notes";

export type ProjectResourceStatus = "ready" | "draft" | "empty";

export type ProjectResource = {
  id: string;
  type: ProjectResourceType;
  label: string;
  status: ProjectResourceStatus;
};

export type ProjectState =
  | "conversation"
  | "blueprint_review"
  | "approved"
  | "resources_ready";

export type ProjectIconId =
  | "book"
  | "flask"
  | "globe"
  | "palette"
  | "calculator"
  | "music"
  | "landmark"
  | "atom"
  | "pen"
  | "lightbulb";

export type ProjectColorId =
  | "blue"
  | "indigo"
  | "emerald"
  | "amber"
  | "rose"
  | "teal"
  | "violet"
  | "sky";

/**
 * Canonical Project — primary workspace for lessons, worksheets,
 * presentations, assessments and educational resources.
 *
 * `createdAt` / `updatedAt` are ISO-8601 strings (Date serialisation for LocalStorage).
 */
export type Project = {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  color: ProjectColorId;
  icon: ProjectIconId;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  archived: boolean;
  /** Future modules attach resources here */
  resources: ProjectResource[];
  state: ProjectState;
};

export type ProjectFormInput = {
  title: string;
  subject: string;
  grade: string;
  description: string;
  color: ProjectColorId;
  icon: ProjectIconId;
  favorite: boolean;
};

/** @deprecated Use ProjectFormInput */
export type CreateProjectInput = ProjectFormInput;

export type UpdateProjectInput = ProjectFormInput;

export type ProjectFormErrors = Partial<
  Record<"title" | "subject" | "grade", string>
>;

export type ProjectSortOption =
  | "newest"
  | "oldest"
  | "alphabetical"
  | "recently_updated";

export type IntentionAction = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  iconClass: string;
};

export type HomeActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
};
