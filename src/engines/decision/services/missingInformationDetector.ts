import type {
  ConfidenceMap,
  DecisionBlueprint,
  MissingInformationItem,
} from "../types";
import type { ConsistencyResult } from "./consistencyValidator";

/**
 * Missing Information Detector — Known / Assumed / Missing / Contradictory.
 */
export async function detectMissingInformation(input: {
  blueprint: DecisionBlueprint;
  confidenceMap: ConfidenceMap;
  consistency: ConsistencyResult;
}): Promise<MissingInformationItem[]> {
  const items: MissingInformationItem[] = [];
  const bp = input.blueprint;
  const ctx = bp.learningContext;

  const pushMissing = (
    sectionId: MissingInformationItem["sectionId"],
    field: string,
    description: string,
  ) => {
    items.push({
      id: `missing_${sectionId}_${field}`,
      sectionId,
      kind: "missing",
      field,
      description,
    });
  };

  if (!ctx.subject) {
    pushMissing("learning_context", "subject", "Subject is missing.");
  } else {
    items.push({
      id: "known_subject",
      sectionId: "learning_context",
      kind: "known",
      field: "subject",
      description: `Subject known: ${ctx.subject}`,
    });
  }

  if (!ctx.grade) {
    pushMissing("learning_context", "grade", "Grade band is missing.");
  } else {
    items.push({
      id: "known_grade",
      sectionId: "learning_context",
      kind: "known",
      field: "grade",
      description: `Grade known: ${ctx.grade}`,
    });
  }

  if (!ctx.topic) {
    pushMissing("learning_context", "topic", "Topic is missing.");
  } else {
    items.push({
      id: "known_topic",
      sectionId: "learning_context",
      kind: "known",
      field: "topic",
      description: `Topic known: ${ctx.topic}`,
    });
  }

  if ((bp.assumptions.learning_context?.length ?? 0) > 0) {
    for (const assumption of bp.assumptions.learning_context ?? []) {
      items.push({
        id: `assumed_context_${assumption.slice(0, 24)}`,
        sectionId: "learning_context",
        kind: "assumed",
        description: assumption,
      });
    }
  }

  if ((bp.assumptions.competencies?.length ?? 0) > 0) {
    items.push({
      id: "assumed_competency",
      sectionId: "competencies",
      kind: "assumed",
      description: bp.assumptions.competencies![0],
    });
  }

  if (bp.objectives.length === 0) {
    pushMissing("objectives", "objectives", "Objectives are missing.");
  } else {
    items.push({
      id: "known_objectives",
      sectionId: "objectives",
      kind: "known",
      description: `Objectives known (${bp.objectives.length}).`,
    });
  }

  if (bp.learningFlow.length === 0) {
    pushMissing("learning_flow", "learningFlow", "Learning Flow is missing.");
  }

  if (bp.assessment.length === 0) {
    pushMissing("assessment", "assessment", "Assessment approach is missing.");
  }

  if (bp.resources.length === 0) {
    pushMissing("resources", "resources", "Resources are missing.");
  }

  // Low confidence → treat as needing attention (not necessarily missing)
  for (const [sectionId, field] of Object.entries(input.confidenceMap)) {
    if (field.level === "low") {
      items.push({
        id: `low_confidence_${sectionId}`,
        sectionId: sectionId as MissingInformationItem["sectionId"],
        kind: "assumed",
        description: `Low confidence: ${field.rationale}`,
      });
    }
  }

  items.push(...input.consistency.contradictions);

  return items;
}
