/**
 * IT-002 / IT-002.5 — Create Experience conversation draft toward Instructional Blueprint.
 * Section names follow INSTRUCTIONAL_BLUEPRINT_SPECIFICATION (CS-005).
 * This module does not redefine Blueprint concepts.
 */

/** Live panel sections — CS-aligned discovery surface (IT-002.5) */
export type BlueprintProgressId =
  | "learning_context"
  | "competencies"
  | "objectives"
  | "learning_flow"
  | "activities"
  | "assessment"
  | "resources"
  | "differentiation"
  | "reflection";

/** Per-section live status — one state each */
export type SectionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "needs_review";

export type BlueprintDiscoveryStatus =
  | "not_started"
  | "in_discovery"
  | "ready_for_review";

export type LearningContextDraft = {
  grade?: string;
  subject?: string;
  topic?: string;
  durationMinutes?: number;
  language?: string;
  /** Free-text situational frame from teacher */
  summary?: string;
};

export type BlueprintDraft = {
  /** Maps to Blueprint lifecycle awareness during discovery — not a new CS state */
  status: BlueprintDiscoveryStatus;
  learningContext: LearningContextDraft;
  competencies: string[];
  objectives: string[];
  learningFlow: string[];
  activities: string[];
  assessment: string[];
  resources: string[];
  differentiation: string[];
  reflection: string[];
  /** Sections that need conversational clarification */
  needsReview: Partial<Record<BlueprintProgressId, boolean>>;
};

export type ProgressSectionView = {
  id: BlueprintProgressId;
  /** Display label aligned to CS section names used in IT-002.5 */
  label: string;
  status: SectionStatus;
  /** Short one-line summary always visible */
  preview?: string;
  /** Read-only detail lines — expand when completed */
  detailLines: string[];
  /** Momentary highlight after AI update */
  highlighted: boolean;
};

export type MessageRole = "prima" | "teacher" | "system";

export type GuidedReplyParts = {
  understanding: string;
  canvasUpdate: string | null;
  whyNeeded: string;
  question: string;
};

export type ConversationMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  /** Pedagogical topic this message advances (for Prima questions) */
  topicId?: ConversationTopicId;
  /** CE-002 structured guided reply (PRIMA turns only) */
  guided?: GuidedReplyParts;
};

/**
 * Discovery topics — one question at a time.
 * Order respects Blueprint dependency orientation (Context → … → Reflection).
 */
export type ConversationTopicId =
  | "opening"
  | "learning_context"
  | "competencies"
  | "objectives"
  | "learning_flow"
  | "activities"
  | "assessment"
  | "resources"
  | "differentiation"
  | "reflection"
  | "wrap_up";

export type ConversationPhase =
  | "empty"
  | "active"
  | "streaming"
  | "error";

export type AttachmentState = {
  /** Future placeholder — no upload implementation */
  enabled: false;
  pendingCount: number;
};

export type StreamingState = {
  active: boolean;
  label: string;
};

export type BlueprintPanelLayoutMode = "sticky" | "collapsible" | "drawer";
