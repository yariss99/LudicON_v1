import { APPROVAL_REQUIRED_SECTIONS } from "../constants";
import type {
  ApprovalRecommendation,
  BlueprintSectionId,
  ConfidenceMap,
  DecisionBlueprint,
  ReflectionSummary,
  MissingInformationItem,
} from "../types";

/**
 * Approval Evaluator — Ready For Approval only when required sections
 * reach sufficient confidence and validation is clear.
 */
export async function evaluateApproval(input: {
  blueprint: DecisionBlueprint;
  confidenceMap: ConfidenceMap;
  missingInformation: MissingInformationItem[];
  hasContradiction: boolean;
}): Promise<ApprovalRecommendation> {
  const blocking: BlueprintSectionId[] = [];

  for (const sectionId of APPROVAL_REQUIRED_SECTIONS) {
    const level = input.confidenceMap[sectionId].level;
    if (level !== "high" && level !== "medium") {
      blocking.push(sectionId);
    }
  }

  if (input.hasContradiction && !blocking.includes("validation")) {
    blocking.push("validation");
  }

  // Structural presence for core facts
  const ctx = input.blueprint.learningContext;
  if (!ctx.subject || !ctx.grade || !ctx.topic) {
    if (!blocking.includes("learning_context")) blocking.push("learning_context");
  }
  if (input.blueprint.objectives.length === 0 && !blocking.includes("objectives")) {
    blocking.push("objectives");
  }
  if (
    input.blueprint.learningFlow.length === 0 &&
    !blocking.includes("learning_flow")
  ) {
    blocking.push("learning_flow");
  }
  if (
    input.blueprint.assessment.length === 0 &&
    !blocking.includes("assessment")
  ) {
    blocking.push("assessment");
  }
  if (
    input.blueprint.resources.length === 0 &&
    !blocking.includes("resources")
  ) {
    blocking.push("resources");
  }

  const readyForApproval = blocking.length === 0;
  const generationReadiness = readyForApproval;

  return {
    readyForApproval,
    generationReadiness,
    blockingSections: blocking,
    rationale: readyForApproval
      ? "Learning Context, Objectives, Learning Flow, Assessment, Resources, and Validation meet required confidence."
      : `Not ready — blocking: ${blocking.join(", ")}.`,
  };
}

export async function buildReflectionSummary(input: {
  missingInformation: MissingInformationItem[];
  approval: ApprovalRecommendation;
}): Promise<ReflectionSummary> {
  const whatIsKnown = input.missingInformation
    .filter((item) => item.kind === "known")
    .map((item) => item.description);
  const whatIsAssumed = input.missingInformation
    .filter((item) => item.kind === "assumed")
    .map((item) => item.description);
  const whatIsMissing = input.missingInformation
    .filter((item) => item.kind === "missing")
    .map((item) => item.description);
  const contradictions = input.missingInformation
    .filter((item) => item.kind === "contradictory")
    .map((item) => item.description);

  const narrative = [
    whatIsKnown.length
      ? `Known: ${whatIsKnown.slice(0, 3).join("; ")}.`
      : "Known: still discovering.",
    whatIsMissing.length
      ? `Missing: ${whatIsMissing.slice(0, 3).join("; ")}.`
      : "Missing: none critical.",
    input.approval.readyForApproval
      ? "Recommendation: ready for approval."
      : `Recommendation: continue — ${input.approval.rationale}`,
  ].join(" ");

  return {
    whatIsKnown,
    whatIsAssumed,
    whatIsMissing,
    contradictions,
    narrative,
  };
}
