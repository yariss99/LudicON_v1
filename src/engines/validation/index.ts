/**
 * AI-002.5 — Pedagogical Validation Layer
 *
 * Sits between Decision Engine and Conversation Engine.
 * Approves or rejects — never invents the next action.
 */

export {
  validatePedagogicalDecision,
  validateInferredFacts,
  pedagogicalValidationEngine,
} from "./pedagogicalValidationEngine";

export { VALIDATION_RULES } from "./validationRules";

export type {
  ValidationContext,
  ValidationResult,
  ValidationIssue,
  ValidationIssueCode,
  ValidationRule,
  ValidationRuleId,
  LearningCanvas,
  PedagogicalDecision,
  PedagogicalState,
} from "./validationTypes";
