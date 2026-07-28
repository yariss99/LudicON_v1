/**
 * AI-002 — Decision evaluator.
 * Evaluates rules top to bottom; first match wins; stops immediately.
 */

import { DECISION_RULES } from "./decisionRules";
import type {
  DecisionContext,
  DecisionRule,
  PedagogicalDecision,
} from "./decisionTypes";

export type EvaluationResult = {
  decision: PedagogicalDecision;
  matchedRule: DecisionRule | null;
};

/**
 * Pure evaluation — no side effects, no logging, no text generation.
 */
export function evaluateDecisionRules(
  context: DecisionContext,
): EvaluationResult {
  for (const rule of DECISION_RULES) {
    if (rule.matches(context)) {
      return {
        decision: {
          action: rule.action,
          reason: rule.reason,
        },
        matchedRule: rule,
      };
    }
  }

  return {
    decision: {
      action: "NONE",
      reason: "No pedagogical action required from current canvas state.",
    },
    matchedRule: null,
  };
}
