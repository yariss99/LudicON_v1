/**
 * Contextual Pedagogical Copilot — suggestion domain types.
 * Rule-based today; swappable for AI-backed providers without UI changes.
 */

export type SuggestionRuleId =
  | "flow_create_worksheet"
  | "flow_create_presentation"
  | "flow_create_assessment"
  | "flow_create_game"
  | "flow_create_story"
  | "lesson_create_worksheet"
  | "lesson_create_presentation"
  | "lesson_create_assessment"
  | "worksheet_transform_game"
  | "worksheet_create_presentation"
  | "assessment_remedial"
  | "presentation_classroom";

/** Stable icon key — mapped in UI so AI later can return the same keys. */
export type SuggestionIconId =
  | "worksheet"
  | "presentation"
  | "assessment"
  | "game"
  | "story"
  | "remedial"
  | "classroom";

export type ArtifactInventory = {
  projectId: string;
  projectTitle: string;
  lessonCount: number;
  worksheetCount: number;
  assessmentCount: number;
  presentationCount: number;
  gameCount: number;
  storyCount: number;
};

export type PedagogicalSuggestion = {
  id: string;
  ruleId: SuggestionRuleId;
  icon: SuggestionIconId;
  title: string;
  explanation: string;
  actionLabel: string;
  href: string;
  projectId: string;
  priority: number;
};

/**
 * Provider contract — rules today, AI later.
 * SuggestionPanel / SuggestionCard only consume PedagogicalSuggestion[].
 */
export type SuggestionProvider = {
  evaluate(inventory: ArtifactInventory | null): PedagogicalSuggestion[];
};

export type SuggestionState = {
  /** Browser-tab session id (sessionStorage). */
  sessionId: string;
  /** Dismissed suggestion ids for the current session. */
  dismissedIds: string[];
  /** Last evaluated at (ISO). */
  updatedAt: string;
};
