/**
 * FEATURE-004 — Universal Pedagogical Editor runtime types.
 * Canonical mirror: @prima/contracts prima-universal-editor + FEATURE-002 blocks.
 */

export type UpePreviewMode =
  | "printable"
  | "presentation"
  | "student"
  | "mobile"
  | "interactive"
  | "accessibility";

export type UpeBottomTab =
  | "comments"
  | "history"
  | "validation"
  | "compare"
  | "export";

export type UpeLeftTab =
  | "objects"
  | "structure"
  | "library"
  | "templates"
  | "media";

export type UpeRightTab =
  | "properties"
  | "pedagogy"
  | "design"
  | "accessibility"
  | "alignment"
  | "recommendations";

export type UpeAutosaveStatus = "idle" | "saving" | "saved" | "error";

export type UpeBlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "video"
  | "exercise"
  | "multiple_choice"
  | "open_question"
  | "matching"
  | "timeline"
  | "table"
  | "diagram"
  | "reflection"
  | "hint"
  | "teacher_note"
  | "success_criteria"
  | "interactive"
  | "divider"
  | "quote"
  | "media_gallery"
  | "custom";

export type UpeBlockVisibility = "teacher" | "student" | "both" | "hidden";

export type UpeEditorBlock = {
  id: string;
  type: UpeBlockType;
  content: Record<string, unknown>;
  order: number;
  locked?: boolean;
  visibility: UpeBlockVisibility;
  pedagogicalPurpose?: string;
  difficulty?: string;
  estimatedMinutes?: number;
  competencyIds?: string[];
  bloomLevel?: string;
  children?: UpeEditorBlock[];
};

export type UpeDocument = {
  id: string;
  objectType: string;
  title: string;
  lessonProjectId: string | null;
  lessonTitle?: string;
  subject: string;
  grade: string;
  language: string;
  blocks: UpeEditorBlock[];
  versionLabel: string;
  updatedAt: string;
  competencies: string[];
  learningObjectives: string[];
};

export type UpeValidationIssue = {
  id: string;
  severity: "error" | "warning" | "info";
  title: string;
  explanation: string;
  suggestedFix: string;
  estimatedImpact: string;
  blockId?: string;
  source: "pom" | "pie" | "upe";
};

export type UpeSearchHit = {
  id: string;
  kind: "block" | "objective" | "competency" | "resource";
  title: string;
  excerpt: string;
  blockId?: string;
};

export type UpeVersionSnapshot = {
  id: string;
  label: string;
  createdAt: string;
  summary: string;
  kind: "autosave" | "named" | "restore" | "duplicate";
  document: UpeDocument;
};

export type UpeWorkspaceState = {
  document: UpeDocument;
  selectedBlockId: string | null;
  leftTab: UpeLeftTab;
  rightTab: UpeRightTab;
  bottomTab: UpeBottomTab;
  previewMode: UpePreviewMode;
  searchQuery: string;
  bottomOpen: boolean;
  autosave: UpeAutosaveStatus;
  versions: UpeVersionSnapshot[];
  validationIssues: UpeValidationIssue[];
  pieSuggestions: Array<{
    id: string;
    title: string;
    explanation: string;
    rationale: string;
  }>;
};
