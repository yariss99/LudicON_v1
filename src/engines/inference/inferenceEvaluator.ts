/**
 * AI-003 — Inference evaluator.
 * Applies only HIGH confidence facts; never overwrites confirmed values.
 */

import { INFERENCE_RULES } from "./inferenceRules";
import type {
  InferenceContext,
  InferenceResult,
  InferredFact,
  LearningCanvas,
} from "./inferenceTypes";

function isConfirmed(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  return value != null;
}

function readField(canvas: LearningCanvas, field: string): unknown {
  switch (field) {
    case "topic":
      return canvas.topic;
    case "subject":
      return canvas.subject;
    case "grade":
      return canvas.grade;
    case "lessonPhase":
      return canvas.lessonPhase;
    case "curriculum":
      return canvas.curriculum;
    default:
      return undefined;
  }
}

function writeField(
  canvas: LearningCanvas,
  field: string,
  value: unknown,
): LearningCanvas {
  const text = value == null ? undefined : String(value);
  switch (field) {
    case "topic":
      return { ...canvas, topic: text };
    case "subject":
      return { ...canvas, subject: text };
    case "grade":
      return { ...canvas, grade: text };
    case "lessonPhase":
      return { ...canvas, lessonPhase: text };
    case "curriculum":
      return { ...canvas, curriculum: text };
    default:
      return canvas;
  }
}

/**
 * Pure evaluation — proposes and applies HIGH facts under Rules 5–6.
 */
export function evaluateInferenceRules(
  context: InferenceContext,
): InferenceResult {
  const facts: InferredFact[] = [];
  let updatedCanvas: LearningCanvas = {
    ...context.canvas,
    competencies: [...context.canvas.competencies],
    objectives: [...context.canvas.objectives],
    activities: [...context.canvas.activities],
    assessment: [...context.canvas.assessment],
    resources: [...context.canvas.resources],
  };

  for (const rule of INFERENCE_RULES) {
    const candidate = rule.propose({
      ...context,
      canvas: updatedCanvas,
    });
    if (!candidate) continue;

    // Rule 5–6: never overwrite teacher-provided / confirmed canvas values
    if (isConfirmed(readField(updatedCanvas, candidate.field))) {
      continue;
    }

    const fact: InferredFact = {
      field: candidate.field,
      value: candidate.value,
      source: "RULE",
      confidence: "HIGH",
      reason: candidate.reason,
      ruleId: candidate.ruleId,
    };

    facts.push(fact);
    updatedCanvas = writeField(updatedCanvas, candidate.field, candidate.value);
  }

  const confidence =
    facts.length > 0 ? "HIGH" : ("LOW" as InferenceResult["confidence"]);

  return {
    updatedCanvas,
    inferredFacts: facts,
    confidence,
  };
}
