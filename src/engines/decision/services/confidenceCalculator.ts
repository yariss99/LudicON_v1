import type {
  BlueprintSectionId,
  ConfidenceLevel,
  ConfidenceMap,
  DecisionBlueprint,
  FieldConfidence,
} from "../types";
import { SECTION_ORDER } from "../constants";

function levelFromScore(score: number): ConfidenceLevel {
  if (score <= 0) return "unknown";
  if (score < 0.4) return "low";
  if (score < 0.75) return "medium";
  return "high";
}

function listConfidence(
  items: string[],
  assumed: boolean,
  sectionId: BlueprintSectionId,
  label: string,
): FieldConfidence {
  if (items.length === 0) {
    return {
      sectionId,
      level: "unknown",
      score: 0,
      rationale: `${label} not yet captured.`,
    };
  }
  const score = assumed ? 0.55 : items[0].length > 24 ? 0.9 : 0.78;
  return {
    sectionId,
    level: levelFromScore(score),
    score,
    rationale: assumed
      ? `${label} present via assumption — confirm if needed.`
      : `${label} captured from teacher statement.`,
  };
}

function contextConfidence(blueprint: DecisionBlueprint): FieldConfidence {
  const ctx = blueprint.learningContext;
  let score = 0;
  const parts: string[] = [];
  if (ctx.subject) {
    score += 0.3;
    parts.push("subject");
  }
  if (ctx.grade) {
    score += 0.3;
    parts.push("grade");
  }
  if (ctx.topic) {
    score += 0.3;
    parts.push("topic");
  }
  if (ctx.durationMinutes) {
    score += 0.1;
    parts.push("duration");
  }

  const assumed = (blueprint.assumptions.learning_context?.length ?? 0) > 0;
  if (assumed) score = Math.min(score, 0.6);

  return {
    sectionId: "learning_context",
    level: levelFromScore(score),
    score,
    rationale:
      parts.length === 0
        ? "Learning Context empty."
        : `Learning Context known: ${parts.join(", ")}.`,
  };
}

function validationConfidence(
  map: ConfidenceMap,
  hasContradiction: boolean,
): FieldConfidence {
  if (hasContradiction) {
    return {
      sectionId: "validation",
      level: "low",
      score: 0.2,
      rationale: "Contradictions block validation confidence.",
    };
  }

  const required: BlueprintSectionId[] = [
    "learning_context",
    "objectives",
    "learning_flow",
    "assessment",
    "resources",
  ];
  const scores = required.map((id) => map[id].score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const allMediumPlus = required.every(
    (id) => map[id].level === "high" || map[id].level === "medium",
  );

  const score = allMediumPlus ? Math.max(avg, 0.75) : avg * 0.7;
  return {
    sectionId: "validation",
    level: levelFromScore(score),
    score,
    rationale: allMediumPlus
      ? "Core sections coherent enough for validation."
      : "Validation waiting on core section confidence.",
  };
}

/**
 * Confidence Calculator — High / Medium / Low / Unknown per section.
 */
export async function calculateConfidence(input: {
  blueprint: DecisionBlueprint;
  hasContradiction: boolean;
}): Promise<ConfidenceMap> {
  const bp = input.blueprint;
  const map = {} as ConfidenceMap;

  map.learning_context = contextConfidence(bp);
  map.competencies = listConfidence(
    bp.competencies,
    (bp.assumptions.competencies?.length ?? 0) > 0,
    "competencies",
    "Competencies",
  );
  map.objectives = listConfidence(
    bp.objectives,
    (bp.assumptions.objectives?.length ?? 0) > 0,
    "objectives",
    "Objectives",
  );
  map.learning_flow = listConfidence(
    bp.learningFlow,
    (bp.assumptions.learning_flow?.length ?? 0) > 0,
    "learning_flow",
    "Learning Flow",
  );
  map.activities = listConfidence(
    bp.activities,
    (bp.assumptions.activities?.length ?? 0) > 0,
    "activities",
    "Activities",
  );
  map.assessment = listConfidence(
    bp.assessment,
    (bp.assumptions.assessment?.length ?? 0) > 0,
    "assessment",
    "Assessment",
  );
  map.resources = listConfidence(
    bp.resources,
    (bp.assumptions.resources?.length ?? 0) > 0,
    "resources",
    "Resources",
  );
  map.differentiation = listConfidence(
    bp.differentiation,
    (bp.assumptions.differentiation?.length ?? 0) > 0,
    "differentiation",
    "Differentiation",
  );
  map.reflection = listConfidence(
    bp.reflection,
    (bp.assumptions.reflection?.length ?? 0) > 0,
    "reflection",
    "Reflection",
  );
  map.validation = validationConfidence(map, input.hasContradiction);

  // Ensure every SECTION_ORDER id exists
  for (const id of SECTION_ORDER) {
    if (!map[id]) {
      map[id] = {
        sectionId: id,
        level: "unknown",
        score: 0,
        rationale: "Unknown",
      };
    }
  }

  return map;
}
