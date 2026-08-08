import type { SuggestionRule } from "../types";

export type { SuggestionRule } from "../types";

function createIntent(
  projectId: string,
  intent: string,
  source: string = "blank",
) {
  const params = new URLSearchParams({
    type: intent,
    project: projectId,
    source,
  });
  return `/create?${params.toString()}`;
}

/**
 * SuggestionRegistry — aligned with End-to-End Teaching Flow:
 * Lesson → Worksheet → Presentation → Assessment → Game → Story
 */
export const SuggestionRegistry: readonly SuggestionRule[] = [
  {
    id: "flow-worksheet",
    name: "Create Worksheet",
    priority: 100,
    dismissable: true,
    condition: (ctx) => {
      const s = ctx.snapshot;
      return Boolean(s && s.lessonCount > 0 && s.worksheetCount === 0);
    },
    action: (ctx) => ({
      icon: "worksheet",
      title: "Create a Worksheet",
      explanation:
        "Your lesson is ready. Continue the teaching flow with practice.",
      actionLabel: "Create",
      href: createIntent(ctx.snapshot!.projectId, "worksheet", "lesson"),
    }),
  },
  {
    id: "flow-presentation",
    name: "Create Presentation",
    priority: 90,
    dismissable: true,
    condition: (ctx) => {
      const s = ctx.snapshot;
      return Boolean(
        s &&
          s.lessonCount > 0 &&
          s.worksheetCount > 0 &&
          s.presentationCount === 0,
      );
    },
    action: (ctx) => ({
      icon: "presentation",
      title: "Create Presentation",
      explanation:
        "Practice is in place — add slides for whole-class teaching.",
      actionLabel: "Create",
      href: createIntent(ctx.snapshot!.projectId, "presentation", "lesson"),
    }),
  },
  {
    id: "flow-assessment",
    name: "Create Assessment",
    priority: 85,
    dismissable: true,
    condition: (ctx) => {
      const s = ctx.snapshot;
      return Boolean(
        s &&
          s.presentationCount > 0 &&
          s.assessmentCount === 0,
      );
    },
    action: (ctx) => ({
      icon: "assessment",
      title: "Create Assessment",
      explanation:
        "Check understanding after teaching and practice.",
      actionLabel: "Create",
      href: createIntent(ctx.snapshot!.projectId, "assessment", "worksheet"),
    }),
  },
  {
    id: "flow-game",
    name: "Create Game",
    priority: 75,
    dismissable: true,
    condition: (ctx) => {
      const s = ctx.snapshot;
      return Boolean(s && s.assessmentCount > 0 && s.gameCount === 0);
    },
    action: (ctx) => ({
      icon: "game",
      title: "Create Game",
      explanation:
        "Assessment is ready — transform practice into a classroom game.",
      actionLabel: "Create",
      href: createIntent(ctx.snapshot!.projectId, "game", "worksheet"),
    }),
  },
  {
    id: "flow-story",
    name: "Create Story",
    priority: 65,
    dismissable: true,
    condition: (ctx) => {
      const s = ctx.snapshot;
      return Boolean(s && s.gameCount > 0 && s.storyCount === 0);
    },
    action: (ctx) => ({
      icon: "story",
      title: "Create Story",
      explanation:
        "Complete the teaching flow with an interactive narrative.",
      actionLabel: "Create",
      href: createIntent(ctx.snapshot!.projectId, "story", "game"),
    }),
  },
  // Soft early suggestions if teacher jumps ahead
  {
    id: "flow-presentation-early",
    name: "Create Presentation",
    priority: 55,
    dismissable: true,
    condition: (ctx) => {
      const s = ctx.snapshot;
      return Boolean(
        s &&
          s.lessonCount > 0 &&
          s.worksheetCount === 0 &&
          s.presentationCount === 0,
      );
    },
    action: (ctx) => ({
      icon: "presentation",
      title: "Create Presentation",
      explanation: "Optional parallel path — slides from your lesson.",
      actionLabel: "Create",
      href: createIntent(ctx.snapshot!.projectId, "presentation", "lesson"),
    }),
  },
] as const;
