/**
 * Teacher Studio — domain types (presentation layer).
 * Project-first: every resource belongs to a project.
 */

import type { ProjectColorId, ProjectIconId } from "../../types/project";

export type StudioAreaId =
  | "home"
  | "projects"
  | "library"
  | "activity"
  | "calendar"
  | "notifications"
  | "settings";

export type CreateOptionId =
  | "lesson"
  | "worksheet"
  | "game"
  | "story"
  | "assessment"
  | "presentation";

export type CreateOption = {
  readonly id: CreateOptionId;
  readonly label: string;
  readonly description: string;
  /** Short reassurance shown once this type is chosen. */
  readonly hint: string;
  /** Real builder route; needs `/:projectId` appended. Null when none exists. */
  readonly builderPath: string | null;
  /** An existing alternative flow for this type, if the repository has one. */
  readonly altPath: string | null;
  readonly altLabel: string | null;
  /** Primary action copy — says what will actually happen. */
  readonly actionLabel: string;
  /** Defaults applied to the created project, from the real project enums. */
  readonly color: ProjectColorId;
  readonly icon: ProjectIconId;
};

export type StudioNavItem = {
  readonly id: StudioAreaId;
  readonly label: string;
  readonly href: string;
  readonly shortcut?: string;
};

export type LibraryScope =
  | "all"
  | "generated"
  | "templates"
  | "shared"
  | "school"
  | "favorites";

export type LibraryResourceKind =
  | "lesson"
  | "worksheet"
  | "assessment"
  | "story"
  | "presentation"
  | "template"
  | "other";

export type LibraryResource = {
  readonly id: string;
  readonly title: string;
  readonly kind: LibraryResourceKind;
  readonly projectId: string;
  readonly projectTitle: string;
  readonly scope: LibraryScope;
  readonly updatedAt: string;
  readonly favorite: boolean;
};

export type ActivityKind =
  | "opened"
  | "edited"
  | "ai_generated"
  | "teacher_modified"
  | "published";

export type ActivityItem = {
  readonly id: string;
  readonly kind: ActivityKind;
  readonly title: string;
  readonly detail: string;
  readonly projectId?: string;
  readonly timestamp: string;
  readonly timestampLabel: string;
};

export type CalendarEvent = {
  readonly id: string;
  readonly title: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly projectId?: string;
  readonly location?: string;
};

export type StudioNotification = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly createdAt: string;
  readonly read: boolean;
  readonly href?: string;
};

export type AiRecommendation = {
  readonly id: string;
  readonly title: string;
  readonly reason: string;
  readonly actionLabel: string;
  readonly href: string;
};

export type SuggestedActivity = {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly href: string;
};

export type StudioTeacherProfile = {
  readonly teacherId: string;
  readonly displayName: string;
  readonly locale: string;
  readonly schoolName?: string;
};

export type StudioContextSnapshot = {
  readonly teacher: StudioTeacherProfile;
  readonly activeProjectId: string | null;
  readonly activeProjectTitle: string | null;
  readonly workflowHint: string | null;
};
