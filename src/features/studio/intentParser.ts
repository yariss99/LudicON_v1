import type { ProjectColorId, ProjectIconId } from "../../types/project";
import type {
  IntentArtifactId,
  ParsedStudioIntent,
  StudioSuggestionId,
} from "../../types/studio";
import {
  includedArtifactIds,
  inferIntentArtifacts,
} from "./intentArtifacts";

const SUBJECT_PATTERNS: Array<{
  match: RegExp;
  subject: string;
  icon: ProjectIconId;
  color: ProjectColorId;
}> = [
  {
    match: /\b(math|mathematics|matematic[aă]|fractions?|fracț)/i,
    subject: "Matematică",
    icon: "calculator",
    color: "blue",
  },
  {
    match: /\b(science|științe|stiinte|stem|biology|photosynthesis|plants?)/i,
    subject: "Științe",
    icon: "flask",
    color: "emerald",
  },
  {
    match: /\b(romanian|limba român[aă]|grammar|gramatic|reading|story)/i,
    subject: "Limba română",
    icon: "book",
    color: "amber",
  },
  {
    match: /\b(english|englez)/i,
    subject: "Limba engleză",
    icon: "globe",
    color: "sky",
  },
  {
    match: /\b(history|istorie)/i,
    subject: "Istorie",
    icon: "landmark",
    color: "violet",
  },
  {
    match: /\b(geography|geografie)/i,
    subject: "Geografie",
    icon: "globe",
    color: "teal",
  },
  {
    match: /\b(art|plastic|music|muzic)/i,
    subject: "Educație plastică",
    icon: "palette",
    color: "rose",
  },
];

const GRADE_PATTERNS: Array<{ match: RegExp; grade: string }> = [
  {
    match: /\b(grade|class|clasa)\s*(prep|pregătitoare|0)\b/i,
    grade: "Clasa pregătitoare",
  },
  { match: /\b(grade|class|clasa)\s*(1|i|one)\b/i, grade: "Clasa I" },
  {
    match: /\b(grade|class|clasa)\s*(2|ii|two|a\s*ii-a)\b/i,
    grade: "Clasa a II-a",
  },
  {
    match: /\b(grade|class|clasa)\s*(3|iii|three|a\s*iii-a)\b/i,
    grade: "Clasa a III-a",
  },
  {
    match: /\b(grade|class|clasa)\s*(4|iv|four|a\s*iv-a)\b/i,
    grade: "Clasa a IV-a",
  },
  {
    match: /\b(grade|class|clasa)\s*(5|v|five|a\s*v-a)\b/i,
    grade: "Clasa a V-a",
  },
  {
    match: /\b(grade|class|clasa)\s*(6|vi|six|a\s*vi-a)\b/i,
    grade: "Clasa a VI-a",
  },
  {
    match: /\b(grade|class|clasa)\s*(7|vii|seven|a\s*vii-a)\b/i,
    grade: "Clasa a VII-a",
  },
  {
    match: /\b(grade|class|clasa)\s*(8|viii|eight|a\s*viii-a)\b/i,
    grade: "Clasa a VIII-a",
  },
];

function titleFromPrompt(
  prompt: string,
  suggestionId?: StudioSuggestionId,
): string {
  const cleaned = prompt
    .replace(
      /^(create|build|design|make|write|prepare|i want|help)\s+(a|an|the|my|me)?\s*/i,
      "",
    )
    .replace(/\.$/, "")
    .trim();

  if (cleaned.length >= 8 && cleaned.length <= 80) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  switch (suggestionId) {
    case "worksheet":
      return "Differentiated practice";
    case "presentation":
      return "Visual teaching support";
    case "assessment":
      return "Formative assessment";
    case "game":
      return "Learning through play";
    case "scenario":
      return "Learning scenario";
    case "story":
      return "Educational story";
    case "parent":
      return "Parent newsletter";
    case "lesson":
    default:
      return "New learning experience";
  }
}

/**
 * Parse natural language into a studio intent.
 * Artifacts can be overridden by the Intent Panel.
 */
export function parseStudioIntent(
  prompt: string,
  suggestionId?: StudioSuggestionId,
  artifacts?: IntentArtifactId[],
): ParsedStudioIntent {
  const text = prompt.trim();
  const subjectHit = SUBJECT_PATTERNS.find((item) => item.match.test(text));
  const gradeHit = GRADE_PATTERNS.find((item) => item.match.test(text));
  const inferred = includedArtifactIds(
    inferIntentArtifacts(text, suggestionId),
  );

  return {
    prompt: text,
    title: titleFromPrompt(text, suggestionId),
    subject: subjectHit?.subject ?? "Alte discipline",
    grade: gradeHit?.grade ?? "Clasa a III-a",
    description: text,
    color: subjectHit?.color ?? "indigo",
    icon: subjectHit?.icon ?? "lightbulb",
    suggestionId,
    artifacts: artifacts && artifacts.length > 0 ? artifacts : inferred,
  };
}
