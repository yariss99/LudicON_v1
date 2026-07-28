/**
 * Teacher AI Assistant — educational co-pilot (not a chatbot).
 * Always context-aware across PRIMA modules.
 */

export type AssistantCapability =
  | "create"
  | "edit"
  | "improve"
  | "explain"
  | "simplify"
  | "differentiate"
  | "adapt"
  | "translate"
  | "summarize"
  | "validate"
  | "compare"
  | "review"
  | "generate"
  | "organize"
  | "recommend"
  | "reflect";

export type AssistantIntentId =
  | "create_worksheet"
  | "create_game"
  | "create_assessment"
  | "create_story"
  | "create_presentation"
  | "create_lesson"
  | "create_homework"
  | "create_revision"
  | "improve_document"
  | "differentiate"
  | "explain_with_story"
  | "bloom_questions"
  | "suggest_activities"
  | "prepare_tomorrow"
  | "recommend_resources"
  | "validate_work"
  | "reflect"
  | "summarize"
  | "translate"
  | "compare_documents"
  | "organize"
  | "general_help"
  | "workflow_guide";

export type AssistantWorkflowStage =
  | "planning"
  | "teaching"
  | "assessment"
  | "reflection"
  | "revision"
  | "portfolio"
  | "reporting";

export type AssistantConversationScope =
  | "global"
  | "project"
  | "lesson"
  | "document";

export type AssistantMessageRole = "teacher" | "assistant" | "system";

export type AssistantActor = "teacher" | "ai" | "system";

export type AssistantValidationIssue = {
  readonly id: string;
  readonly severity: "error" | "warning" | "info";
  readonly code: string;
  readonly message: string;
};

export type AssistantValidationReport = {
  readonly passed: boolean;
  readonly score: number;
  readonly issues: readonly AssistantValidationIssue[];
  readonly validatedAt: string;
};

export type AssistantToolCall = {
  readonly id: string;
  readonly tool:
    | "open_builder"
    | "create_artifact"
    | "search_resources"
    | "run_validation"
    | "remember_preference"
    | "navigate";
  readonly label: string;
  readonly href?: string;
  readonly payload?: Readonly<Record<string, string>>;
  readonly status: "proposed" | "done" | "blocked";
};

export type AssistantProactiveHint = {
  readonly id: string;
  readonly kind:
    | "improvement"
    | "inconsistency"
    | "missing_competency"
    | "resource"
    | "assessment"
    | "interdisciplinary"
    | "differentiation";
  readonly title: string;
  readonly detail: string;
  readonly href?: string;
  readonly priority: number;
};

export type AssistantContextPackage = {
  readonly teacherId: string;
  readonly teacherName: string;
  readonly projectId?: string;
  readonly projectTitle?: string;
  readonly lessonId?: string;
  readonly lessonTitle?: string;
  readonly documentId?: string;
  readonly documentKind?: string;
  readonly documentTitle?: string;
  readonly grade?: string;
  readonly subject?: string;
  readonly curriculumRef?: string;
  readonly competencies: readonly string[];
  readonly learningObjectives: readonly string[];
  readonly workflowStage: AssistantWorkflowStage;
  readonly workflowPath?: string;
  readonly preferences: Readonly<Record<string, string>>;
  readonly previousAiActions: readonly string[];
  readonly validationSummary?: string;
  readonly resourceCount: number;
  readonly relatedAssets: readonly {
    kind: string;
    id: string;
    title: string;
  }[];
  readonly locale: string;
  readonly capturedAt: string;
};

export type AssistantMessage = {
  readonly id: string;
  readonly role: AssistantMessageRole;
  readonly content: string;
  readonly createdAt: string;
  readonly intent?: AssistantIntentId;
  readonly capabilities?: readonly AssistantCapability[];
  readonly toolCalls?: readonly AssistantToolCall[];
  readonly validation?: AssistantValidationReport;
  readonly contextSnapshot?: Partial<AssistantContextPackage>;
  readonly blocked?: boolean;
};

export type AssistantConversation = {
  readonly id: string;
  readonly title: string;
  readonly scope: AssistantConversationScope;
  readonly projectId?: string;
  readonly lessonId?: string;
  readonly documentId?: string;
  readonly pinned: boolean;
  readonly archived: boolean;
  readonly summary?: string;
  readonly messages: readonly AssistantMessage[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: AssistantActor;
};

export type TeacherMemoryProfile = {
  readonly teacherId: string;
  readonly styleNotes: readonly string[];
  readonly preferredFormats: readonly string[];
  readonly favoriteResourceIds: readonly string[];
  readonly feedbackNotes: readonly string[];
  readonly frequentWorkflows: readonly string[];
  readonly projectHistory: readonly string[];
  readonly updatedAt: string;
};

export type AssistantPanelMode = "docked" | "floating" | "page";

export type AssistantViewId =
  | "chat"
  | "history"
  | "context"
  | "proactive"
  | "memory"
  | "tools";
