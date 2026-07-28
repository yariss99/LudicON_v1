import type { PedagogicalObjectiveId } from "../../../engines/decision";
import type { ReviewSectionId } from "../types";

export type ReviewIntent = {
  sectionId: ReviewSectionId;
  objectiveId: PedagogicalObjectiveId;
  /** Teacher-facing statement routed into Decision Engine (not a form edit) */
  decisionMessage: string;
  summary: string;
};

/**
 * Maps natural-language review requests to a single Decision Engine objective.
 * Review UI never mutates Blueprint sections directly.
 */
export function parseReviewIntent(
  message: string,
  blueprint: {
    objectives: string[];
    activities: string[];
    assessment: string[];
    learningFlow: string[];
    resources: string[];
    competencies: string[];
    differentiation: string[];
    reflection: string[];
    learningContext: { topic?: string; subject?: string };
  },
): ReviewIntent {
  const text = message.trim();
  const lower = text.toLowerCase();
  const topic = blueprint.learningContext.topic ?? "the topic";

  if (/objective/i.test(lower)) {
    const base =
      blueprint.objectives[0] ?? `Demonstrate understanding of ${topic}`;
    const improved = /improve|clearer|better/i.test(lower)
      ? `Students can ${base.replace(/^students can\s+/i, "")} and show it with a concrete example.`
      : text.length > 12
        ? text
        : base;
    return {
      sectionId: "objectives",
      objectiveId: "capture_objectives",
      decisionMessage: improved,
      summary: "Refined Learning Objectives via Decision Engine",
    };
  }

  if (/activit/i.test(lower)) {
    const base =
      blueprint.activities[0] ?? `Explore ${topic} with concrete materials`;
    const improved = /collaborat|pair|group|together/i.test(lower)
      ? `In pairs, students ${base.replace(/^in pairs,?\s*/i, "")}`
      : /improve|better/i.test(lower)
        ? `Students actively ${base}`
        : text.length > 12
          ? text
          : base;
    return {
      sectionId: "activities",
      objectiveId: "capture_activities",
      decisionMessage: improved,
      summary: "Refined Learning Activities via Decision Engine",
    };
  }

  if (/assess|formative|summative/i.test(lower)) {
    const base =
      blueprint.assessment[0] ?? `Check understanding of ${topic}`;
    const improved = /formative/i.test(lower)
      ? `Formative check during the lesson: ${base.replace(/^formative check during the lesson:\s*/i, "")}`
      : text.length > 12
        ? text
        : base;
    return {
      sectionId: "assessment",
      objectiveId: "capture_assessment",
      decisionMessage: improved,
      summary: "Refined Assessment via Decision Engine",
    };
  }

  if (/flow|phase|sequence/i.test(lower)) {
    const base =
      blueprint.learningFlow[0] ?? "warm-up → explore → practise → close";
    return {
      sectionId: "learning_flow",
      objectiveId: "capture_learning_flow",
      decisionMessage: /improve/i.test(lower) ? base : text,
      summary: "Refined Learning Flow via Decision Engine",
    };
  }

  if (/resource|material|tool/i.test(lower)) {
    return {
      sectionId: "resources",
      objectiveId: "capture_resources",
      decisionMessage: text,
      summary: "Refined Resources via Decision Engine",
    };
  }

  if (/differentiat|support|extension|sen/i.test(lower)) {
    return {
      sectionId: "differentiation",
      objectiveId: "capture_differentiation",
      decisionMessage: text,
      summary: "Refined Differentiation via Decision Engine",
    };
  }

  if (/reflect/i.test(lower)) {
    return {
      sectionId: "reflection",
      objectiveId: "capture_reflection",
      decisionMessage: text,
      summary: "Refined Reflection via Decision Engine",
    };
  }

  if (/competenc/i.test(lower)) {
    return {
      sectionId: "competencies",
      objectiveId: "capture_competencies",
      decisionMessage: text,
      summary: "Refined Competencies via Decision Engine",
    };
  }

  return {
    sectionId: "learning_context",
    objectiveId: "capture_learning_context",
    decisionMessage: text,
    summary: "Updated Learning Context via Decision Engine",
  };
}
