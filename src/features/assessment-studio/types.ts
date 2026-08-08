/**
 * Assessment Studio — competency-focused measurement workspace.
 */

export type AssessmentStudioStatus =
  | "draft"
  | "in_progress"
  | "ready_for_review"
  | "published";

export type AssessmentPurpose =
  | "initial"
  | "formative"
  | "summative"
  | "self"
  | "differentiated"
  | "progress_monitoring";

export type AssessmentBlockType =
  | "short_answer"
  | "multiple_choice"
  | "true_false"
  | "matching"
  | "ordering"
  | "fill_blank"
  | "problem_solving"
  | "essay"
  | "practical_task"
  | "observation"
  | "portfolio"
  | "self_assessment"
  | "rubric";

export type AssessmentBlock = {
  id: string;
  type: AssessmentBlockType;
  title: string;
  content: string;
  collapsed: boolean;
  order: number;
  /** Competency labels selected from the current project metadata. */
  competencyIds: string[];
  aiHintDismissed?: boolean;
};

export type AssessmentStudioProperties = {
  title: string;
  subject: string;
  grade: string;
  purpose: AssessmentPurpose;
  /** Document-level targeted competencies (subset of project competencies). */
  competencies: string[];
  durationMinutes: number;
  instructions: string;
};

export type AssessmentSummary = {
  targetedCompetencies: string[];
  purpose: AssessmentPurpose;
  itemCount: number;
  estimatedDurationMinutes: number;
  updatedAt: string;
};

export type AssessmentStudioDocument = {
  id: string;
  projectId: string;
  status: AssessmentStudioStatus;
  version: number;
  properties: AssessmentStudioProperties;
  blocks: AssessmentBlock[];
  summary: AssessmentSummary;
  guidedCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
};

export type AssessmentSortOption = "updated" | "created" | "alpha" | "status";
export type AssessmentViewMode = "grid" | "list";
