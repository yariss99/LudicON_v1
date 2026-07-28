/**
 * AI-001 Step 9 — LLM Response Generation
 *
 * The LLM may only verbalize a sealed pedagogical decision.
 * It must never change the question, objective, or canvas facts.
 */

import type { GuidedReplyParts } from "../../decision/services/guidedReplyComposer";
import type {
  ConversationPlan,
  LockedPedagogicalDecision,
} from "../types";

export function sealPedagogicalDecision(plan: ConversationPlan, decision: {
  nextAction: LockedPedagogicalDecision["decision"]["nextAction"];
  shouldRecommend: boolean;
  qualityIntervention: boolean;
  readyForApproval: boolean;
  reason: string;
}): LockedPedagogicalDecision {
  return {
    sealed: true,
    sealedAt: new Date().toISOString(),
    decision: Object.freeze({
      nextAction: decision.nextAction,
      shouldRecommend: decision.shouldRecommend,
      qualityIntervention: decision.qualityIntervention,
      readyForApproval: decision.readyForApproval,
      reason: decision.reason,
    }),
    plan: Object.freeze({ ...plan }),
  };
}

/**
 * Deterministic verbalizer (LLM-safe boundary).
 * Future LLM adapters must accept LockedPedagogicalDecision and return NL only.
 * Any attempt to alter plan.question / nextAction is rejected.
 */
export function verbalizeLockedDecision(
  locked: LockedPedagogicalDecision,
  options?: {
    /** Optional LLM-produced text — validated against sealed plan */
    llmDraft?: string;
  },
): { teacherMessage: string; guidedReply: GuidedReplyParts } {
  const plan = locked.plan;

  if (options?.llmDraft) {
    assertVerbalizationRespectsSeal(options.llmDraft, plan);
  }

  const guidedReply: GuidedReplyParts = {
    understanding: plan.understanding,
    canvasUpdate: plan.canvasUpdate,
    whyNeeded: plan.explanation,
    question: plan.question,
  };

  const teacherMessage = [
    guidedReply.understanding,
    guidedReply.canvasUpdate,
    guidedReply.whyNeeded,
    guidedReply.question,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { teacherMessage, guidedReply };
}

function assertVerbalizationRespectsSeal(
  llmDraft: string,
  plan: ConversationPlan,
): void {
  // The sealed question must appear; LLM cannot invent a different pedagogical ask.
  const normalizedDraft = llmDraft.toLowerCase();
  const sealedQuestion = plan.question.toLowerCase().replace(/\?+$/, "");
  if (!normalizedDraft.includes(sealedQuestion.slice(0, Math.min(40, sealedQuestion.length)))) {
    throw new Error(
      "AI-001 violation: LLM verbalization must not change the sealed pedagogical question.",
    );
  }
}
