import type {
  ArtifactInventory,
  PedagogicalSuggestion,
  SuggestionIconId,
  SuggestionRuleId,
} from "../suggestionTypes";

export type SuggestionRule = {
  id: SuggestionRuleId;
  icon: SuggestionIconId;
  title: string;
  explanation: string;
  actionLabel: string;
  priority: number;
  /** Returns true when this rule should fire for the inventory. */
  matches: (inventory: ArtifactInventory) => boolean;
  /** Build navigation target for the primary action. */
  href: (inventory: ArtifactInventory) => string;
};

function createIntent(
  projectId: string,
  type: string,
  source: string = "blank",
) {
  return `/create?type=${type}&project=${projectId}&source=${source}`;
}

/**
 * SuggestionRegistry — aligned with End-to-End Teaching Flow (Mission 005):
 * Lesson → Worksheet → Presentation → Assessment → Game → Story
 */
export const SuggestionRegistry: readonly SuggestionRule[] = [
  {
    id: "flow_create_worksheet",
    icon: "worksheet",
    title: "Create Worksheet",
    explanation:
      "Your lesson is ready. Continue the teaching flow with practice.",
    actionLabel: "Create worksheet",
    priority: 100,
    matches: (i) => i.lessonCount > 0 && i.worksheetCount === 0,
    href: (i) => createIntent(i.projectId, "worksheet", "lesson"),
  },
  {
    id: "flow_create_presentation",
    icon: "presentation",
    title: "Create Presentation",
    explanation:
      "Practice is in place — add slides for whole-class teaching.",
    actionLabel: "Create presentation",
    priority: 90,
    matches: (i) =>
      i.lessonCount > 0 &&
      i.worksheetCount > 0 &&
      i.presentationCount === 0,
    href: (i) => createIntent(i.projectId, "presentation", "lesson"),
  },
  {
    id: "flow_create_assessment",
    icon: "assessment",
    title: "Create Assessment",
    explanation: "Check understanding after teaching and practice.",
    actionLabel: "Create assessment",
    priority: 85,
    matches: (i) =>
      i.presentationCount > 0 && i.assessmentCount === 0,
    href: (i) => createIntent(i.projectId, "assessment", "worksheet"),
  },
  {
    id: "flow_create_game",
    icon: "game",
    title: "Create Game",
    explanation:
      "Assessment is ready — transform practice into a classroom game.",
    actionLabel: "Create game",
    priority: 75,
    matches: (i) => i.assessmentCount > 0 && i.gameCount === 0,
    href: (i) => createIntent(i.projectId, "game", "worksheet"),
  },
  {
    id: "flow_create_story",
    icon: "story",
    title: "Create Story",
    explanation:
      "Complete the teaching flow with an interactive narrative.",
    actionLabel: "Create story",
    priority: 65,
    matches: (i) => i.gameCount > 0 && i.storyCount === 0,
    href: (i) => createIntent(i.projectId, "story", "game"),
  },
] as const;

export function materializeSuggestion(
  rule: SuggestionRule,
  inventory: ArtifactInventory,
): PedagogicalSuggestion {
  return {
    id: `${rule.id}:${inventory.projectId}`,
    ruleId: rule.id,
    icon: rule.icon,
    title: rule.title,
    explanation: rule.explanation,
    actionLabel: rule.actionLabel,
    href: rule.href(inventory),
    projectId: inventory.projectId,
    priority: rule.priority,
  };
}
