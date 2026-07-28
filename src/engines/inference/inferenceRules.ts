/**
 * AI-003 — Inference rules (MVP).
 * Explicit pedagogical rules only — no LLM, no speculation.
 */

import type { InferenceContext, InferenceRule } from "./inferenceTypes";

function hasConfirmed(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  return value != null;
}

function messageHas(ctx: InferenceContext, pattern: RegExp): boolean {
  return pattern.test(ctx.teacherMessage);
}

/**
 * Rules evaluated independently; each may contribute at most one HIGH fact.
 * Teacher data and confirmed canvas values always win (Rules 5–6).
 */
export const INFERENCE_RULES: readonly InferenceRule[] = [
  {
    id: "I1_FRACTIONS_SUBJECT",
    propose: (ctx) => {
      if (hasConfirmed(ctx.canvas.subject)) return null;
      if (
        !messageHas(
          ctx,
          /\bfractions?\b|\bfracț|\bfractii\b|\bfracții\b/i,
        )
      ) {
        return null;
      }
      return {
        field: "subject",
        value: "Mathematics",
        reason: 'Keyword "fractions"',
        ruleId: "I1_FRACTIONS_SUBJECT",
      };
    },
  },
  {
    id: "I2_CLASS_III_GRADE",
    propose: (ctx) => {
      if (hasConfirmed(ctx.canvas.grade)) return null;
      if (
        !messageHas(
          ctx,
          /\bclass\s*iii\b|\bgrade\s*iii\b|\bclasa\s*a?\s*iii\b|\ba\s*iii-a\b|\b3rd\b|\byear\s*3\b/i,
        )
      ) {
        return null;
      }
      return {
        field: "grade",
        value: "III",
        reason: 'Keyword "Class III"',
        ruleId: "I2_CLASS_III_GRADE",
      };
    },
  },
  {
    id: "I3_REVISION_PHASE",
    propose: (ctx) => {
      if (hasConfirmed(ctx.canvas.lessonPhase)) return null;
      if (!messageHas(ctx, /\brevision\b|\breviz/i)) return null;
      return {
        field: "lessonPhase",
        value: "Consolidation",
        reason: 'Keyword "Revision"',
        ruleId: "I3_REVISION_PHASE",
      };
    },
  },
  {
    id: "I4_EVALUATION_PHASE",
    propose: (ctx) => {
      if (hasConfirmed(ctx.canvas.lessonPhase)) return null;
      if (!messageHas(ctx, /\bevaluation\b|\bevaluare\b|\bevaluate\b/i)) {
        return null;
      }
      return {
        field: "lessonPhase",
        value: "Assessment",
        reason: 'Keyword "Evaluation"',
        ruleId: "I4_EVALUATION_PHASE",
      };
    },
  },
];
