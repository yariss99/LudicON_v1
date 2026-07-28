/**
 * AI-002 — Pedagogical Decision Engine (MVP)
 *
 * Isolated, rule-based. Does not generate text.
 * Conversation Engine verbalizes PedagogicalDecision.
 */

export {
  decidePedagogicalAction,
  pedagogicalDecisionEngine,
  evaluateDecisionRules,
  DECISION_RULES,
  allMandatoryCanvasSectionsComplete,
} from "./decision-engine";

export type {
  LearningCanvas,
  PedagogicalState,
  ConversationContext,
  DecisionContext,
  PedagogicalAction,
  PedagogicalDecision,
  DecisionRule,
  DecisionRuleId,
} from "./decision-engine";
