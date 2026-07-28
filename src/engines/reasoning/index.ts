/**
 * AI-001 — PRIMA Reasoning Pipeline (Socratic Engine entry)
 */

export {
  runReasoningPipeline,
} from "./reasoningPipeline";

export {
  REASONING_PIPELINE_ORDER,
  type ReasoningPipelineStageId,
  type ReasoningPipelineInput,
  type ReasoningPipelineOutput,
  type IntentDetectionResult,
  type ConversationContextPackage,
  type RelevantMemoryPackage,
  type KnowledgePackage,
  type UpdatedLearningCanvas,
  type PedagogicalStatePackage,
  type BestNextPedagogicalDecision,
  type ConversationPlan,
  type LockedPedagogicalDecision,
  type ReasoningTraceStep,
  type PedagogicalIntentKind,
} from "./types";

export { detectIntent } from "./stages/intentDetection";
export {
  sealPedagogicalDecision,
  verbalizeLockedDecision,
} from "./stages/llmVerbalizer";
