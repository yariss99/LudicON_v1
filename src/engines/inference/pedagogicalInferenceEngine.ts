/**
 * AI-003 — Pedagogical Inference Engine (MVP)
 *
 * Safely infers pedagogical facts from teacher input + Learning Canvas.
 * Never invents. Only HIGH confidence RULE facts update the Canvas.
 */

import { evaluateInferenceRules } from "./inferenceEvaluator";
import type { InferenceContext, InferenceResult, InferredFact } from "./inferenceTypes";

const DEV_LOG =
  typeof import.meta !== "undefined" &&
  Boolean(
    (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV,
  );

function logInference(fact: InferredFact): void {
  if (!DEV_LOG) return;
  // Development-only — Rule 7
  console.info(
    `\n${fact.field}\n↓\n${String(fact.value)}\n↓\nReason\n${fact.reason}\n↓\nConfidence HIGH\n`,
  );
}

/**
 * Run pedagogical inference. Decision Engine must consume updatedCanvas.
 */
export function runPedagogicalInference(
  context: InferenceContext,
): InferenceResult {
  const result = evaluateInferenceRules(context);
  for (const fact of result.inferredFacts) {
    logInference(fact);
  }
  return result;
}

export const pedagogicalInferenceEngine = {
  infer: runPedagogicalInference,
};
