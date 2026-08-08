import type { WorksheetBlockType, WorksheetStatus } from "./types";

export const WORKSHEET_STATUSES: readonly {
  id: WorksheetStatus;
  label: string;
}[] = [
  { id: "draft", label: "Draft" },
  { id: "in_progress", label: "In Progress" },
  { id: "ready_for_review", label: "Ready for Review" },
  { id: "published", label: "Published" },
] as const;

export const DEFAULT_WORKSHEET_BLOCKS: readonly WorksheetBlockType[] = [
  "exercises",
  "problems",
  "matching",
  "reflection",
  "self_assessment",
] as const;

export const WORKSHEET_BLOCK_TYPES: readonly {
  id: WorksheetBlockType;
  label: string;
  category: string;
  placeholder: string;
  aiPrompt: string;
}[] = [
  {
    id: "exercises",
    label: "Exercises",
    category: "Practice",
    placeholder: "Short practice items students can complete quickly…",
    aiPrompt: "Would you like me to generate clearer practice exercises?",
  },
  {
    id: "problems",
    label: "Problems",
    category: "Practice",
    placeholder: "Richer problems that require reasoning…",
    aiPrompt: "Would you like me to improve these problem prompts?",
  },
  {
    id: "tables",
    label: "Tables",
    category: "Structure",
    placeholder: "Describe a table students fill in (rows / columns)…",
    aiPrompt: "Would you like me to suggest a table structure?",
  },
  {
    id: "images",
    label: "Images",
    category: "Media",
    placeholder: "Describe an image prompt or visual stimulus…",
    aiPrompt: "Would you like me to suggest a visual task around an image?",
  },
  {
    id: "matching",
    label: "Matching",
    category: "Interactive",
    placeholder: "Pairs to match — terms, definitions, examples…",
    aiPrompt: "Would you like me to create a matching set?",
  },
  {
    id: "crosswords",
    label: "Crosswords",
    category: "Interactive",
    placeholder: "Clues and answers for a crossword activity…",
    aiPrompt: "Would you like me to draft crossword clues?",
  },
  {
    id: "mazes",
    label: "Mazes",
    category: "Interactive",
    placeholder: "Describe a maze / path challenge with learning checkpoints…",
    aiPrompt: "Would you like me to invent a learning maze path?",
  },
  {
    id: "qr_activities",
    label: "QR activities",
    category: "Interactive",
    placeholder: "Stations or QR-linked micro-tasks…",
    aiPrompt: "Would you like me to propose QR station activities?",
  },
  {
    id: "reflection",
    label: "Reflection",
    category: "Metacognition",
    placeholder: "Prompts for students to think about their learning…",
    aiPrompt: "Would you like me to improve these reflection prompts?",
  },
  {
    id: "self_assessment",
    label: "Self Assessment",
    category: "Metacognition",
    placeholder: "Rubric or checklist students use to self-check…",
    aiPrompt: "Would you like me to create a self-assessment checklist?",
  },
  {
    id: "creative_tasks",
    label: "Creative Tasks",
    category: "Creation",
    placeholder: "Open-ended creative output (draw, invent, explain)…",
    aiPrompt: "Would you like me to suggest a creative challenge?",
  },
] as const;

export const DEFAULT_AUTHOR = "Teacher";

export function worksheetBlockMeta(type: WorksheetBlockType) {
  return WORKSHEET_BLOCK_TYPES.find((b) => b.id === type);
}

export function worksheetBlockLabel(type: WorksheetBlockType): string {
  return worksheetBlockMeta(type)?.label ?? type;
}

export function worksheetStatusLabel(status: WorksheetStatus): string {
  return WORKSHEET_STATUSES.find((s) => s.id === status)?.label ?? status;
}
