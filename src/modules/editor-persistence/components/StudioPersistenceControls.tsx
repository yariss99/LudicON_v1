import { useState, type ReactNode } from "react";
import type { DraftOffer } from "../hooks/useEditorPersistence";
import type { SaveStatus, VersionEntry } from "../types";
import { RestoreDraftDialog } from "./RestoreDraftDialog";
import { SaveStatusBadge } from "./SaveStatusBadge";
import { VersionHistoryPanel } from "./VersionHistoryPanel";

type Props<T> = {
  status: SaveStatus;
  lastSavedAt: string | null;
  canUndo: boolean;
  canRedo: boolean;
  versions: VersionEntry<T>[];
  draftOffer: DraftOffer<T> | null;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onRestore: (versionId: string) => void;
  /** Extra toolbar buttons rendered before Undo. */
  leadingActions?: ReactNode;
  /** Extra toolbar buttons rendered after History, before Save. */
  trailingActions?: ReactNode;
};

/** Shared undo/redo/history/save chrome for Advanced studio headers. */
export function StudioPersistenceControls<T>({
  status,
  lastSavedAt,
  canUndo,
  canRedo,
  versions,
  draftOffer,
  onUndo,
  onRedo,
  onSave,
  onRestore,
  leadingActions,
  trailingActions,
}: Props<T>) {
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <>
      <SaveStatusBadge status={status} lastSavedAt={lastSavedAt} />
      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        {leadingActions}
        <button
          type="button"
          disabled={!canUndo}
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
        >
          Undo
        </button>
        <button
          type="button"
          disabled={!canRedo}
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          onClick={onRedo}
          title="Redo (Ctrl+Y)"
        >
          Redo
        </button>
        <button
          type="button"
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          onClick={() => setHistoryOpen(true)}
        >
          History
        </button>
        {trailingActions}
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          onClick={onSave}
        >
          Save
        </button>
      </div>

      <VersionHistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        versions={versions}
        onRestore={onRestore}
      />
      {draftOffer ? <RestoreDraftDialog offer={draftOffer} /> : null}
    </>
  );
}
