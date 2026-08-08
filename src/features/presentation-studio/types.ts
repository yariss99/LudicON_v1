/**
 * Presentation Studio — visual block workspace seeded from educational resources.
 */

export type PresentationStudioStatus =
  | "draft"
  | "in_progress"
  | "ready_for_review"
  | "published";

export type PresentationSourceKind =
  | "blank"
  | "lesson"
  | "worksheet"
  | "assessment"
  | "story";

export type PresentationBlockType =
  | "title"
  | "text"
  | "image"
  | "gallery"
  | "table"
  | "diagram"
  | "timeline"
  | "video"
  | "qr_code"
  | "interactive_question"
  | "brainstorm"
  | "reflection"
  | "activity";

export type PresentationBlock = {
  id: string;
  type: PresentationBlockType;
  title: string;
  content: string;
  teacherNotes: string;
  estimatedSeconds: number;
  collapsed: boolean;
  order: number;
  aiHintDismissed?: boolean;
};

export type PresentationSource = {
  kind: PresentationSourceKind;
  sourceId?: string;
  sourceTitle?: string;
};

export type PresentationStudioProperties = {
  title: string;
  subject: string;
  grade: string;
  instructions: string;
};

export type PresentationStudioDocument = {
  id: string;
  projectId: string;
  status: PresentationStudioStatus;
  version: number;
  properties: PresentationStudioProperties;
  source: PresentationSource;
  blocks: PresentationBlock[];
  guidedCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
};

export type PresentationSortOption = "updated" | "created" | "alpha" | "status";
export type PresentationViewMode = "grid" | "list";
