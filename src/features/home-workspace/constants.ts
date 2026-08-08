export const HOME_STORAGE = {
  lessonProgress: "prima.home-workspace.lesson-progress.v1",
} as const;

export const CREATE_ACTIONS = [
  {
    id: "lesson",
    title: "New Lesson",
    description: "Plan a complete teaching experience",
    emoji: "➕",
  },
  {
    id: "worksheet",
    title: "New Worksheet",
    description: "Practice materials for your class",
    emoji: "📄",
  },
  {
    id: "game",
    title: "New Game",
    description: "Turn practice into play",
    emoji: "🎮",
  },
  {
    id: "story",
    title: "New Story",
    description: "Narrative learning journeys",
    emoji: "📖",
  },
] as const;

export type CreateActionId = (typeof CREATE_ACTIONS)[number]["id"];
