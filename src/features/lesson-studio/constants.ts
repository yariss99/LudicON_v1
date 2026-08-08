import type { LessonBlockType, LessonStudioStatus } from "./types";

export const LESSON_STATUSES: readonly {
  id: LessonStudioStatus;
  label: string;
}[] = [
  { id: "draft", label: "Draft" },
  { id: "in_progress", label: "In Progress" },
  { id: "ready_for_review", label: "Ready for Review" },
  { id: "published", label: "Published" },
] as const;

/** Default blocks seeded into every new lesson */
export const DEFAULT_LESSON_BLOCKS: readonly LessonBlockType[] = [
  "introduction",
  "objectives",
  "previous_knowledge",
  "discovery",
  "practice",
  "interactive_activity",
  "assessment",
  "homework",
] as const;

export const LESSON_BLOCK_TYPES: readonly {
  id: LessonBlockType;
  label: string;
  placeholder: string;
  aiPrompt: string;
}[] = [
  {
    id: "introduction",
    label: "Introduction",
    placeholder: "Hook the class and set the purpose…",
    aiPrompt: "Would you like me to write a more engaging introduction?",
  },
  {
    id: "objectives",
    label: "Objectives",
    placeholder: "What will students be able to do by the end…",
    aiPrompt: "Would you like me to clarify these learning objectives?",
  },
  {
    id: "previous_knowledge",
    label: "Previous Knowledge",
    placeholder: "Activate what students already know…",
    aiPrompt: "Would you like me to suggest activation questions?",
  },
  {
    id: "discovery",
    label: "Discovery",
    placeholder: "Guide exploration and new concepts…",
    aiPrompt: "Would you like me to improve this discovery sequence?",
  },
  {
    id: "practice",
    label: "Practice",
    placeholder: "Guided and independent practice…",
    aiPrompt: "Would you like me to add differentiated practice items?",
  },
  {
    id: "interactive_activity",
    label: "Interactive Activity",
    placeholder: "Games, discussion, stations, collaboration…",
    aiPrompt: "Would you like me to propose an interactive classroom activity?",
  },
  {
    id: "assessment",
    label: "Assessment",
    placeholder: "Check understanding…",
    aiPrompt: "Would you like me to suggest a quick formative check?",
  },
  {
    id: "homework",
    label: "Homework",
    placeholder: "Extend learning beyond class…",
    aiPrompt: "Would you like me to suggest a short homework task?",
  },
  {
    id: "reflection",
    label: "Reflection",
    placeholder: "Students reflect on learning…",
    aiPrompt: "Would you like me to improve this reflection prompt?",
  },
  {
    id: "resources",
    label: "Resources",
    placeholder: "Materials, links, and references…",
    aiPrompt: "Would you like me to suggest supporting resources?",
  },
  {
    id: "notes",
    label: "Notes",
    placeholder: "Teacher notes and reminders…",
    aiPrompt: "Would you like me to tidy these teacher notes?",
  },
] as const;

export const LESSON_DIFFICULTIES = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
] as const;

export const DEFAULT_AUTHOR = "Teacher";

export function blockTypeLabel(type: LessonBlockType): string {
  return LESSON_BLOCK_TYPES.find((b) => b.id === type)?.label ?? type;
}

export function blockMeta(type: LessonBlockType) {
  return LESSON_BLOCK_TYPES.find((b) => b.id === type);
}

export function statusLabel(status: LessonStudioStatus): string {
  return LESSON_STATUSES.find((s) => s.id === status)?.label ?? status;
}
