import type { ConfidenceMap } from "../../../engines/decision";
import type {
  BlueprintDraft,
  ConversationTopicId,
  GuidedReplyParts,
} from "../types";

export type CanvasSectionId =
  | "topic"
  | "subject"
  | "grade"
  | "curriculum"
  | "general_competencies"
  | "specific_competencies"
  | "learning_objectives"
  | "learning_activities"
  | "assessment"
  | "resources"
  | "differentiation"
  | "accessibility"
  | "digital_integration"
  | "generated_assets";

export type CanvasSectionState =
  | "unknown"
  | "detected"
  | "in_progress"
  | "completed"
  | "needs_review";

export type UnderstandingLevel =
  | "excellent"
  | "good"
  | "needs_one_detail"
  | "needs_clarification";

export type CanvasSectionView = {
  id: CanvasSectionId;
  label: string;
  lines: string[];
  state: CanvasSectionState;
  /** Momentary “New” after canvas update */
  isNew: boolean;
  /** Momentary “✓ Inferred” after AI-003 inference */
  isInferred: boolean;
  /** Critical gap for the current turn only */
  criticalMissing: boolean;
};

export type CanvasCurrentQuestion = {
  question: string;
  why: string;
};

export type CanvasMilestone = {
  id: string;
  label: string;
};

export type IntelligentCanvasView = {
  sections: CanvasSectionView[];
  understanding: UnderstandingLevel;
  currentQuestion: CanvasCurrentQuestion | null;
  nextMilestone: CanvasMilestone;
  hasContent: boolean;
};

export type BuildCanvasInput = {
  draft: BlueprintDraft;
  currentTopic: ConversationTopicId;
  confidenceMap?: ConfidenceMap | null;
  guided?: GuidedReplyParts | null;
  newlyUpdatedIds?: ReadonlySet<CanvasSectionId>;
  inferredIds?: ReadonlySet<CanvasSectionId>;
};
