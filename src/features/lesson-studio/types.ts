/**
 * Lesson Studio — core educational workspace (Notion-like blocks).
 */

export type LessonStudioStatus =
  | "draft"
  | "in_progress"
  | "ready_for_review"
  | "published";

export type LessonBlockType =
  | "introduction"
  | "objectives"
  | "previous_knowledge"
  | "discovery"
  | "practice"
  | "interactive_activity"
  | "assessment"
  | "homework"
  | "reflection"
  | "resources"
  | "notes";

export type LessonDifficulty = "easy" | "medium" | "hard";

export type LessonStudioBlock = {
  id: string;
  type: LessonBlockType;
  title: string;
  content: string;
  collapsed: boolean;
  order: number;
  /** Teacher dismissed the inline AI hint for this block */
  aiHintDismissed?: boolean;
};

export type LessonStudioProperties = {
  title: string;
  subject: string;
  grade: string;
  durationMinutes: number;
  teachingUnit: string;
  competencies: string[];
  learningObjectives: string[];
  keywords: string[];
  difficulty: LessonDifficulty;
};

export type LessonStudioDocument = {
  id: string;
  projectId: string;
  status: LessonStudioStatus;
  version: number;
  properties: LessonStudioProperties;
  blocks: LessonStudioBlock[];
  /** Guided wizard finished at least once */
  guidedCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
};

export type LessonStudioVersion = {
  id: string;
  lessonId: string;
  projectId: string;
  version: number;
  snapshot: LessonStudioDocument;
  createdAt: string;
  author: string;
  note?: string;
};

export type LessonSortOption = "updated" | "created" | "alpha" | "status";
export type LessonViewMode = "grid" | "list";
