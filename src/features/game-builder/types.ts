/**
 * Educational Game Builder domain model.
 * Games always belong to a Lesson and a Project.
 * Teachers never start from an empty canvas — games are sourced from PRIMA resources.
 */

export type GameKind =
  | "quiz"
  | "escape_room"
  | "memory"
  | "matching"
  | "drag_drop"
  | "treasure_hunt"
  | "mission"
  | "adventure"
  | "board"
  | "card"
  | "puzzle"
  | "timeline"
  | "classification"
  | "math_challenge"
  | "language_challenge"
  | "science_investigation"
  | "collaborative";

export type GameSourceKind =
  | "lesson"
  | "worksheet"
  | "assessment"
  | "story"
  | "competencies"
  | "objectives"
  | "template";

export type GameMechanicId =
  | "points"
  | "badges"
  | "stars"
  | "experience"
  | "lives"
  | "levels"
  | "unlockables"
  | "achievements"
  | "random_events"
  | "progress"
  | "adaptive_difficulty";

export type ChallengeType =
  | "question"
  | "puzzle"
  | "task"
  | "decision"
  | "timed"
  | "collaborative"
  | "boss";

export type GameStatus = "draft" | "validated" | "published" | "archived";
export type GameActor = "teacher" | "ai" | "system";

export type GameSectionId =
  | "general"
  | "source"
  | "objectives"
  | "competencies"
  | "rules"
  | "mechanics"
  | "levels"
  | "challenges"
  | "questions"
  | "rewards"
  | "hints"
  | "feedback"
  | "notes"
  | "metadata"
  | "preview"
  | "simulate"
  | "export";

export type GameSourceRef = {
  readonly kind: GameSourceKind;
  readonly resourceId?: string;
  readonly label: string;
};

export type GameMechanicConfig = {
  readonly id: GameMechanicId;
  readonly enabled: boolean;
  readonly value: number;
  readonly note?: string;
};

export type GameQuestion = {
  readonly id: string;
  readonly prompt: string;
  readonly choices: readonly string[];
  readonly correctIndex: number;
  readonly points: number;
  readonly hint?: string;
  readonly feedbackCorrect?: string;
  readonly feedbackIncorrect?: string;
  readonly order: number;
};

export type GameChallenge = {
  readonly id: string;
  readonly type: ChallengeType;
  readonly title: string;
  readonly description: string;
  readonly difficulty: "easy" | "medium" | "hard";
  readonly points: number;
  readonly hint?: string;
  readonly rewardId?: string;
  readonly order: number;
};

export type GameLevel = {
  readonly id: string;
  readonly title: string;
  readonly objective: string;
  readonly unlockAfter?: string;
  readonly challengeIds: readonly string[];
  readonly order: number;
};

export type GameReward = {
  readonly id: string;
  readonly title: string;
  readonly kind: "badge" | "star" | "unlock" | "points" | "achievement";
  readonly description: string;
  readonly threshold: number;
};

export type GameValidationIssue = {
  readonly id: string;
  readonly severity: "error" | "warning" | "info";
  readonly code: string;
  readonly message: string;
  readonly sectionId?: GameSectionId;
  readonly repairSuggestion?: string;
};

export type GameValidationReport = {
  readonly score: number;
  readonly passed: boolean;
  readonly issues: readonly GameValidationIssue[];
  readonly validatedAt: string;
};

export type GameDocument = {
  readonly id: string;
  readonly projectId: string;
  readonly lessonId: string;
  readonly workspaceArtifactId?: string;
  readonly kind: GameKind;
  readonly status: GameStatus;
  readonly version: number;
  readonly title: string;
  readonly subject: string;
  readonly grade: string;
  readonly estimatedMinutes: number;
  readonly source: GameSourceRef;
  readonly objectives: readonly string[];
  readonly competencies: readonly string[];
  readonly rules: string;
  readonly mechanics: readonly GameMechanicConfig[];
  readonly levels: readonly GameLevel[];
  readonly challenges: readonly GameChallenge[];
  readonly questions: readonly GameQuestion[];
  readonly rewards: readonly GameReward[];
  readonly hints: readonly string[];
  readonly feedbackNotes: string;
  readonly teacherNotes: string;
  readonly visualAssetPrompts: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
  readonly validation?: GameValidationReport;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt?: string;
  readonly createdBy: GameActor;
};

export type GameVersion = {
  readonly id: string;
  readonly gameId: string;
  readonly projectId: string;
  readonly lessonId: string;
  readonly version: number;
  readonly snapshot: GameDocument;
  readonly createdAt: string;
  readonly actor: GameActor;
  readonly note?: string;
};

export type GameAiActionId =
  | "generate_complete"
  | "from_lesson"
  | "from_worksheet"
  | "from_story"
  | "from_assessment"
  | "generate_questions"
  | "generate_challenges"
  | "generate_puzzles"
  | "generate_rewards"
  | "balance_difficulty"
  | "adapt_grade"
  | "generate_visual_prompts";

export type GameExportFormat =
  | "html"
  | "web"
  | "classroom"
  | "print"
  | "qr";

export type GameBuilderPanel =
  | "editor"
  | "preview"
  | "simulate"
  | "mechanics"
  | "validation"
  | "versions"
  | "export"
  | "ai";
