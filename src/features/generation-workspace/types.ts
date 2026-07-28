/**
 * IT-005 — Generation Workspace
 * Executes approved Instructional Blueprints into educational assets.
 * Generation never decides pedagogy; never starts from free prompts.
 */

import type { DecisionBlueprint } from "../../engines/decision";
import type { ReviewSectionId } from "../blueprint-review/types";

export type AssetTypeId =
  | "lesson_plan"
  | "worksheet"
  | "assessment"
  | "presentation"
  | "educational_game"
  | "story"
  | "visual_resources"
  | "homework"
  | "rubric"
  | "observation_sheet"
  | "parent_communication"
  | "classroom_activities"
  | "teacher_notes";

/** Pipeline stages — every stage visible */
export type PipelineStage =
  | "queued"
  | "preparing"
  | "generating"
  | "reviewing"
  | "completed"
  | "available";

/** Live asset status — one state each */
export type AssetLiveStatus =
  | "not_generated"
  | "queued"
  | "generating"
  | "completed"
  | "needs_update"
  | "failed";

export type RegenerationScope =
  | "entire_asset"
  | "selected_section"
  | "selected_activity"
  | "selected_assessment";

export type WorkspaceUiState =
  | "loading"
  | "ready"
  | "redirect_review"
  | "empty"
  | "error";

export type QualityMetricId =
  | "generation_quality"
  | "blueprint_alignment"
  | "pedagogical_consistency"
  | "completeness"
  | "ai_confidence";

export type QualityMetric = {
  id: QualityMetricId;
  label: string;
  score: number;
  explanation: string;
};

export type QualityReport = {
  metrics: QualityMetric[];
  overall: number;
  warnings: string[];
  evaluatedAt: string;
};

export type AssetDependency = {
  assetTypeId: AssetTypeId;
  reason: string;
};

export type GeneratedBlock = {
  id: string;
  title: string;
  body: string;
  sourceSections: ReviewSectionId[];
};

export type AssetVersion = {
  id: string;
  versionLabel: string;
  createdAt: string;
  blueprintVersionId: string;
  blueprintVersionLabel: string;
  scope: RegenerationScope;
  blocks: GeneratedBlock[];
  quality: QualityReport;
  pipelineStage: PipelineStage;
  /** Kept when a later attempt fails */
  preserved: boolean;
};

export type GeneratedAsset = {
  typeId: AssetTypeId;
  status: AssetLiveStatus;
  pipelineStage: PipelineStage | null;
  lastGeneratedAt: string | null;
  currentVersionId: string | null;
  versions: AssetVersion[];
  /** Blueprint version this asset was last generated from */
  sourceBlueprintVersionId: string | null;
  sourceBlueprintVersionLabel: string | null;
  streamingText: string;
  errorMessage: string | null;
  outdated: boolean;
  selectedScope: RegenerationScope;
};

export type QueueItem = {
  id: string;
  assetTypeId: AssetTypeId;
  scope: RegenerationScope;
  scopeTarget?: string;
  enqueuedAt: string;
  startedAt: string | null;
  status: Extract<
    AssetLiveStatus,
    "queued" | "generating" | "completed" | "failed"
  >;
};

export type AssetTypeDefinition = {
  id: AssetTypeId;
  title: string;
  description: string;
  icon: string;
  /** Blueprint sections this asset depends on */
  sourceSections: ReviewSectionId[];
  dependencies: AssetDependency[];
};

export type GenerationWorkspaceDocument = {
  id: string;
  blueprintId: string;
  projectId: string | null;
  title: string;
  approvedBlueprintVersionId: string;
  approvedBlueprintVersionLabel: string;
  /** Snapshot used for generation — never from free prompt */
  blueprintSnapshot: DecisionBlueprint;
  assets: Record<AssetTypeId, GeneratedAsset>;
  queue: QueueItem[];
  selectedAssetTypeId: AssetTypeId | null;
  createdAt: string;
  updatedAt: string;
};

export type GenerationProgressEvent = {
  assetTypeId: AssetTypeId;
  stage: PipelineStage;
  streamingText: string;
  status: AssetLiveStatus;
};
