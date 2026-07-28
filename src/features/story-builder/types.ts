/**
 * Story Builder domain model.
 * Stories always belong to a Lesson and a Project.
 */

export type StoryKind =
  | "narrative"
  | "interactive"
  | "adventure"
  | "stem"
  | "historical"
  | "scientific"
  | "mathematics"
  | "language"
  | "social_emotional"
  | "digital_storybook";

export type SceneType =
  | "introduction"
  | "dialogue"
  | "challenge"
  | "puzzle"
  | "decision"
  | "exploration"
  | "mini_game"
  | "reflection"
  | "assessment"
  | "ending";

export type ReadingLevel =
  | "emerging"
  | "developing"
  | "fluent"
  | "advanced";

export type StoryStatus = "draft" | "validated" | "published" | "archived";

export type StoryActor = "teacher" | "ai" | "system";

export type StorySectionId =
  | "general"
  | "characters"
  | "setting"
  | "objectives"
  | "arc"
  | "scenes"
  | "branching"
  | "activities"
  | "reflection"
  | "assessment"
  | "notes"
  | "metadata"
  | "preview"
  | "export";

export type StoryCharacter = {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly traits: string;
  readonly illustrationPrompt?: string;
};

export type StoryChoice = {
  readonly id: string;
  readonly label: string;
  readonly targetSceneId?: string;
  readonly feedback?: string;
};

export type StoryScene = {
  readonly id: string;
  readonly type: SceneType;
  readonly title: string;
  readonly narration: string;
  readonly dialogue?: string;
  readonly challenge?: string;
  readonly activity?: string;
  readonly reflectionPrompt?: string;
  readonly assessmentMoment?: string;
  readonly illustrationPrompt?: string;
  readonly audioScript?: string;
  readonly choices: readonly StoryChoice[];
  readonly order: number;
};

export type StoryValidationIssue = {
  readonly id: string;
  readonly severity: "error" | "warning" | "info";
  readonly code: string;
  readonly message: string;
  readonly sectionId?: StorySectionId;
  readonly repairSuggestion?: string;
};

export type StoryValidationReport = {
  readonly score: number;
  readonly passed: boolean;
  readonly issues: readonly StoryValidationIssue[];
  readonly validatedAt: string;
};

export type StoryDocument = {
  readonly id: string;
  readonly projectId: string;
  readonly lessonId: string;
  readonly workspaceArtifactId?: string;
  readonly kind: StoryKind;
  readonly status: StoryStatus;
  readonly version: number;
  readonly title: string;
  readonly subject: string;
  readonly grade: string;
  readonly readingLevel: ReadingLevel;
  readonly setting: string;
  readonly storyArc: string;
  readonly objectives: readonly string[];
  readonly competencies: readonly string[];
  readonly crossCurricular: readonly string[];
  readonly differentiation: string;
  readonly accessibilityNotes: string;
  readonly vocabulary: readonly string[];
  readonly characters: readonly StoryCharacter[];
  readonly scenes: readonly StoryScene[];
  readonly activities: readonly string[];
  readonly reflection: string;
  readonly assessmentMoments: readonly string[];
  readonly teacherNotes: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly estimatedMinutes: number;
  readonly validation?: StoryValidationReport;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt?: string;
  readonly createdBy: StoryActor;
};

export type StoryVersion = {
  readonly id: string;
  readonly storyId: string;
  readonly projectId: string;
  readonly lessonId: string;
  readonly version: number;
  readonly snapshot: StoryDocument;
  readonly createdAt: string;
  readonly actor: StoryActor;
  readonly note?: string;
};

export type StoryAiActionId =
  | "generate_story"
  | "generate_characters"
  | "generate_dialogues"
  | "generate_scenes"
  | "generate_challenges"
  | "adapt_grade"
  | "adjust_reading_level"
  | "differentiate"
  | "generate_illustration_prompts"
  | "generate_audio_script";

export type StoryExportFormat =
  | "html"
  | "pdf"
  | "presentation"
  | "print"
  | "teacher"
  | "student";

export type StoryBuilderPanel =
  | "editor"
  | "preview"
  | "branching"
  | "validation"
  | "versions"
  | "export"
  | "ai";
