/**
 * AI-001 — PRIMA Reasoning Pipeline types.
 *
 * The LLM is never allowed to answer before this pipeline completes.
 * Stage 9 may only verbalize a sealed pedagogical decision.
 */

import type { GuidedReplyParts } from "../decision/services/guidedReplyComposer";
import type {
  ConfidenceMap,
  ConversationState,
  DecisionBlueprint,
  DecisionEngineState,
  DecisionTurnOutput,
  KnowledgeEngineResults,
  MemoryEnginePreferences,
  MissingInformationItem,
  NextPedagogicalAction,
} from "../decision/types";
import type { InferenceResult } from "../inference";
import type {
  PedagogicalDecision,
  ValidationResult,
} from "../validation";

/** Canonical AI-001 pipeline stages — fixed order */
export type ReasoningPipelineStageId =
  | "intent_detection"
  | "context_resolution"
  | "memory_retrieval"
  | "knowledge_validation"
  | "canvas_synchronization"
  | "pedagogical_inference"
  | "pedagogical_state_update"
  | "decision_engine"
  | "pedagogical_validation"
  | "conversation_planning"
  | "llm_response_generation";

export const REASONING_PIPELINE_ORDER: readonly ReasoningPipelineStageId[] = [
  "intent_detection",
  "context_resolution",
  "memory_retrieval",
  "knowledge_validation",
  "canvas_synchronization",
  "pedagogical_inference",
  "pedagogical_state_update",
  "decision_engine",
  "pedagogical_validation",
  "conversation_planning",
  "llm_response_generation",
] as const;

export type PedagogicalIntentKind =
  | "teaching_goal"
  | "topic"
  | "pedagogical_intention"
  | "lesson_phase"
  | "generation_request"
  | "reflection"
  | "revision"
  | "question"
  | "unknown";

export type DetectedEntities = {
  grade?: string;
  subject?: string;
  topic?: string;
  durationMinutes?: number;
  objectiveSnippet?: string;
};

/** Step 1 output */
export type IntentDetectionResult = {
  intent: PedagogicalIntentKind;
  confidence: number;
  detectedEntities: DetectedEntities;
  evidence: string;
};

/** Step 2 output */
export type ConversationContextPackage = {
  learningExperienceId: string | null;
  blueprint: DecisionBlueprint;
  teacherProfile: {
    preferredLanguage?: string;
    preferredDurationMinutes?: number;
  };
  conversation: ConversationState;
  previousDecision: NextPedagogicalAction | null;
  previousEngineState: DecisionEngineState;
};

/** Step 3 output */
export type RelevantMemoryPackage = {
  previousLessons: string[];
  preferredStrategies: string[];
  frequentlyUsedActivities: string[];
  templates: string[];
  teachingStyle: string[];
  previousRecommendations: string[];
  raw: MemoryEnginePreferences;
};

/** Step 4 output */
export type KnowledgePackage = {
  curriculum: string[];
  competencies: string[];
  objectives: string[];
  pedagogicalDependencies: string[];
  raw: KnowledgeEngineResults;
};

/** Step 5 output */
export type UpdatedLearningCanvas = {
  blueprint: DecisionBlueprint;
  updatedFields: string[];
};

export type PedagogicalFactStatus =
  | "known"
  | "inferred"
  | "required"
  | "optional"
  | "completed"
  | "needs_review";

/** Step 6 output */
export type PedagogicalStatePackage = {
  statuses: Array<{
    id: string;
    sectionId: string;
    status: PedagogicalFactStatus;
    description: string;
  }>;
  confidenceMap: ConfidenceMap;
  missingInformation: MissingInformationItem[];
};

/** Step 7 output — sealed; LLM may not mutate */
export type BestNextPedagogicalDecision = {
  readonly nextAction: NextPedagogicalAction;
  readonly shouldRecommend: boolean;
  readonly qualityIntervention: boolean;
  readonly readyForApproval: boolean;
  readonly reason: string;
};

/** Step 8 output — response structure locked before LLM */
export type ConversationPlan = {
  readonly understanding: string;
  readonly canvasUpdate: string | null;
  readonly explanation: string;
  readonly question: string;
};

/**
 * Sealed decision envelope for Stage 9.
 * Verbalizer may only produce natural language from this envelope.
 */
export type LockedPedagogicalDecision = {
  readonly sealed: true;
  readonly sealedAt: string;
  readonly decision: BestNextPedagogicalDecision;
  readonly plan: ConversationPlan;
};

export type ReasoningTraceStep = {
  stage: ReasoningPipelineStageId;
  summary: string;
  evidence?: string;
  timestamp: string;
};

export type ReasoningPipelineInput = {
  teacherMessage: string;
  conversation: ConversationState;
  blueprint: DecisionBlueprint;
  engineState: DecisionEngineState;
  previousDecision?: NextPedagogicalAction | null;
  learningExperienceId?: string | null;
  knowledge?: KnowledgeEngineResults;
  memory?: MemoryEnginePreferences;
};

export type ReasoningPipelineOutput = {
  /** Full Decision Engine turn (IT-003 compatible) */
  decision: DecisionTurnOutput;
  intent: IntentDetectionResult;
  conversationContext: ConversationContextPackage;
  memory: RelevantMemoryPackage;
  knowledge: KnowledgePackage;
  canvas: UpdatedLearningCanvas;
  /** AI-003 inference applied before Decision Engine (AI-002) */
  inference: InferenceResult;
  pedagogicalState: PedagogicalStatePackage;
  pedagogicalDecision: BestNextPedagogicalDecision;
  /** AI-002 decision validated by AI-002.5 (composition gate for Conversation Engine) */
  ai002Decision: PedagogicalDecision;
  pedagogicalValidation: ValidationResult;
  conversationPlan: ConversationPlan;
  lockedDecision: LockedPedagogicalDecision;
  /** Teacher-facing natural language — verbalized only from locked plan */
  teacherMessage: string;
  guidedReply: GuidedReplyParts;
  reasoningTrace: ReasoningTraceStep[];
  latencyMs: number;
};
