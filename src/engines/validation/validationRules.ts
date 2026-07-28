/**
 * AI-002.5 — Validation rules.
 * Approve or reject only — never invent a replacement decision.
 */

import {
  allMandatoryCanvasSectionsComplete,
  type PedagogicalAction,
  type PedagogicalDecision,
} from "../../features/create-learning-experience/decision-engine";
import type {
  ValidationContext,
  ValidationIssue,
  ValidationRule,
} from "./validationTypes";

const KNOWN_ACTIONS = new Set<PedagogicalAction>([
  "ASK_GRADE",
  "LOAD_CURRICULUM",
  "LOAD_COMPETENCIES",
  "ASK_OBJECTIVES",
  "ASK_ACTIVITIES",
  "ASK_ASSESSMENT",
  "ASK_RESOURCES",
  "GENERATE_BLUEPRINT",
  "NONE",
]);

function hasText(value?: string): boolean {
  return Boolean(value && value.trim().length > 0);
}

function hasItems(list: string[]): boolean {
  return list.length > 0;
}

function issue(
  ruleId: ValidationRule["id"],
  code: ValidationIssue["code"],
  message: string,
): ValidationIssue {
  return { ruleId, code, message };
}

function sectionCompleted(
  ctx: ValidationContext,
  section: keyof NonNullable<
    ValidationContext["pedagogicalState"]["completedSections"]
  >,
): boolean {
  return Boolean(ctx.pedagogicalState.completedSections?.[section]);
}

/** Rule 4 — decision must be compatible with current canvas facts */
function canvasIncompatibility(
  ctx: ValidationContext,
): ValidationIssue | null {
  const decision = ctx.decision;
  if (!decision) return null;
  const { canvas } = ctx;

  switch (decision.action) {
    case "ASK_GRADE":
      if (hasText(canvas.grade)) {
        return issue(
          "V4_CANVAS_COMPATIBLE",
          "INCOMPATIBLE_WITH_CANVAS",
          "Canvas already contains Grade.",
        );
      }
      break;
    case "LOAD_CURRICULUM":
      if (hasText(canvas.curriculum) || ctx.pedagogicalState.curriculumLoaded) {
        return issue(
          "V4_CANVAS_COMPATIBLE",
          "INCOMPATIBLE_WITH_CANVAS",
          "Canvas already has curriculum loaded.",
        );
      }
      break;
    case "LOAD_COMPETENCIES":
      if (
        hasItems(canvas.competencies) ||
        ctx.pedagogicalState.competenciesLoaded
      ) {
        return issue(
          "V4_CANVAS_COMPATIBLE",
          "INCOMPATIBLE_WITH_CANVAS",
          "Canvas already contains competencies.",
        );
      }
      break;
    case "ASK_OBJECTIVES":
      if (hasItems(canvas.objectives)) {
        return issue(
          "V4_CANVAS_COMPATIBLE",
          "INCOMPATIBLE_WITH_CANVAS",
          "Canvas already contains objectives.",
        );
      }
      break;
    case "ASK_ACTIVITIES":
      if (hasItems(canvas.activities)) {
        return issue(
          "V4_CANVAS_COMPATIBLE",
          "INCOMPATIBLE_WITH_CANVAS",
          "Canvas already contains activities.",
        );
      }
      break;
    case "ASK_ASSESSMENT":
      if (hasItems(canvas.assessment)) {
        return issue(
          "V4_CANVAS_COMPATIBLE",
          "INCOMPATIBLE_WITH_CANVAS",
          "Canvas already contains assessment.",
        );
      }
      break;
    case "ASK_RESOURCES":
      if (hasItems(canvas.resources)) {
        return issue(
          "V4_CANVAS_COMPATIBLE",
          "INCOMPATIBLE_WITH_CANVAS",
          "Canvas already contains resources.",
        );
      }
      break;
    default:
      break;
  }
  return null;
}

