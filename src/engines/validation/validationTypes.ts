/**
 * AI-002.5 — Pedagogical Validation Layer types.
 * Approves or rejects an existing PedagogicalDecision — never creates one.
 */

import type {
  LearningCanvas,
  PedagogicalDecision,
  PedagogicalState,
} from "../../features/create-learning-experience/decision-engine";

export type { LearningCanvas, PedagogicalDecision, PedagogicalState };

export type ValidationIssueCode =
  | "DECISION_MISSING"
  | "MULTIPLE_ACTIONS"
  | "EMPTY_REASON"
  | "INCOMPATIBLE_WITH_CANVAS"
  | "GENERATE_PRECONDITIONS"
  | "CONTRADICTS_PEDAGOGICAL_STATE"
  | "UNKNOWN_ACTION"
  | "INVALID_INFERENCE";

export type ValidationIssue = {
  code: ValidationIssueCode;
  message: string;
  ruleId: string;
};

export type ValidationContext = {
  decision: PedagogicalDecision | null | undefined;
  canvas: LearningCanvas;
  pedagogicalState: PedagogicalState;
};

export type ValidationResult = {
  approved: boolean;
  /** Echo of input decision when approved; same reference when rejected */
  validatedDecision: PedagogicalDecision;
  issues: ValidationIssue[];
};

export type ValidationRuleId =
  | "V1_DECISION_EXISTS"
  | "V2_SINGLE_ACTION"
  | "V3_REASON_PRESENT"
  | "V4_CANVAS_COMPATIBLE"
  | "V5_GENERATE_BLUEPRINT_READY"
  | "V6_STATE_CONSISTENT"
  | "V7_KNOWN_ACTION";

export type ValidationRule = {
  id: ValidationRuleId;
  /** Returns an issue when the rule fails; null when ok */
  check: (ctx: ValidationContext) => ValidationIssue | null;
};
