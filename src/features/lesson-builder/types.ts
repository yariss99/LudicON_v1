/**
 * Lesson Builder domain model.
 * Lessons always belong to a Project — never created in isolation.
 */

export type LessonPhaseId =
  | "introduction"
  | "motivation"
  | "knowledge_construction"
  | "practice"
  | "assessment"
  | "reflection"
  | "closure";

export type LessonBlockKind =
  | "text"
  | "activity"
  | "resource"
  | "assessment"
  | "note"
  | "prompt";

export type LessonDocumentStatus =
  | "draft"
  | "validated"
  | "published"
  | "archived";

export type LessonActor = "teacher" | "ai" | "system";

export type LessonSectionId =
  | "general"
  | "objectives"
  | "competencies"
  | "prerequisites"
  | "resources"
  | "phases"
  | "activities"
  | "differentiation"
  | "assessment"
  | "homework"
  | "reflection"
  | "notes";

export type LessonBlock = {
  readonly id: string;
  readonly kind: LessonBlockKind;
  readonly title: string;
  readonly content: string;
  readonly phaseId?: LessonPhaseId;
  readonly durationMinutes?: number;
  readonly reusable: boolean;
  readonly order: number;
};

export type LessonPhase = {
  readonly id: LessonPhaseId;
  readonly title: string;
  readonly content: string;
  readonly durationMinutes: number;
};

export type LessonComment = {
  readonly id: string;
  readonly sectionId: LessonSectionId | "block";
  readonly blockId?: string;
  readonly body: string;
  readonly author: LessonActor;
  readonly createdAt: string;
  readonly resolved: boolean;
};

export type LessonGeneralInfo = {
  readonly title: string;
  readonly subject: string;
  readonly grade: string;
  readonly durationMinutes: number;
  readonly date: string;
  readonly author: string;
  readonly schoolYear?: string;
  readonly semester?: string;
};

export type LessonValidationIssue = {
  readonly id: string;
  readonly severity: "error" | "warning" | "info";
  readonly code: string;
  readonly message: string;
  readonly sectionId?: LessonSectionId;
  readonly repairSuggestion?: string;
};

export type LessonValidationReport = {
  readonly score: number;
  readonly passed: boolean;
  readonly issues: readonly LessonValidationIssue[];
  readonly validatedAt: string;
};

export type LessonDocument = {
  readonly id: string;
  readonly projectId: string;
  readonly workspaceArtifactId?: string;
  readonly status: LessonDocumentStatus;
  readonly version: number;
  readonly general: LessonGeneralInfo;
  readonly objectives: readonly string[];
  readonly competencies: readonly string[];
  readonly prerequisites: readonly string[];
  readonly resources: readonly string[];
  readonly phases: readonly LessonPhase[];
  readonly differentiation: string;
  readonly assessment: string;
  readonly homework: string;
  readonly reflection: string;
  readonly teacherNotes: string;
  readonly blocks: readonly LessonBlock[];
  readonly comments: readonly LessonComment[];
  readonly validation?: LessonValidationReport;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt?: string;
  readonly createdBy: LessonActor;
};

export type LessonVersion = {
  readonly id: string;
  readonly lessonId: string;
  readonly projectId: string;
  readonly version: number;
  readonly snapshot: LessonDocument;
  readonly createdAt: string;
  readonly actor: LessonActor;
  readonly note?: string;
};

export type LessonAiActionId =
  | "generate_complete"
  | "generate_section"
  | "improve"
  | "differentiate"
  | "adapt_difficulty"
  | "suggest_resources"
  | "suggest_assessment"
  | "suggest_homework"
  | "generate_reflection";

export type LessonBuilderPanel =
  | "editor"
  | "validation"
  | "versions"
  | "ai"
  | "comments";
