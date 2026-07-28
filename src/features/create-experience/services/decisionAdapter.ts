import type {
  BlueprintSectionId,
  ConfidenceMap,
  DecisionBlueprint,
  DecisionTurnOutput,
  PedagogicalObjectiveId,
} from "../../../engines/decision";
import type {
  BlueprintDraft,
  BlueprintProgressId,
  ConversationTopicId,
  SectionStatus,
} from "../types";

const PANEL_SECTIONS: BlueprintProgressId[] = [
  "learning_context",
  "competencies",
  "objectives",
  "learning_flow",
  "activities",
  "assessment",
  "resources",
  "differentiation",
  "reflection",
];

/**
 * Maps Decision Engine blueprint → Create Experience live draft.
 * UI never owns pedagogical decisions.
 */
export function toUiDraft(
  blueprint: DecisionBlueprint,
  output?: DecisionTurnOutput | null,
): BlueprintDraft {
  const needsReview: BlueprintDraft["needsReview"] = {};
  if (output) {
    for (const id of PANEL_SECTIONS) {
      const level = output.confidenceMap[id as BlueprintSectionId]?.level;
      if (level === "low") needsReview[id] = true;
    }
  }

  return {
    status: output?.approvalRecommendation.readyForApproval
      ? "ready_for_review"
      : blueprint.learningContext.subject ||
          blueprint.objectives.length > 0
        ? "in_discovery"
        : "not_started",
    learningContext: { ...blueprint.learningContext },
    competencies: [...blueprint.competencies],
    objectives: [...blueprint.objectives],
    learningFlow: [...blueprint.learningFlow],
    activities: [...blueprint.activities],
    assessment: [...blueprint.assessment],
    resources: [...blueprint.resources],
    differentiation: [...blueprint.differentiation],
    reflection: [...blueprint.reflection],
    needsReview,
  };
}

export function objectiveToTopic(
  objectiveId: PedagogicalObjectiveId | null | undefined,
): ConversationTopicId {
  switch (objectiveId) {
    case "capture_learning_context":
      return "learning_context";
    case "capture_competencies":
      return "competencies";
    case "capture_objectives":
      return "objectives";
    case "capture_learning_flow":
      return "learning_flow";
    case "capture_activities":
      return "activities";
    case "capture_assessment":
      return "assessment";
    case "capture_resources":
      return "resources";
    case "capture_differentiation":
      return "differentiation";
    case "capture_reflection":
      return "reflection";
    case "confirm_ready":
      return "wrap_up";
    case "clarify_contradiction":
    case "clarify_low_confidence":
      return "learning_context";
    default:
      return "opening";
  }
}

export function confidenceToStatus(
  level: ConfidenceMap[BlueprintSectionId]["level"] | undefined,
  hasContent: boolean,
  isActive: boolean,
  needsReview: boolean,
): SectionStatus {
  if (needsReview || level === "low") return "needs_review";
  if (hasContent && (level === "high" || level === "medium")) return "completed";
  if (hasContent || isActive || level === "medium") return "in_progress";
  return "not_started";
}

export function decisionUpdatedToPanelIds(
  sections: BlueprintSectionId[],
): BlueprintProgressId[] {
  return sections.filter((id): id is BlueprintProgressId =>
    PANEL_SECTIONS.includes(id as BlueprintProgressId),
  );
}
