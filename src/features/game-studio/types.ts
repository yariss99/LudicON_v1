/**
 * Game Studio — learning-objective game workspace (not template packs).
 */

export type GameStudioStatus =
  | "draft"
  | "in_progress"
  | "ready_for_review"
  | "published";

export type GameSourceKind = "scratch" | "lesson" | "worksheet" | "assessment";

export type GameTypeId =
  | "quiz_challenge"
  | "escape_room"
  | "detective_mission"
  | "memory_game"
  | "puzzle"
  | "board_game"
  | "adventure"
  | "treasure_hunt"
  | "matching"
  | "wheel_challenge";

export type GameBlockType =
  | "introduction"
  | "mission"
  | "question"
  | "feedback"
  | "reward"
  | "final_challenge";

export type GameMechanicId =
  | "score"
  | "timer"
  | "lives"
  | "badges"
  | "levels"
  | "coins"
  | "character"
  | "inventory"
  | "keys"
  | "map"
  | "leaderboard";

export type GameBlock = {
  id: string;
  type: GameBlockType;
  title: string;
  content: string;
  collapsed: boolean;
  order: number;
  aiHintDismissed?: boolean;
};

export type GameSource = {
  kind: GameSourceKind;
  sourceId?: string;
  sourceTitle?: string;
};

export type GameStudioProperties = {
  title: string;
  subject: string;
  grade: string;
  learningObjective: string;
  gameType: GameTypeId;
  instructions: string;
};

export type GameStudioDocument = {
  id: string;
  projectId: string;
  status: GameStudioStatus;
  version: number;
  properties: GameStudioProperties;
  source: GameSource;
  blocks: GameBlock[];
  mechanics: GameMechanicId[];
  guidedCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
};

export type GameSortOption = "updated" | "created" | "alpha" | "status";
export type GameViewMode = "grid" | "list";
