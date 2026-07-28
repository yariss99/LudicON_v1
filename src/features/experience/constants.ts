import type { PlanningStep } from "../../types/studio";

/** Scene 3 — Intent Engine (total ~5 seconds) */
export const EXPERIENCE_THINKING_STEPS: PlanningStep[] = [
  {
    id: "goal",
    emoji: "🎯",
    label: "Understanding your teaching goal...",
  },
  {
    id: "curriculum",
    emoji: "📚",
    label: "Matching curriculum...",
  },
  {
    id: "active",
    emoji: "🤝",
    label: "Planning active learning...",
  },
  {
    id: "differentiate",
    emoji: "🌱",
    label: "Preparing differentiated activities...",
  },
  {
    id: "classroom",
    emoji: "✨",
    label: "Creating classroom experience...",
  },
];

/** ~5 seconds total */
export const EXPERIENCE_STEP_MS = 1000;

export const DEMO_INTENTION =
  "I want to teach fractions using LEGO and collaborative learning.";

export type GameActivitySuggestion = {
  id: string;
  title: string;
  description: string;
};

export const GAME_ACTIVITY_SUGGESTIONS: GameActivitySuggestion[] = [
  {
    id: "towers",
    title: "LEGO Fraction Towers",
    description:
      "Pairs build towers to show 1/2, 1/3 and 1/4 — then compare heights.",
  },
  {
    id: "compare",
    title: "Build & Compare",
    description:
      "Teams create two fractions with bricks and decide which is larger — and why.",
  },
  {
    id: "race",
    title: "Collaborative Fraction Race",
    description:
      "Groups race to represent a target fraction with shared LEGO pieces.",
  },
];
