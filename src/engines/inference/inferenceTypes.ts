/**
 * AI-003 — Pedagogical Inference Engine (MVP) types.
 * Rule-based only. Never invents. Only HIGH confidence writes to Canvas.
 */

import type {
  ConversationContext,
  LearningCanvas,
  PedagogicalState,
} from "../../features/create-learning-experience/decision-engine";

export type { ConversationContext, LearningCanvas, PedagogicalState };

export type InferenceConfidence = "HIGH" | "MEDIUM" | "LOW";

export type InferredFact = {
  field: string;
  value: unknown;
  source: "RULE";
  confidence: "HIGH";
  /** Human-readable pedagogical reason for logging / explainability */
  reason: string;
  ruleId: InferenceRuleId;
};

export type InferenceContext = {
  teacherMessage: string;
  canvas: LearningCanvas;
  pedagogicalState: PedagogicalState;
  conversationContext: ConversationContext;
};

export type InferenceResult = {
  updatedCanvas: LearningCanvas;
  inferredFacts: InferredFact[];
  confidence: InferenceConfidence;
};

export type InferenceRuleId =
  | "I1_FRACTIONS_SUBJECT"
  | "I2_CLASS_III_GRADE"
  | "I3_REVISION_PHASE"
  | "I4_EVALUATION_PHASE";

export type InferenceCandidate = {
  field: string;
  value: unknown;
  reason: string;
  ruleId: InferenceRuleId;
};

export type InferenceRule = {
  id: InferenceRuleId;
  /** Propose a HIGH-confidence candidate, or null if rule does not apply */
  propose: (ctx: InferenceContext) => InferenceCandidate | null;
};
