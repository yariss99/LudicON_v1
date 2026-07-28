/**
 * Project Workspace domain model.
 * Every educational artifact belongs to a Project — never isolated.
 */

export type ProjectWorkspaceStatus =
  | "draft"
  | "active"
  | "archived"
  | "completed";

export type ProjectUnit = {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly order: number;
  readonly description?: string;
};

export type ArtifactKind =
  | "unit"
  | "lesson"
  | "worksheet"
  | "assessment"
  | "story"
  | "game"
  | "presentation"
  | "resource"
  | "note";

export type ArtifactStatus = "draft" | "ready" | "archived";

export type ArtifactActor = "teacher" | "ai" | "system";

export type ProjectArtifact = {
  readonly id: string;
  readonly projectId: string;
  readonly kind: ArtifactKind;
  readonly title: string;
  readonly status: ArtifactStatus;
  readonly unitId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly version: number;
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: ArtifactActor;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type ArtifactVersion = {
  readonly id: string;
  readonly artifactId: string;
  readonly projectId: string;
  readonly version: number;
  readonly snapshot: ProjectArtifact;
  readonly createdAt: string;
  readonly actor: ArtifactActor;
  readonly note?: string;
};

export type ProjectActivityKind =
  | "teacher_action"
  | "ai_action"
  | "validation"
  | "export"
  | "comment"
  | "version";

export type ProjectActivityEvent = {
  readonly id: string;
  readonly projectId: string;
  readonly kind: ProjectActivityKind;
  readonly title: string;
  readonly detail: string;
  readonly actor: ArtifactActor;
  readonly artifactId?: string;
  readonly timestamp: string;
};

export type ProjectMetadata = {
  readonly schoolYear?: string;
  readonly semester?: string;
  readonly curriculumRef?: string;
  readonly competencies: readonly string[];
  readonly tags: readonly string[];
  readonly teacherId?: string;
  readonly teacherName?: string;
  readonly status: ProjectWorkspaceStatus;
};

export type ProjectWorkspaceTabId =
  | "overview"
  | "lessons"
  | "worksheets"
  | "assessments"
  | "stories"
  | "games"
  | "presentations"
  | "resources"
  | "ai"
  | "versions"
  | "activity"
  | "settings";

export type ProjectProgress = {
  readonly totalArtifacts: number;
  readonly readyCount: number;
  readonly draftCount: number;
  readonly percentComplete: number;
};

export type AiSuggestion = {
  readonly id: string;
  readonly title: string;
  readonly reason: string;
  readonly actionLabel: string;
  readonly href: string;
  readonly kind: ArtifactKind | "general";
};

/** Context passed into Core engines — always project-scoped. */
export type ProjectCoreContext = {
  readonly projectId: string;
  readonly projectTitle: string;
  readonly subject: string;
  readonly grade: string;
  readonly locale: string;
  readonly curriculumRef?: string;
  readonly competencies: readonly string[];
  readonly activeArtifactId?: string;
  readonly activeTab: ProjectWorkspaceTabId;
  readonly intent: string;
};
