/**
 * Story Studio — interactive educational narrative workspace.
 */

export type StoryStudioStatus =
  | "draft"
  | "in_progress"
  | "ready_for_review"
  | "published";

export type StorySourceKind =
  | "blank"
  | "lesson"
  | "worksheet"
  | "assessment"
  | "game";

export type StoryThemeId =
  | "adventure"
  | "mystery"
  | "fantasy"
  | "space"
  | "jungle"
  | "time_travel"
  | "pirate"
  | "superhero"
  | "fairy_tale"
  | "real_life";

export type StoryBlockType =
  | "scene"
  | "character"
  | "dialogue"
  | "mission"
  | "challenge"
  | "learning_task"
  | "hint"
  | "reward"
  | "reflection"
  | "alternative_ending";

export type StoryBlock = {
  id: string;
  type: StoryBlockType;
  title: string;
  content: string;
  collapsed: boolean;
  order: number;
  aiHintDismissed?: boolean;
};

export type StorySource = {
  kind: StorySourceKind;
  sourceId?: string;
  sourceTitle?: string;
};

export type StoryStudioProperties = {
  title: string;
  subject: string;
  grade: string;
  learningObjective: string;
  theme: StoryThemeId;
  synopsis: string;
};

export type StoryStudioDocument = {
  id: string;
  projectId: string;
  status: StoryStudioStatus;
  version: number;
  properties: StoryStudioProperties;
  source: StorySource;
  blocks: StoryBlock[];
  guidedCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
};

export type StorySortOption = "updated" | "created" | "alpha" | "status";
export type StoryViewMode = "grid" | "list";
