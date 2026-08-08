import type { WizardResourceType, WizardSourceKind } from "../universal-creation-wizard/types";

/** Canonical end-to-end teaching flow. */
export const FLOW_STEPS = [
  "lesson",
  "worksheet",
  "presentation",
  "assessment",
  "game",
  "story",
] as const;

export type FlowStepKind = (typeof FLOW_STEPS)[number];

export const FLOW_STEP_META: Record<
  FlowStepKind,
  { label: string; emoji: string; short: string }
> = {
  lesson: { label: "Lesson", emoji: "📘", short: "Lesson" },
  worksheet: { label: "Worksheet", emoji: "📄", short: "Worksheet" },
  presentation: { label: "Presentation", emoji: "🎞", short: "Slides" },
  assessment: { label: "Assessment", emoji: "✅", short: "Assess" },
  game: { label: "Game", emoji: "🎮", short: "Game" },
  story: { label: "Story", emoji: "📖", short: "Story" },
};

/**
 * What's next actions keyed by the step just completed / currently open.
 */
export const NEXT_ACTIONS: Record<
  FlowStepKind,
  readonly FlowStepKind[]
> = {
  lesson: ["worksheet", "presentation", "assessment"],
  worksheet: ["assessment", "presentation"],
  presentation: ["assessment", "game"],
  assessment: ["game", "story"],
  game: ["story"],
  story: [],
};

/** Preferred source when creating the next step from the current one. */
export function preferredSourceFor(
  from: FlowStepKind,
  to: FlowStepKind,
): WizardSourceKind {
  if (from === to) return "blank";
  // Compatible sources in UCW
  if (to === "worksheet" && from === "lesson") return "lesson";
  if (to === "presentation") {
    if (from === "lesson") return "lesson";
    if (from === "worksheet") return "worksheet";
    if (from === "assessment") return "assessment";
    if (from === "story") return "story";
  }
  if (to === "assessment" && (from === "lesson" || from === "worksheet")) {
    return from;
  }
  if (to === "game") {
    if (from === "lesson" || from === "worksheet" || from === "assessment") {
      return from;
    }
  }
  if (to === "story") {
    if (
      from === "lesson" ||
      from === "worksheet" ||
      from === "assessment" ||
      from === "game"
    ) {
      return from;
    }
  }
  return "blank";
}

export const WORKFLOW_STORAGE_KEY = "prima.teaching-workflow.v1";

export type { WizardResourceType };
