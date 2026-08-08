/**
 * P.R.R.I.M.A. Copilot v0.1 — contextual suggestion domain.
 * Rule-based today; engine is swappable for AI later without UI changes.
 */

export type SuggestionIconId =
  | "worksheet"
  | "presentation"
  | "assessment"
  | "remedial"
  | "story"
  | "game";

/** Snapshot of studio artifacts for a project. */
export type CopilotArtifactSnapshot = {
  projectId: string;
  projectTitle: string;
  lessonCount: number;
  worksheetCount: number;
  assessmentCount: number;
  presentationCount: number;
  gameCount: number;
  storyCount: number;
};

export type CopilotEvaluationContext = {
  snapshot: CopilotArtifactSnapshot | null;
  route: string;
};

/** Payload produced by a rule's action() — no UI coupling. */
export type SuggestionAction = {
  title: string;
  explanation: string;
  actionLabel: string;
  href: string;
  icon: SuggestionIconId;
};

/**
 * SuggestionRule — declarative pedagogical opportunity.
 * condition() decides; action() describes the suggestion (not a side effect).
 */
export type SuggestionRule = {
  id: string;
  name: string;
  priority: number;
  dismissable: boolean;
  condition: (ctx: CopilotEvaluationContext) => boolean;
  action: (ctx: CopilotEvaluationContext) => SuggestionAction;
};

/** Active suggestion ready for the Suggestion Panel. */
export type ActiveSuggestion = {
  id: string;
  ruleId: string;
  name: string;
  priority: number;
  dismissable: boolean;
  title: string;
  explanation: string;
  actionLabel: string;
  href: string;
  icon: SuggestionIconId;
  projectId: string;
};

export type CopilotPersistedState = {
  sessionId: string;
  dismissedIds: string[];
  updatedAt: string;
};

/** Contract for swapping rule engine → AI later. */
export type CopilotEngineContract = {
  evaluate(
    ctx: CopilotEvaluationContext,
    dismissedIds: ReadonlySet<string>,
  ): ActiveSuggestion[];
};
