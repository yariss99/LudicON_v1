/**
 * Presentation Builder domain model.
 * Presentations are generated from Projects, Lessons, Stories, Worksheets, Assessments.
 */

export type PresentationKind =
  | "lesson"
  | "interactive_lesson"
  | "teacher"
  | "student"
  | "project"
  | "science_investigation"
  | "historical_timeline"
  | "mathematics"
  | "story"
  | "revision";

export type SlideType =
  | "title"
  | "objectives"
  | "introduction"
  | "explanation"
  | "diagram"
  | "image"
  | "video"
  | "timeline"
  | "activity"
  | "question"
  | "discussion"
  | "reflection"
  | "assessment"
  | "summary"
  | "homework";

export type PresentationSourceKind =
  | "project"
  | "lesson"
  | "story"
  | "worksheet"
  | "assessment"
  | "template";

export type PresentationThemeId =
  | "atelier_calm"
  | "chalkboard"
  | "science_lab"
  | "storybook"
  | "high_contrast";

export type PresentationStatus =
  | "draft"
  | "validated"
  | "published"
  | "archived";

export type PresentationActor = "teacher" | "ai" | "system";

export type PresentationSectionId =
  | "general"
  | "source"
  | "outline"
  | "slides"
  | "theme"
  | "notes"
  | "media"
  | "preview"
  | "presenter"
  | "export"
  | "metadata";

export type PresentationSourceRef = {
  readonly kind: PresentationSourceKind;
  readonly resourceId?: string;
  readonly label: string;
};

export type SlideMedia = {
  readonly kind: "image" | "video" | "icon" | "chart" | "table" | "audio";
  readonly label: string;
  readonly promptOrUrl?: string;
};

export type PresentationSlide = {
  readonly id: string;
  readonly type: SlideType;
  readonly title: string;
  readonly body: string;
  readonly bullets: readonly string[];
  readonly speakerNotes: string;
  readonly media: readonly SlideMedia[];
  readonly animationSuggestion?: string;
  readonly estimatedSeconds: number;
  readonly order: number;
};

export type PresentationTheme = {
  readonly id: PresentationThemeId;
  readonly name: string;
  readonly background: string;
  readonly surface: string;
  readonly accent: string;
  readonly text: string;
  readonly fontDisplay: string;
};

export type PresentationValidationIssue = {
  readonly id: string;
  readonly severity: "error" | "warning" | "info";
  readonly code: string;
  readonly message: string;
  readonly sectionId?: PresentationSectionId;
  readonly repairSuggestion?: string;
};

export type PresentationValidationReport = {
  readonly score: number;
  readonly passed: boolean;
  readonly issues: readonly PresentationValidationIssue[];
  readonly validatedAt: string;
};

export type PresentationDocument = {
  readonly id: string;
  readonly projectId: string;
  readonly lessonId?: string;
  readonly workspaceArtifactId?: string;
  readonly kind: PresentationKind;
  readonly status: PresentationStatus;
  readonly version: number;
  readonly title: string;
  readonly subject: string;
  readonly grade: string;
  readonly locale: string;
  readonly source: PresentationSourceRef;
  readonly themeId: PresentationThemeId;
  readonly objectives: readonly string[];
  readonly competencies: readonly string[];
  readonly slides: readonly PresentationSlide[];
  readonly teacherNotes: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly estimatedMinutes: number;
  readonly validation?: PresentationValidationReport;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt?: string;
  readonly createdBy: PresentationActor;
};

export type PresentationVersion = {
  readonly id: string;
  readonly presentationId: string;
  readonly projectId: string;
  readonly version: number;
  readonly snapshot: PresentationDocument;
  readonly createdAt: string;
  readonly actor: PresentationActor;
  readonly note?: string;
};

export type PresentationAiActionId =
  | "generate_entire"
  | "generate_slides"
  | "improve_slides"
  | "summarize_lesson"
  | "generate_speaker_notes"
  | "generate_diagrams"
  | "generate_visual_suggestions"
  | "generate_animation_suggestions"
  | "adapt_presentation"
  | "translate_presentation";

export type PresentationExportFormat =
  | "pptx"
  | "pdf"
  | "html"
  | "presenter"
  | "student"
  | "print";

export type PresentationBuilderPanel =
  | "editor"
  | "outline"
  | "theme"
  | "preview"
  | "presenter"
  | "validation"
  | "versions"
  | "export"
  | "ai";
