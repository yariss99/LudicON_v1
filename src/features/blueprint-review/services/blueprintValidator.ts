import { calculateConfidence } from "../../../engines/decision/services/confidenceCalculator";
import { detectMissingInformation } from "../../../engines/decision/services/missingInformationDetector";
import { evaluateApproval } from "../../../engines/decision/services/approvalEvaluator";
import type {
  ConfidenceMap,
  DecisionBlueprint,
} from "../../../engines/decision";
import { analyzeConsistency } from "./consistencyAnalyzer";
import type {
  ReviewSectionId,
  ReviewSectionNavStatus,
  ValidationReport,
  ValidationStatus,
} from "../types";
import { REVIEW_SECTIONS } from "../constants";

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function statusFromScores(
  completeness: number,
  confidence: number,
  ready: boolean,
  hasBlocking: boolean,
): ValidationStatus {
  if (hasBlocking || completeness < 0.45) return "incomplete";
  if (!ready || confidence < 0.65) return "needs_review";
  if (ready && confidence >= 0.85 && completeness >= 0.9) return "excellent";
  return "good";
}

function sectionHasContent(
  blueprint: DecisionBlueprint,
  id: ReviewSectionId,
): boolean {
  switch (id) {
    case "learning_context": {
      const ctx = blueprint.learningContext;
      return Boolean(ctx.subject && ctx.grade && ctx.topic);
    }
    case "competencies":
      return blueprint.competencies.length > 0;
    case "objectives":
      return blueprint.objectives.length > 0;
    case "learning_flow":
      return blueprint.learningFlow.length > 0;
    case "activities":
      return blueprint.activities.length > 0;
    case "assessment":
      return blueprint.assessment.length > 0;
    case "resources":
      return blueprint.resources.length > 0;
    case "differentiation":
      return blueprint.differentiation.length > 0;
    case "reflection":
      return blueprint.reflection.length > 0;
  }
}

/**
 * BlueprintValidator — review-time validation. Never regenerates Blueprint content.
 */
export async function validateBlueprint(input: {
  blueprint: DecisionBlueprint;
  confidenceMap?: ConfidenceMap | null;
}): Promise<ValidationReport> {
  const consistency = await analyzeConsistency(input.blueprint);
  const confidenceMap =
    input.confidenceMap ??
    (await calculateConfidence({
      blueprint: input.blueprint,
      hasContradiction: !consistency.ok,
    }));

  const missingInformation = await detectMissingInformation({
    blueprint: input.blueprint,
    confidenceMap,
    consistency: {
      ok: consistency.ok,
      contradictions: consistency.issues
        .filter((i) => i.severity === "blocking")
        .map((i) => ({
          id: i.id,
          sectionId:
            i.sectionId === "validation" ? "validation" : i.sectionId,
          kind: "contradictory" as const,
          description: i.explanation,
        })),
      notes: consistency.notes,
    },
  });

  const approval = await evaluateApproval({
    blueprint: input.blueprint,
    confidenceMap,
    missingInformation,
    hasContradiction: !consistency.ok,
  });

  const filled = REVIEW_SECTIONS.filter((s) =>
    sectionHasContent(input.blueprint, s.id),
  ).length;
  const overallCompleteness = clamp01(filled / REVIEW_SECTIONS.length);

  const scores = REVIEW_SECTIONS.map(
    (s) => confidenceMap[s.id]?.score ?? 0,
  );
  const confidenceScore = clamp01(
    scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1),
  );

  const issues = [...consistency.issues];

  for (const item of missingInformation.filter((m) => m.kind === "missing")) {
    if (item.sectionId === "validation") continue;
    issues.push({
      id: item.id,
      sectionId: item.sectionId as ReviewSectionId,
      severity: "blocking",
      title: "Missing information",
      explanation: item.description,
    });
  }

  for (const item of missingInformation.filter((m) => m.kind === "assumed")) {
    if (item.sectionId === "validation") continue;
    issues.push({
      id: item.id,
      sectionId: item.sectionId as ReviewSectionId,
      severity: "warning",
      title: "Assumed — confirm in conversation",
      explanation: item.description,
    });
  }

  const blockingReasons = [
    ...approval.blockingSections.map(
      (id) => `${id} does not meet required confidence`,
    ),
    ...issues
      .filter((i) => i.severity === "blocking")
      .map((i) => i.explanation),
  ];

  const uniqueBlocking = [...new Set(blockingReasons)];

  return {
    status: statusFromScores(
      overallCompleteness,
      confidenceScore,
      approval.readyForApproval,
      uniqueBlocking.length > 0 || !consistency.ok,
    ),
    overallCompleteness,
    consistencyOk: consistency.ok,
    confidenceScore,
    issues,
    missingInformation,
    readyForApproval: approval.readyForApproval && consistency.ok,
    blockingReasons: uniqueBlocking,
    validatedAt: new Date().toISOString(),
  };
}

export function sectionNavStatus(
  blueprint: DecisionBlueprint,
  confidenceMap: ConfidenceMap,
  sectionId: ReviewSectionId,
  validation: ValidationReport | null,
): ReviewSectionNavStatus {
  const hasBlocking = Boolean(
    validation?.issues.some(
      (i) => i.sectionId === sectionId && i.severity === "blocking",
    ),
  );
  const level = confidenceMap[sectionId]?.level;
  if (hasBlocking || level === "low") return "needs_review";
  if (sectionHasContent(blueprint, sectionId) && (level === "high" || level === "medium")) {
    return "completed";
  }
  if (sectionHasContent(blueprint, sectionId)) return "needs_review";
  return "incomplete";
}

export { sectionHasContent };
