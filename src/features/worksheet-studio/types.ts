/**
 * Worksheet Studio — pedagogical block workspace (not a blank A4 page).
 */

export type WorksheetStatus =
  | "draft"
  | "in_progress"
  | "ready_for_review"
  | "published";

export type WorksheetBlockType =
  | "exercises"
  | "problems"
  | "tables"
  | "images"
  | "matching"
  | "crosswords"
  | "mazes"
  | "qr_activities"
  | "reflection"
  | "self_assessment"
  | "creative_tasks";

export type WorksheetBlock = {
  id: string;
  type: WorksheetBlockType;
  title: string;
  content: string;
  collapsed: boolean;
  order: number;
  aiHintDismissed?: boolean;
};

export type WorksheetProperties = {
  title: string;
  subject: string;
  grade: string;
  durationMinutes: number;
  instructions: string;
};

export type WorksheetDocument = {
  id: string;
  projectId: string;
  status: WorksheetStatus;
  version: number;
  properties: WorksheetProperties;
  blocks: WorksheetBlock[];
  guidedCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
};

export type WorksheetSortOption = "updated" | "created" | "alpha" | "status";
export type WorksheetViewMode = "grid" | "list";