/** Rule 6 — decision must not contradict pedagogical completion state */
function stateContradiction(ctx: ValidationContext): ValidationIssue | null {
  const decision = ctx.decision;
  if (!decision) return null;

  const checks: Array<{
    action: PedagogicalAction;
    completed: boolean;
    label: string;
  }> = [
    {
      action: "ASK_GRADE",
      completed: sectionCompleted(ctx, "grade") || hasText(ctx.canvas.grade),
      label: "Grade",
    },
    {
      action: "ASK_OBJECTIVES",
      completed:
        sectionCompleted(ctx, "objectives") ||
        hasItems(ctx.canvas.objectives),
      label: "Objectives",
    },
    {
      action: "ASK_ACTIVITIES",
      completed:
        sectionCompleted(ctx, "activities") ||
        hasItems(ctx.canvas.activities),
      label: "Activities",
    },
    {
      action: "ASK_ASSESSMENT",
      completed:
        sectionCompleted(ctx, "assessment") ||
        hasItems(ctx.canvas.assessment),
      label: "Assessment",
    },
    {
      action: "ASK_RESOURCES",
      completed:
        sectionCompleted(ctx, "resources") || hasItems(ctx.canvas.resources),
      label: "Resources",
    },
  ];

  for (const check of checks) {
    if (decision.action === check.action && check.completed) {
      return issue(
        "V6_STATE_CONSISTENT",
        "CONTRADICTS_PEDAGOGICAL_STATE",
        `${check.label} marked completed — cannot ${check.action}.`,
      );
    }
  }
  return null;
}

export const VALIDATION_RULES: readonly ValidationRule[] = [
  {
    id: "V1_DECISION_EXISTS",
    check: (ctx) => {
      if (ctx.decision == null) {
        return issue(
          "V1_DECISION_EXISTS",
          "DECISION_MISSING",
          "A decision must always exist.",
        );
      }
      return null;
    },
  },
  {
    id: "V2_SINGLE_ACTION",
    check: (ctx) => {
      if (ctx.decision == null) return null;
      const raw = ctx.decision as PedagogicalDecision & {
        actions?: unknown;
      };
      if (Array.isArray(raw.actions) && raw.actions.length > 0) {
        return issue(
          "V2_SINGLE_ACTION",
          "MULTIPLE_ACTIONS",
          "Only one action is allowed.",
        );
      }
      if (typeof raw.action !== "string" || raw.action.includes("|")) {
        return issue(
          "V2_SINGLE_ACTION",
          "MULTIPLE_ACTIONS",
          "Only one action is allowed.",
        );
      }
      return null;
    },
  },
  {
    id: "V3_REASON_PRESENT",
    check: (ctx) => {
      if (ctx.decision == null) return null;
      if (!hasText(ctx.decision.reason)) {
        return issue(
          "V3_REASON_PRESENT",
          "EMPTY_REASON",
          "Decision reason cannot be empty.",
        );
      }
      return null;
    },
  },
  {
    id: "V7_KNOWN_ACTION",
    check: (ctx) => {
      if (ctx.decision == null) return null;
      if (!KNOWN_ACTIONS.has(ctx.decision.action)) {
        return issue(
          "V7_KNOWN_ACTION",
          "UNKNOWN_ACTION",
          `Unknown action: ${String(ctx.decision.action)}.`,
        );
      }
      return null;
    },
  },
  {
    id: "V4_CANVAS_COMPATIBLE",
    check: canvasIncompatibility,
  },
  {
    id: "V5_GENERATE_BLUEPRINT_READY",
    check: (ctx) => {
      if (ctx.decision == null) return null;
      if (ctx.decision.action !== "GENERATE_BLUEPRINT") return null;
      if (
        !allMandatoryCanvasSectionsComplete(ctx.canvas, ctx.pedagogicalState)
      ) {
        return issue(
          "V5_GENERATE_BLUEPRINT_READY",
          "GENERATE_PRECONDITIONS",
          "GENERATE_BLUEPRINT requires all mandatory Canvas sections.",
        );
      }
      return null;
    },
  },
  {
    id: "V6_STATE_CONSISTENT",
    check: stateContradiction,
  },
];
