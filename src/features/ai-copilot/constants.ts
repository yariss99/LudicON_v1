import type {
  CommandItem,
  CopilotQuickActionId,
} from "./types";

export const COPILOT_STORAGE = {
  prefs: "prima.ai-copilot.prefs.v1",
  conversations: "prima.ai-copilot.conversations.v1",
  prompts: "prima.ai-copilot.prompts.v1",
  notes: "prima.ai-copilot.notes.v1",
  suggestions: "prima.ai-copilot.suggestions.v1",
} as const;

export const QUICK_ACTIONS: readonly {
  id: CopilotQuickActionId;
  label: string;
}[] = [
  { id: "generate_ideas", label: "Generate Ideas" },
  { id: "improve_writing", label: "Improve Writing" },
  { id: "differentiate", label: "Differentiate" },
  { id: "simplify", label: "Simplify" },
  { id: "expand", label: "Expand" },
  { id: "create_activities", label: "Create Activities" },
  { id: "create_assessment", label: "Create Assessment" },
  { id: "suggest_homework", label: "Suggest Homework" },
  { id: "generate_reflection", label: "Generate Reflection" },
  { id: "generate_resources", label: "Generate Resources" },
  { id: "translate", label: "Translate" },
  { id: "summarize", label: "Summarize" },
] as const;

export const DEFAULT_SMART_PROMPTS = [
  "Generate an engaging lesson introduction.",
  "Create differentiated activities.",
  "Suggest formative assessment.",
  "Improve learning objectives.",
  "Propose a warm-up for previous knowledge.",
  "Draft a short reflection prompt for students.",
] as const;

export const COMMANDS: readonly CommandItem[] = [
  {
    id: "ask_ai",
    label: "Ask AI",
    hint: "Open AI Copilot",
    keywords: ["ai", "copilot", "assistant", "ask"],
  },
  {
    id: "create_lesson",
    label: "Create Lesson",
    hint: "New lesson in current project",
    keywords: ["lesson", "create", "studio"],
  },
  {
    id: "create_worksheet",
    label: "Create Worksheet",
    hint: "Open worksheets for project",
    keywords: ["worksheet", "fișă", "create"],
  },
  {
    id: "search",
    label: "Search",
    hint: "Focus search / projects",
    keywords: ["search", "find"],
  },
  {
    id: "open_project",
    label: "Open Project",
    hint: "Go to projects",
    keywords: ["project", "open"],
  },
  {
    id: "settings",
    label: "Settings",
    hint: "Open settings",
    keywords: ["settings", "prefs"],
  },
] as const;

export const PANEL_WIDTH_EXPANDED = 380;
export const PANEL_WIDTH_COLLAPSED = 44;
