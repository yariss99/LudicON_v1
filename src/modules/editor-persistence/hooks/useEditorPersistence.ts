import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AUTOSAVE_DEBOUNCE_MS } from "../constants";
import { AutosaveManager } from "../services/AutosaveManager";
import { DraftManager } from "../services/DraftManager";
import { HistoryManager } from "../services/HistoryManager";
import type {
  CommitOptions,
  DraftRecord,
  EditorResourceType,
  HistoryAction,
  SaveStatus,
  VersionEntry,
} from "../types";
import { HISTORY_ACTION_LABEL } from "../types";

export type UseEditorPersistenceOptions<T> = {
  resourceType: EditorResourceType;
  resourceId: string;
  initialDocument: T;
  /** Persist to the studio repository (source of truth). */
  persist: (document: T) => T;
  /** Document updatedAt for draft comparison. */
  getUpdatedAt: (document: T) => string;
  /** Optional bump on manual save. */
  bumpOnManualSave?: (document: T) => T;
  debounceMs?: number;
};

export type DraftOffer<T> = {
  draft: DraftRecord<T>;
  continueEditing: () => void;
  discardDraft: () => void;
};

export type EditorPersistenceApi<T> = {
  document: T;
  status: SaveStatus;
  lastSavedAt: string | null;
  canUndo: boolean;
  canRedo: boolean;
  versions: VersionEntry<T>[];
  draftOffer: DraftOffer<T> | null;
  commit: (next: T, options?: CommitOptions) => void;
  saveNow: (label?: string) => void;
  undo: () => void;
  redo: () => void;
  restoreVersion: (versionId: string) => void;
  replaceDocument: (next: T, options?: { clearDraft?: boolean }) => void;
};

