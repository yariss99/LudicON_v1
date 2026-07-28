/**
 * AI-002.5 — Pedagogical Validation Engine
 *
 * Validates a PedagogicalDecision before Conversation Engine verbalization.
 * Never creates or replaces decisions — only approves or rejects.
 */

import { VALIDATION_RULES } from "./validationRules";
import type {
  PedagogicalDecision,
  ValidationContext,
  ValidationIssue,
  ValidationResult,
} from "./validationTypes";

const DEV_LOG =
  typeof import.meta !== "undefined" &&
  Boolean(
    (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV,
  );

const FALLBACK_DECISION: PedagogicalDecision = {
  action: "NONE",
  reason: "Validation rejected — no approved pedagogical decision.",
};

function logValidation(
  decision: PedagogicalDecision | null | undefined,
  result: ValidationResult,
): void {
  if (!DEV_LOG) return;
  if (result.approved) {
    console.info(
      `\nDecision\n↓\nValidation\n↓\nApproved\nTRUE\n\nAction: ${decision?.action ?? "NONE"}\n`,
    );
  } else {
    const reason = result.issues[0]?.message ?? "Unknown validation issue.";
    console.info(`\nRejected\n\nReason\n\n${reason}\n`);
  }
}

/**
 * Validate a pedagogical decision. Never throws — failures return approved=false.
 */
export function validatePedagogicalDecision(
  context: ValidationContext,
): ValidationResult {
  try {
    const issues: ValidationIssue[] = [];

    for (const rule of VALIDATION_RULES) {
      const failed = rule.check(context);
      if (failed) issues.push(failed);
    }

    const approved = issues.length === 0 && context.decision != null;
    const result: ValidationResult = {
      approved,
      validatedDecision: context.decision ?? FALLBACK_DECISION,
      issues,
    };

    logValidation(context.decision, result);
    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected validation error.";
    const result: ValidationResult = {
      approved: false,
      validatedDecision: context.decision ?? FALLBACK_DECISION,
      issues: [
        {
          code: "DECISION_MISSING",
          ruleId: "V1_DECISION_EXISTS",
          message,
        },
      ],
    };
    if (DEV_LOG) {
      console.info(`\nRejected\n\nReason\n\n${message}\n`);
    }
    return result;
  }
}

/**
 * AI-003 — validate inferred facts before they enrich the Decision context.
 * Only HIGH confidence RULE facts are allowed onto the Canvas.
 */
export function validateInferredFacts(
  facts: Array<{
    field: string;
    value: unknown;
    source: string;
    confidence: string;
  }>,
): { approved: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  for (const fact of facts) {
    if (fact.source !== "RULE") {
      issues.push({
        code: "INVALID_INFERENCE",
        ruleId: "V1_DECISION_EXISTS",
        message: `Inferred fact "${fact.field}" must have source RULE.`,
      });
    }
    if (fact.confidence !== "HIGH") {
      issues.push({
        code: "INVALID_INFERENCE",
        ruleId: "V1_DECISION_EXISTS",
        message: `Inferred fact "${fact.field}" must be HIGH confidence to write to Canvas.`,
      });
    }
    if (fact.value == null || (typeof fact.value === "string" && !fact.value.trim())) {
      issues.push({
        code: "INVALID_INFERENCE",
        ruleId: "V1_DECISION_EXISTS",
        message: `Inferred fact "${fact.field}" has an empty value.`,
      });
    }
  }

  return { approved: issues.length === 0, issues };
}

export const pedagogicalValidationEngine = {
  validate: validatePedagogicalDecision,
  validateInferredFacts,
};
