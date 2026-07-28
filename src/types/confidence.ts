import type { Project, ProjectResource } from "./project";

/**
 * Teacher Confidence Engine — evaluates the learning experience.
 * Never evaluates the teacher.
 */

export type ConfidenceDimensionId =
  | "readiness"
  | "timing"
  | "resources"
  | "assessment"
  | "differentiation"
  | "reflection";

export type ConfidenceLevel = "ready" | "almost" | "building";

export type ConfidenceActionId =
  | "ready_lesson"
  | "add_short_assessment"
  | "ready_assessment"
  | "add_reflection"
  | "ready_reflection"
  | "add_collaborative_activity"
  | "add_support_path"
  | "ready_resources"
  | "trim_optional_block";

export type ConfidenceDimension = {
  id: ConfidenceDimensionId;
  label: string;
  /** 0–100 readiness of the experience — never teacher quality */
  score: number;
  level: ConfidenceLevel;
  /** Required: why this score */
  explanation: string;
};

export type ConfidenceImprovement = {
  id: string;
  actionId: ConfidenceActionId;
  dimension: ConfidenceDimensionId;
  label: string;
  detail: string;
  /** Estimated readiness lift for the experience */
  impactHint: string;
};

export type ConfidenceReport = {
  /** Overall lesson readiness (0–100) — not teacher quality */
  score: number;
  level: ConfidenceLevel;
  headline: string;
  reassurance: string;
  dimensions: ConfidenceDimension[];
  improvements: ConfidenceImprovement[];
  estimatedMinutes: number;
  availableMinutes: number;
  analyzedAt: string;
};

export type ConfidenceInput = {
  project: Pick<Project, "id" | "title" | "subject" | "grade" | "description">;
  resources: ProjectResource[];
  availableMinutes?: number;
  intention?: string;
};
