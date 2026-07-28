/**
 * AI-002 — Pedagogical Decision Engine (MVP)
 * Isolated rule-based decisions for Create Learning Experience.
 */

export {
  decidePedagogicalAction,
  pedagogicalDecisionEngine,
} from "./pedagogicalDecisionEngine";

export { evaluateDecisionRules } from "./decisionEvaluator";
export { DECISION_RULES, allMandatoryCanvasSectionsComplete } from "./decisionRules";

export type {
  LearningCanvas,
  PedagogicalState,
  ConversationContext,
  DecisionContext,
  PedagogicalAction,
  PedagogicalDecision,
  DecisionRule,
  DecisionRuleId,
} from "./decisionTypes";
