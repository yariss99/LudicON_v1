/**
 * Teacher Studio — domain types (presentation layer).
 * Project-first: every resource belongs to a project.
 */

export type StudioAreaId =
  | "home"
  | "projects"
  | "library"
  | "activity"
  | "calendar"
  | "notifications"
  | "settings";

export type QuickActionId =
  | "create-lesson"
  | "create-worksheet"
  | "create-assessment"
  | "create-story"
  | "create-presentation"
  | "create-game"
  | "open-project";

export type QuickAction = {
  readonly id: QuickActionId;
  readonly label: string;
  readonly description: string;
  readonly href: string;
  readonly intent?: string;
  readonly shortcut?: string;
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
