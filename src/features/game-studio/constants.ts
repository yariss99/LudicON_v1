import type {
  GameBlockType,
  GameMechanicId,
  GameSourceKind,
  GameStudioStatus,
  GameTypeId,
} from "./types";

export const GAME_STUDIO_STATUSES: readonly {
  id: GameStudioStatus;
  label: string;
}[] = [
  { id: "draft", label: "Draft" },
  { id: "in_progress", label: "In Progress" },
  { id: "ready_for_review", label: "Ready for Review" },
  { id: "published", label: "Published" },
] as const;

export const GAME_ENTRY_OPTIONS: readonly {
  id: GameSourceKind;
  label: string;
  description: string;
}[] = [
  {
    id: "lesson",
    label: "From Lesson",
    description: "Turn lesson moments into playable missions.",
  },
  {
    id: "worksheet",
    label: "From Worksheet",
    description: "Transform practice items into game challenges.",
  },
  {
    id: "assessment",
    label: "From Assessment",
    description: "Convert checks for understanding into a game arc.",
  },
  {
    id: "scratch",
    label: "From Scratch",
    description: "Start with core learning blocks and pick a game type.",
  },
] as const;

export const GAME_TYPES: readonly {
  id: GameTypeId;
  label: string;
  description: string;
  suggestedMechanics: readonly GameMechanicId[];
}[] = [
  {
    id: "quiz_challenge",
    label: "Quiz Challenge",
    description: "Fast checks with score and feedback loops.",
    suggestedMechanics: ["score", "timer", "lives", "leaderboard"],
  },
  {
    id: "escape_room",
    label: "Escape Room",
    description: "Solve linked challenges to unlock the exit.",
    suggestedMechanics: ["timer", "keys", "inventory", "levels"],
  },
  {
    id: "detective_mission",
    label: "Detective Mission",
    description: "Gather clues and crack the case.",
    suggestedMechanics: ["inventory", "map", "badges", "character"],
  },
  {
    id: "memory_game",
    label: "Memory Game",
    description: "Match and recall key concepts.",
    suggestedMechanics: ["score", "timer", "levels"],
  },
  {
    id: "puzzle",
    label: "Puzzle",
    description: "Piece together meaning through challenges.",
    suggestedMechanics: ["levels", "score", "timer"],
  },
  {
    id: "board_game",
    label: "Board Game",
    description: "Move across a path of learning spaces.",
    suggestedMechanics: ["map", "coins", "character", "levels"],
  },
  {
    id: "adventure",
    label: "Adventure",
    description: "Story-driven quests tied to objectives.",
    suggestedMechanics: ["character", "map", "inventory", "badges"],
  },
  {
    id: "treasure_hunt",
    label: "Treasure Hunt",
    description: "Find rewards by completing learning stations.",
    suggestedMechanics: ["map", "keys", "coins", "timer"],
  },
  {
    id: "matching",
    label: "Matching",
    description: "Pair concepts, examples, and definitions.",
    suggestedMechanics: ["score", "timer", "levels"],
  },
  {
    id: "wheel_challenge",
    label: "Wheel Challenge",
    description: "Spin for randomized practice prompts.",
    suggestedMechanics: ["score", "coins", "badges", "leaderboard"],
  },
] as const;

export const DEFAULT_GAME_BLOCKS: readonly GameBlockType[] = [
  "introduction",
  "mission",
  "question",
  "feedback",
  "reward",
  "final_challenge",
] as const;

export const GAME_BLOCK_TYPES: readonly {
  id: GameBlockType;
  label: string;
  category: string;
  placeholder: string;
}[] = [
  {
    id: "introduction",
    label: "Introduction",
    category: "Arc",
    placeholder: "Hook students and state the learning goal…",
  },
  {
    id: "mission",
    label: "Mission",
    category: "Arc",
    placeholder: "What must players achieve in this stage?",
  },
  {
    id: "question",
    label: "Question",
    category: "Challenge",
    placeholder: "Learning challenge / question tied to the objective…",
  },
  {
    id: "feedback",
    label: "Feedback",
    category: "Challenge",
    placeholder: "What players see after an attempt (correct / retry)…",
  },
  {
    id: "reward",
    label: "Reward",
    category: "Motivation",
    placeholder: "Badge, coins, unlock, or celebration for success…",
  },
  {
    id: "final_challenge",
    label: "Final Challenge",
    category: "Finale",
    placeholder: "Capstone challenge proving the learning objective…",
  },
] as const;

export const GAME_MECHANICS: readonly {
  id: GameMechanicId;
  label: string;
  description: string;
}[] = [
  { id: "score", label: "Score", description: "Points for correct progress." },
  { id: "timer", label: "Timer", description: "Time pressure or pacing." },
  { id: "lives", label: "Lives", description: "Limited attempts." },
  { id: "badges", label: "Badges", description: "Achievement markers." },
  { id: "levels", label: "Levels", description: "Progressive difficulty." },
  { id: "coins", label: "Coins", description: "Collectible currency." },
  {
    id: "character",
    label: "Character",
    description: "Player avatar or role.",
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Collected tools and clues.",
  },
  { id: "keys", label: "Keys", description: "Unlock next rooms or stages." },
  { id: "map", label: "Map", description: "Spatial progress overview." },
  {
    id: "leaderboard",
    label: "Leaderboard",
    description: "Friendly class ranking.",
  },
] as const;

export const DEFAULT_AUTHOR = "Teacher";

export function gameBlockMeta(type: GameBlockType) {
  return GAME_BLOCK_TYPES.find((b) => b.id === type);
}

export function gameBlockLabel(type: GameBlockType): string {
  return gameBlockMeta(type)?.label ?? type;
}

export function gameTypeMeta(id: GameTypeId) {
  return GAME_TYPES.find((g) => g.id === id);
}

export function gameTypeLabel(id: GameTypeId): string {
  return gameTypeMeta(id)?.label ?? id;
}

export function gameMechanicLabel(id: GameMechanicId): string {
  return GAME_MECHANICS.find((m) => m.id === id)?.label ?? id;
}

export function gameStatusLabel(status: GameStudioStatus): string {
  return GAME_STUDIO_STATUSES.find((s) => s.id === status)?.label ?? status;
}

export function gameSourceLabel(kind: GameSourceKind): string {
  return GAME_ENTRY_OPTIONS.find((o) => o.id === kind)?.label ?? kind;
}