export function useEditorPersistence<T>(
  options: UseEditorPersistenceOptions<T>,
): EditorPersistenceApi<T> {
  const {
    resourceType,
    resourceId,
    initialDocument,
    persist,
    getUpdatedAt,
    bumpOnManualSave,
    debounceMs = AUTOSAVE_DEBOUNCE_MS,
  } = options;

  const historyRef = useRef(
    new HistoryManager<T>(resourceType, resourceId),
  );
  const draftRef = useRef(new DraftManager<T>(resourceType, resourceId));
  const persistRef = useRef(persist);
  persistRef.current = persist;
  const getUpdatedAtRef = useRef(getUpdatedAt);
  getUpdatedAtRef.current = getUpdatedAt;

  const [document, setDocument] = useState<T>(initialDocument);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() =>
    getUpdatedAt(initialDocument),
  );
  const [versions, setVersions] = useState<VersionEntry<T>[]>(() =>
    historyRef.current.listVersions(),
  );
  const [historyTick, setHistoryTick] = useState(0);
  const [draftOffer, setDraftOffer] = useState<DraftOffer<T> | null>(null);

  const docRef = useRef(document);
  docRef.current = document;
  const skipHistoryRef = useRef(false);

  const reloadVersions = useCallback(() => {
    setVersions(historyRef.current.listVersions());
  }, []);

  const autosaveRef = useRef<AutosaveManager<T> | null>(null);

  useEffect(() => {
    const history = historyRef.current;
    return history.subscribe(() => setHistoryTick((n) => n + 1));
  }, []);

  useEffect(() => {
    const manager = new AutosaveManager<T>({
      debounceMs,
      persist: (doc) => persistRef.current(doc),
      onStatus: (next) => setStatus(next),
      onSaved: (saved) => {
        setDocument(saved);
        docRef.current = saved;
        setLastSavedAt(getUpdatedAtRef.current(saved));
        draftRef.current.clearDraft();
        // Throttle autosave timeline entries (avoid one row per keystroke burst).
        const latest = historyRef.current.listVersions()[0];
        const recentAutosave =
          latest?.action === "autosave" &&
          Date.now() - Date.parse(latest.timestamp) < 30_000;
        if (!recentAutosave) {
          historyRef.current.pushVersion(saved, "autosave", "Autosave");
          reloadVersions();
        }
      },
    });
    autosaveRef.current = manager;
    return () => {
      manager.destroy();
      autosaveRef.current = null;
    };
  }, [resourceType, resourceId, debounceMs, reloadVersions]);

  // Offer restore when an unfinished draft is newer than persisted doc.
  useEffect(() => {
    const draftMgr = draftRef.current;
    const persistedAt = getUpdatedAt(initialDocument);
    if (!draftMgr.hasUnfinishedDraft(persistedAt)) return;

    const draft = draftMgr.loadDraft();
    if (!draft) return;

    setDraftOffer({
      draft,
      continueEditing: () => {
        skipHistoryRef.current = true;
        setDocument(draft.snapshot);
        docRef.current = draft.snapshot;
        setDraftOffer(null);
        autosaveRef.current?.markDirty(draft.snapshot);
      },
      discardDraft: () => {
        draftMgr.clearDraft();
        setDraftOffer(null);
      },
    });
    // Only on mount / resource change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceType, resourceId]);

  const commit = useCallback(
    (next: T, commitOptions?: CommitOptions) => {
      const record = commitOptions?.recordHistory !== false;
      if (record && !skipHistoryRef.current) {
        historyRef.current.pushUndo(docRef.current);
      }
      skipHistoryRef.current = false;
      setDocument(next);
      docRef.current = next;
      draftRef.current.saveDraft(next);
      autosaveRef.current?.markDirty(next);
    },
    [],
  );

  const saveNow = useCallback(
    (label?: string) => {
      const current = docRef.current;
      const toSave = bumpOnManualSave ? bumpOnManualSave(current) : current;
      setStatus("saving");
      try {
        const saved = persistRef.current(toSave);
        setDocument(saved);
        docRef.current = saved;
        setLastSavedAt(getUpdatedAtRef.current(saved));
        setStatus("saved");
        draftRef.current.clearDraft();
        historyRef.current.pushVersion(
          saved,
          "manual_save",
          label ?? HISTORY_ACTION_LABEL.manual_save,
        );
        reloadVersions();
      } catch {
        setStatus("failed");
      }
    },
    [bumpOnManualSave, reloadVersions],
  );

  const undo = useCallback(() => {
    const previous = historyRef.current.undo(docRef.current);
    if (!previous) return;
    skipHistoryRef.current = true;
    commit(previous, { recordHistory: false, action: "edit" });
  }, [commit]);

  const redo = useCallback(() => {
    const next = historyRef.current.redo(docRef.current);
    if (!next) return;
    skipHistoryRef.current = true;
    commit(next, { recordHistory: false, action: "edit" });
  }, [commit]);

  const restoreVersion = useCallback(
    (versionId: string) => {
      const snapshot = historyRef.current.restoreSnapshot(versionId);
      if (!snapshot) return;
      historyRef.current.pushUndo(docRef.current);
      skipHistoryRef.current = true;
      const restored = persistRef.current(snapshot);
      setDocument(restored);
      docRef.current = restored;
      setLastSavedAt(getUpdatedAtRef.current(restored));
      setStatus("saved");
      draftRef.current.clearDraft();
      historyRef.current.pushVersion(restored, "restore", "Restored version");
      historyRef.current.clearStacks();
      reloadVersions();
    },
    [reloadVersions],
  );

  const replaceDocument = useCallback(
    (next: T, opts?: { clearDraft?: boolean }) => {
      setDocument(next);
      docRef.current = next;
      setLastSavedAt(getUpdatedAtRef.current(next));
      setStatus("saved");
      if (opts?.clearDraft !== false) draftRef.current.clearDraft();
    },
    [],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      if (!mod) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      // Allow undo in inputs too — teachers expect Ctrl+Z while typing.
      void tag;
      if (event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if (
        event.key.toLowerCase() === "y" ||
        (event.key.toLowerCase() === "z" && event.shiftKey)
      ) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return useMemo(
    () => ({
      document,
      status,
      lastSavedAt,
      canUndo: historyRef.current.canUndo,
      canRedo: historyRef.current.canRedo,
      versions,
      draftOffer,
      commit,
      saveNow,
      undo,
      redo,
      restoreVersion,
      replaceDocument,
    }),
    // historyTick refreshes canUndo/canRedo
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      document,
      status,
      lastSavedAt,
      versions,
      draftOffer,
      commit,
      saveNow,
      undo,
      redo,
      restoreVersion,
      replaceDocument,
      historyTick,
    ],
  );
}

/** Infer a history action from common block/metadata edit shapes. */
export function inferHistoryAction(input: {
  kind:
    | "text"
    | "reorder"
    | "add"
    | "delete"
    | "metadata"
    | "edit";
}): HistoryAction {
  switch (input.kind) {
    case "text":
      return "text_change";
    case "reorder":
      return "block_order";
    case "add":
      return "block_added";
    case "delete":
      return "block_deleted";
    case "metadata":
      return "metadata";
    default:
      return "edit";
  }
}
