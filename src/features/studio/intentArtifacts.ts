import type {
  IntentArtifact,
  IntentArtifactId,
  StudioSuggestionId,
} from "../../types/studio";

export const DEFAULT_INTENT_ARTIFACTS: IntentArtifact[] = [
  {
    id: "lesson",
    label: "Lesson",
    description: "Core learning sequence",
    included: true,
  },
  {
    id: "activities",
    label: "Activities",
    description: "Active learning moments",
    included: true,
  },
  {
    id: "worksheet",
    label: "Worksheet",
    description: "Practice and consolidation",
    included: true,
  },
  {
    id: "assessment",
    label: "Assessment",
    description: "Check for understanding",
    included: true,
  },
  {
    id: "presentation",
    label: "Presentation",
    description: "Visual teaching support",
    included: true,
  },
];

/**
 * Infer which artifacts fit the teacher's intention.
 * Teacher remains in control via Intent Panel.
 */
export function inferIntentArtifacts(
  prompt: string,
  suggestionId?: StudioSuggestionId,
): IntentArtifact[] {
  const text = prompt.toLowerCase();
  const base = DEFAULT_INTENT_ARTIFACTS.map((item) => ({ ...item }));

  const only = (ids: IntentArtifactId[]) =>
    base.map((item) => ({
      ...item,
      included: ids.includes(item.id),
    }));

  if (suggestionId === "worksheet" || /\bworksheet|fișă|fisa\b/.test(text)) {
    return only(["worksheet", "activities", "lesson"]);
  }
  if (suggestionId === "assessment" || /\bassessment|evaluare|quiz\b/.test(text)) {
    return only(["assessment", "lesson", "worksheet"]);
  }
  if (
    suggestionId === "presentation" ||
    /\bpresentation|prezentare|slides?\b/.test(text)
  ) {
    return only(["presentation", "lesson", "activities"]);
  }
  if (suggestionId === "game" || /\bgame|joc|escape\b/.test(text)) {
    return only(["activities", "lesson", "assessment"]);
  }
  if (suggestionId === "parent" || /\bnewsletter|parent|părinț|parint\b/.test(text)) {
    return only(["lesson", "presentation"]);
  }

  // Full learning experience by default
  return base;
}

export function includedArtifactIds(
  artifacts: IntentArtifact[],
): IntentArtifactId[] {
  return artifacts.filter((item) => item.included).map((item) => item.id);
}
