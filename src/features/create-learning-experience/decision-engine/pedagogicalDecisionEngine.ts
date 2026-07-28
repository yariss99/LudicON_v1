/**
 * AI-002 — Pedagogical Decision Engine (MVP)
 *
 * Determines the single highest-value pedagogical action after every
 * Learning Canvas update. Does not generate text. Does not talk to teachers.
 * Conversation Engine verbalizes the returned decision.
 */

import { evaluateDecisionRules } from "./decisionEvaluator";
import type { DecisionContext, PedagogicalDecision } from "./decisionTypes";

const DEV_LOG =
  typeof import.meta !== "undefined" &&
  Boolean(
    (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV,
  );

function logDecision(decision: PedagogicalDecision): void {
  if (!DEV_LOG) return;
  // Development-only — remove or gate before production hardening.
  console.info(
    `\nDecision:\n${decision.action}\n\nReason:\n${decision.reason}\n`,
  );
}

/**
 * Return exactly one PedagogicalDecision for the given context.
 */
export function decidePedagogicalAction(
  context: DecisionContext,
): PedagogicalDecision {
  const { decision } = evaluateDecisionRules(context);
  logDecision(decision);
  return decision;
}

/** Alias matching the module name in the AI-002 brief */
export const pedagogicalDecisionEngine = {
  decide: decidePedagogicalAction,
};
