/**
 * AI-003 — Pedagogical Inference Engine (MVP)
 */

export {
  runPedagogicalInference,
  pedagogicalInferenceEngine,
} from "./pedagogicalInferenceEngine";

export { evaluateInferenceRules } from "./inferenceEvaluator";
export { INFERENCE_RULES } from "./inferenceRules";

export type {
  InferenceContext,
  InferenceResult,
  InferredFact,
  InferenceConfidence,
  InferenceRule,
  InferenceRuleId,
  InferenceCandidate,
  LearningCanvas,
  PedagogicalState,
  ConversationContext,
} from "./inferenceTypes";
