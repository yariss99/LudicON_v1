import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Gamepad2,
  Mail,
  Presentation,
  Route,
  ScrollText,
} from "lucide-react";
import type {
  PlanningStep,
  StudioAiAction,
  StudioSuggestion,
} from "../../types/studio";

export const STUDIO_PROMPT_EXAMPLES = [
  "What would you like your students to experience today?",
  "A calm Mathematics journey into fractions for Grade 3.",
  "Help my students explore plants through inquiry.",
  "A differentiated practice path for tomorrow.",
] as const;

export const STUDIO_SUGGESTIONS: StudioSuggestion[] = [
  {
    id: "lesson",
    label: "Lesson",
    prompt: "I want my students to deeply understand a new idea through a clear lesson.",
    icon: BookOpen,
  },
  {
    id: "worksheet",
    label: "Worksheet",
    prompt: "I want practice that meets every learner where they are.",
    icon: FileText,
  },
  {
    id: "presentation",
    label: "Presentation",
    prompt: "I want a visual story that supports tomorrow's teaching.",
    icon: Presentation,
  },
  {
    id: "assessment",
    label: "Assessment",
    prompt: "I want to check understanding with kindness and clarity.",
    icon: ClipboardCheck,
  },
  {
    id: "game",
    label: "Game",
    prompt: "I want my students to learn through joyful challenge.",
    icon: Gamepad2,
  },
  {
    id: "scenario",
    label: "Scenario",
    prompt: "I want a learning scenario with decisions and reflection.",
    icon: Route,
  },
  {
    id: "story",
    label: "Story",
    prompt: "I want a story that opens a new concept gently.",
    icon: ScrollText,
  },
  {
    id: "parent",
    label: "Newsletter",
    prompt: "I want parents to feel connected to this week's learning.",
    icon: Mail,
  },
];

/** Pedagogical thinking — never "loading" or "generating" */
export const PLANNING_STEPS: PlanningStep[] = [
  {
    id: "curriculum",
    emoji: "📚",
    label: "Reviewing curriculum...",
  },
  {
    id: "sequence",
    emoji: "🧭",
    label: "Designing learning sequence...",
  },
  {
    id: "methods",
    emoji: "💡",
    label: "Choosing active learning methods...",
  },
  {
    id: "differentiate",
    emoji: "🌱",
    label: "Preparing differentiated activities...",
  },
  {
    id: "engagement",
    emoji: "✨",
    label: "Thinking about student engagement...",
  },
  {
    id: "workspace",
    emoji: "🧩",
    label: "Building educational workspace...",
  },
];

export const STUDIO_AI_ACTIONS: StudioAiAction[] = [
  {
    id: "improve",
    label: "Strengthen the lesson flow",
    description: "Sharper objectives, calmer pacing.",
  },
  {
    id: "differentiate",
    label: "Differentiate activities",
    description: "Paths for every learner.",
  },
  {
    id: "simplify",
    label: "Simplify student language",
    description: "Clearer instructions, less friction.",
  },
  {
    id: "assessment",
    label: "Add formative checks",
    description: "See understanding during the lesson.",
  },
  {
    id: "presentation",
    label: "Enrich the presentation",
    description: "Visual anchors for key ideas.",
  },
  {
    id: "homework",
    label: "Suggest light homework",
    description: "Purposeful, short, kind.",
  },
];

export const PLANNING_STEP_MS = 1500;

export const INTENT_STORAGE_KEY = "prima.studio.lastIntent";
