/**
 * IT-006 — Asset Studio
 * Synchronized educational design studio. Every asset stays linked to its Blueprint.
 * Not a generic document editor.
 */

import type { DecisionBlueprint } from "../../engines/decision";
import type { ReviewSectionId } from "../blueprint-review/types";
import type { AssetTypeId, GeneratedBlock } from "../generation-workspace/types";

export type StudioBlockKind =
  | "text"
  | "table"
  | "image"
  | "icon"
  | "list"
  | "callout"
  | "template"
  | "interactive";

export type AlignmentStatus =
  | "aligned"
  | "warning"
  | "conflict"
  | "unknown";

export type AlignmentDecision = "keep" | "revise" | "update_blueprint";

export type ExportFormat = "pdf" | "docx" | "pptx" | "html" | "scorm";

export type StudioCommentStatus = "open" | "resolved";

export type StudioNode = {
  id: string;
  title: string;
  kind: StudioBlockKind;
  body: string;
  /** Blueprint sections this node must remain faithful to */
  sourceSections: ReviewSectionId[];
  parentId: string | null;
  order: number;
};

export type AlignmentIssue = {
  id: string;
  nodeId: string;
  status: Exclude<AlignmentStatus, "aligned" | "unknown">;
  message: string;
  suggestion: string;
};

export type AlignmentReport = {
  status: AlignmentStatus;
  issues: AlignmentIssue[];
  checkedAt: string;
};

export type StudioComment = {
  id: string;
  nodeId: string;
  body: string;
  author: string;
  status: StudioCommentStatus;
  createdAt: string;
  resolvedAt: string | null;
};

export type SmartCommandProposal = {
  id: string;
  command: string;
  nodeId: string;
  summary: string;
  proposedBody: string;
  status: "pending" | "approved" | "rejected";
};

export type StudioRevision = {
  id: string;
  versionLabel: string;
  createdAt: string;
  author: string;
  summary: string;
  nodes: StudioNode[];
  branchFromId: string | null;
  /** Duplicate / branch marker */
  kind: "save" | "duplicate" | "branch" | "restore";
};

export type AssetStudioDocument = {
  id: string;
  workspaceId: string;
  blueprintId: string;
  assetTypeId: AssetTypeId;
  title: string;
  /** Immutable Blueprint relationship */
  blueprintVersionId: string;
  blueprintVersionLabel: string;
  blueprintSnapshot: DecisionBlueprint;
  nodes: StudioNode[];
  selectedNodeId: string | null;
  revisions: StudioRevision[];
  currentRevisionId: string;
  comments: StudioComment[];
  alignment: AlignmentReport | null;
  pendingProposal: SmartCommandProposal | null;
  relatedAssetTypeIds: AssetTypeId[];
  createdAt: string;
  updatedAt: string;
};

export type StructureItem = {
  id: string;
  title: string;
  depth: number;
  alignment: AlignmentStatus;
};

/** Seed payload from Generation Workspace */
export type AssetStudioOpenInput = {
  workspaceId: string;
  blueprintId: string;
  assetTypeId: AssetTypeId;
  title: string;
  blueprintVersionId: string;
  blueprintVersionLabel: string;
  blueprintSnapshot: DecisionBlueprint;
  blocks: GeneratedBlock[];
  relatedAssetTypeIds: AssetTypeId[];
  author: string;
};
