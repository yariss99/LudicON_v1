/** Platform-wide editor persistence domain (Mission 006). */

export type EditorResourceType =
  | "lesson"
  | "worksheet"
  | "assessment"
  | "presentation"
  | "game"
  | "story";

export type SaveStatus =
  | "idle"
  | "dirty"
  | "saving"
  | "saved"
  | "failed";

/** Alias used by studio hooks. */
export type AutosaveState = SaveStatus;

export type HistoryAction =
  | "text_change"
  | "block_order"
  | "block_added"
  | "block_deleted"
  | "metadata"
  | "restore"
  | "manual_save"
  | "autosave"
  | "edit";

export type VersionEntry<TSnapshot = unknown> = {
  id: string;
  resourceType: EditorResourceType;
  resourceId: string;
  timestamp: string;
  action: HistoryAction;
  label: string;
  snapshot: TSnapshot;
};

export type DraftRecord<TSnapshot = unknown> = {
  resourceType: EditorResourceType;
  resourceId: string;
  updatedAt: string;
  snapshot: TSnapshot;
};

export type CommitOptions = {
  /** Record undo snapshot of the previous document. Default true. */
  recordHistory?: boolean;
  /** Classify the edit for version labels / analytics. */
  action?: HistoryAction;
};

export const HISTORY_ACTION_LABEL: Record<HistoryAction, string> = {
  text_change: "Text edit",
  block_order: "Reordered blocks",
  block_added: "Added block",
  block_deleted: "Deleted block",
  metadata: "Updated metadata",
  restore: "Restored version",
  manual_save: "Manual save",
  autosave: "Autosave",
  edit: "Edited",
};
