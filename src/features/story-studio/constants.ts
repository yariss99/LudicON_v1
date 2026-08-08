import type {
  StoryBlockType,
  StorySourceKind,
  StoryStudioStatus,
  StoryThemeId,
} from "./types";

export const STORY_STUDIO_STATUSES: readonly {
  id: StoryStudioStatus;
  label: string;
}[] = [
  { id: "draft", label: "Draft" },
  { id: "in_progress", label: "In Progress" },
  { id: "ready_for_review", label: "Ready for Review" },
  { id: "published", label: "Published" },
] as const;

export const STORY_ENTRY_OPTIONS: readonly {
  id: StorySourceKind;
  label: string;
  description: string;
}[] = [
  {
    id: "lesson",
    label: "From Lesson",
    description: "Turn lesson moments into narrative scenes.",
  },
  {
    id: "worksheet",
    label: "From Worksheet",
    description: "Convert practice into story challenges.",
  },
  {
    id: "assessment",
    label: "From Assessment",
    description: "Weave checks for understanding into the plot.",
  },
  {
    id: "game",
    label: "From Game",
    description: "Retell a learning game as an interactive story.",
  },
  {
    id: "blank",
    label: "Blank Story",
    description: "Start with narrative blocks and pick a theme.",
  },
] as const;

export const STORY_THEMES: readonly {
  id: StoryThemeId;
  label: string;
  description: string;
}[] = [
  { id: "adventure", label: "Adventure", description: "Journeys and quests." },
  { id: "mystery", label: "Mystery", description: "Clues and reveals." },
  { id: "fantasy", label: "Fantasy", description: "Magic and wonder." },
  { id: "space", label: "Space", description: "Exploration beyond Earth." },
  { id: "jungle", label: "Jungle", description: "Wild discovery." },
  {
    id: "time_travel",
    label: "Time Travel",
    description: "Past, present, future.",
  },
  { id: "pirate", label: "Pirate", description: "Maps, crews, treasure." },
  {
    id: "superhero",
    label: "Superhero",
    description: "Powers with responsibility.",
  },
  {
    id: "fairy_tale",
    label: "Fairy Tale",
    description: "Classic story arcs reimagined.",
  },
  {
    id: "real_life",
    label: "Real Life",
    description: "Everyday situations that teach.",
  },
] as const;

export const DEFAULT_STORY_BLOCKS: readonly StoryBlockType[] = [
  "scene",
  "character",
  "dialogue",
  "mission",
  "challenge",
  "learning_task",
  "hint",
  "reward",
  "reflection",
  "alternative_ending",
] as const;

export const STORY_BLOCK_TYPES: readonly {
  id: StoryBlockType;
  label: string;
  category: string;
  placeholder: string;
}[] = [
  {
    id: "scene",
    label: "Scene",
    category: "Setting",
    placeholder: "Where and when does this moment happen?",
  },
  {
    id: "character",
    label: "Character",
    category: "Setting",
    placeholder: "Who appears here — name, role, motivation…",
  },
  {
    id: "dialogue",
    label: "Dialogue",
    category: "Narrative",
    placeholder: "What do characters say that moves learning forward?",
  },
  {
    id: "mission",
    label: "Mission",
    category: "Narrative",
    placeholder: "What must the learner-hero accomplish next?",
  },
  {
    id: "challenge",
    label: "Challenge",
    category: "Learning",
    placeholder: "Obstacle or problem tied to the objective…",
  },
  {
    id: "learning_task",
    label: "Learning Task",
    category: "Learning",
    placeholder: "Concrete academic task embedded in the story…",
  },
  {
    id: "hint",
    label: "Hint",
    category: "Support",
    placeholder: "Gentle nudge without giving away the answer…",
  },
  {
    id: "reward",
    label: "Reward",
    category: "Support",
    placeholder: "Celebration, unlock, or story progress for success…",
  },
  {
    id: "reflection",
    label: "Reflection",
    category: "Close",
    placeholder: "What should students notice about their learning?",
  },
  {
    id: "alternative_ending",
    label: "Alternative Ending",
    category: "Close",
    placeholder: "A different path or ending based on choices…",
  },
] as const;

export const DEFAULT_AUTHOR = "Teacher";

export function storyBlockMeta(type: StoryBlockType) {
  return STORY_BLOCK_TYPES.find((b) => b.id === type);
}

export function storyBlockLabel(type: StoryBlockType): string {
  return storyBlockMeta(type)?.label ?? type;
}

export function storyThemeLabel(id: StoryThemeId): string {
  return STORY_THEMES.find((t) => t.id === id)?.label ?? id;
}

export function storyStatusLabel(status: StoryStudioStatus): string {
  return STORY_STUDIO_STATUSES.find((s) => s.id === status)?.label ?? status;
}

export function storySourceLabel(kind: StorySourceKind): string {
  return STORY_ENTRY_OPTIONS.find((o) => o.id === kind)?.label ?? kind;
}
