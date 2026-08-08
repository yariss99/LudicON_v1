/**
 * Universal Block Editor — shared block model for every educational resource.
 */

export type UniversalBlockType =
  | "text"
  | "image"
  | "video"
  | "table"
  | "exercise"
  | "question"
  | "brainstorm"
  | "reflection"
  | "attachment";

export type UniversalBlock = {
  id: string;
  type: UniversalBlockType;
  title: string;
  content: string;
  collapsed: boolean;
  order: number;
  /** Copilot placeholder — dismissed in-session / persisted. */
  copilotDismissed?: boolean;
};

export type BlockDefinition = {
  type: UniversalBlockType;
  label: string;
  description: string;
  placeholder: string;
  icon: string;
  /** Optional factory override when registering custom types later. */
  create?: (order: number) => UniversalBlock;
};

export type BlockDocument = {
  id: string;
  title: string;
  projectId: string | null;
  resourceKind: string;
  blocks: UniversalBlock[];
  createdAt: string;
  updatedAt: string;
};

export type AutosaveState = "idle" | "saving" | "saved" | "dirty";

export type CopilotBlockSuggestion = {
  id: string;
  label: string;
  detail: string;
};
