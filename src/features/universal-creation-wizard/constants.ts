import type { WizardResourceType, WizardSourceKind } from "./types";

export const RESOURCE_TYPES: readonly {
  id: WizardResourceType;
  title: string;
  description: string;
  emoji: string;
}[] = [
  {
    id: "lesson",
    title: "Lesson",
    description: "Full teaching sequence with objectives and practice",
    emoji: "📘",
  },
  {
    id: "worksheet",
    title: "Worksheet",
    description: "Practice exercises aligned to learning goals",
    emoji: "📄",
  },
  {
    id: "assessment",
    title: "Assessment",
    description: "Checks for understanding and competencies",
    emoji: "✅",
  },
  {
    id: "presentation",
    title: "Presentation",
    description: "Slides for whole-class teaching",
    emoji: "🎞",
  },
  {
    id: "game",
    title: "Game",
    description: "Curriculum-aligned classroom challenges",
    emoji: "🎮",
  },
  {
    id: "story",
    title: "Story",
    description: "Interactive narrative learning journeys",
    emoji: "📖",
  },
] as const;

export const SOURCE_LABELS: Record<WizardSourceKind, string> = {
  blank: "Blank",
  lesson: "From Lesson",
  worksheet: "From Worksheet",
  assessment: "From Assessment",
  game: "From Game",
  story: "From Story",
};

/**
 * Compatible creation sources per target resource.
 * Only these options appear in Step 2.
 */
export const COMPATIBLE_SOURCES: Record<
  WizardResourceType,
  readonly WizardSourceKind[]
> = {
  lesson: ["blank"],
  worksheet: ["blank", "lesson"],
  assessment: ["blank", "lesson", "worksheet"],
  presentation: ["blank", "lesson", "worksheet", "assessment", "story"],
  game: ["blank", "lesson", "worksheet", "assessment"],
  story: ["blank", "lesson", "worksheet", "assessment", "game"],
};

/** Mission 002 default structure labels (preview + applied titles). */
export const DEFAULT_STRUCTURE: Record<WizardResourceType, readonly string[]> = {
  lesson: [
    "Objectives",
    "Introduction",
    "Discovery",
    "Practice",
    "Assessment",
  ],
  worksheet: [
    "Title",
    "Objective",
    "Exercise 1",
    "Exercise 2",
    "Reflection",
  ],
  assessment: ["Competencies", "Questions", "Rubric"],
  presentation: ["Title", "Introduction", "Content Slides", "Summary"],
  game: ["Mission", "Challenges", "Rewards"],
  story: ["Characters", "Mission", "Scenes", "Reflection"],
};

export function wizardPath(options?: {
  type?: WizardResourceType;
  projectId?: string;
  source?: WizardSourceKind;
  sourceId?: string;
  title?: string;
  subject?: string;
  grade?: string;
}) {
  const params = new URLSearchParams();
  if (options?.type) params.set("type", options.type);
  if (options?.projectId) params.set("project", options.projectId);
  if (options?.source) params.set("source", options.source);
  if (options?.sourceId) params.set("sourceId", options.sourceId);
  if (options?.title) params.set("title", options.title);
  if (options?.subject) params.set("subject", options.subject);
  if (options?.grade) params.set("grade", options.grade);
  const q = params.toString();
  return q ? `/create?${q}` : "/create";
}
