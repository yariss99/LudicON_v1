import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addBlock as addBlockOp,
  deleteBlock as deleteBlockOp,
  duplicateBlock as duplicateBlockOp,
  moveBlock as moveBlockOp,
  reorderBlocks as reorderBlocksOp,
  sortBlocks,
  updateBlock as updateBlockOp,
} from "../services/blockOps";
import { blockDocumentStore } from "../services/documentStore";
import type {
  AutosaveState,
  BlockDocument,
  UniversalBlock,
  UniversalBlockType,
} from "../types";

type BlockEditorContextValue = {
  document: BlockDocument;
  blocks: UniversalBlock[];
  autosave: AutosaveState;
  lastSavedAt: string | null;
  canUndo: boolean;
  canRedo: boolean;
  setTitle: (title: string) => void;
  addBlock: (type: UniversalBlockType | string) => void;
  updateBlock: (id: string, patch: Partial<UniversalBlock>) => void;
  duplicateBlock: (id: string) => void;
  deleteBlock: (id: string) => void;
  toggleCollapse: (id: string) => void;
  moveBlock: (id: string, direction: -1 | 1) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  dismissCopilot: (id: string) => void;
  saveNow: () => void;
  undo: () => void;
  redo: () => void;
};

const BlockEditorContext = createContext<BlockEditorContextValue | null>(null);

type Snapshot = {
  title: string;
  blocks: UniversalBlock[];
};

export function BlockEditorProvider({
  documentId,
  children,
}: {
  documentId?: string | null;
  children: ReactNode;
}) {
  const [document, setDocument] = useState<BlockDocument>(() =>
    blockDocumentStore.ensure(documentId),
  );
  const [autosave, setAutosave] = useState<AutosaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);

  const dirtyRef = useRef(false);
  const docRef = useRef(document);
  const debounceRef = useRef<number | null>(null);
  const skipHistoryRef = useRef(false);

  useEffect(() => {
    docRef.current = document;
  }, [document]);

  useEffect(() => {
    if (!documentId) return;
    const next = blockDocumentStore.ensure(documentId);
    setDocument(next);
    setPast([]);
    setFuture([]);
  }, [documentId]);

  const persist = useCallback((next: BlockDocument) => {
    const saved = blockDocumentStore.save(next);
    setDocument(saved);
    dirtyRef.current = false;
    setAutosave("saved");
    setLastSavedAt(saved.updatedAt);
    return saved;
  }, []);

  const commit = useCallback((next: BlockDocument, recordHistory = true) => {
    if (recordHistory && !skipHistoryRef.current) {
      setPast((p) =>
        [
          ...p,
          {
            title: docRef.current.title,
            blocks: structuredClone(docRef.current.blocks),
          },
        ].slice(-50),
      );
      setFuture([]);
    }
    skipHistoryRef.current = false;
    setDocument(next);
    dirtyRef.current = true;
    setAutosave("dirty");
  }, []);

  useEffect(() => {
    if (autosave !== "dirty") return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (!docRef.current || !dirtyRef.current) return;
      setAutosave("saving");
      persist(docRef.current);
    }, 900);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [autosave, document, persist]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        // handled via exposed undo — dispatch through ref below
        window.dispatchEvent(new CustomEvent("prima:block-editor-undo"));
      }
      if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("prima:block-editor-redo"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setTitle = useCallback(
    (title: string) => {
      commit({ ...document, title });
    },
    [commit, document],
  );

  const addBlock = useCallback(
    (type: UniversalBlockType | string) => {
      commit({
        ...document,
        blocks: addBlockOp(document.blocks, type),
      });
    },
    [commit, document],
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<UniversalBlock>) => {
      commit({
        ...document,
        blocks: updateBlockOp(document.blocks, id, patch),
      });
    },
    [commit, document],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      commit({
        ...document,
        blocks: duplicateBlockOp(document.blocks, id),
      });
    },
    [commit, document],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      commit({
        ...document,
        blocks: deleteBlockOp(document.blocks, id),
      });
    },
    [commit, document],
  );

  const toggleCollapse = useCallback(
    (id: string) => {
      const block = document.blocks.find((b) => b.id === id);
      if (!block) return;
      commit({
        ...document,
        blocks: updateBlockOp(document.blocks, id, {
          collapsed: !block.collapsed,
        }),
      });
    },
    [commit, document],
  );

  const moveBlock = useCallback(
    (id: string, direction: -1 | 1) => {
      commit({
        ...document,
        blocks: moveBlockOp(document.blocks, id, direction),
      });
    },
    [commit, document],
  );

  const reorderBlocks = useCallback(
    (fromIndex: number, toIndex: number) => {
      commit({
        ...document,
        blocks: reorderBlocksOp(document.blocks, fromIndex, toIndex),
      });
    },
    [commit, document],
  );

  const dismissCopilot = useCallback(
    (id: string) => {
      commit({
        ...document,
        blocks: updateBlockOp(document.blocks, id, { copilotDismissed: true }),
      });
    },
    [commit, document],
  );

  const saveNow = useCallback(() => {
    setAutosave("saving");
    persist(document);
  }, [document, persist]);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [
        {
          title: document.title,
          blocks: structuredClone(document.blocks),
        },
        ...f,
      ]);
      skipHistoryRef.current = true;
      commit(
        {
          ...document,
          title: prev.title,
          blocks: prev.blocks,
        },
        false,
      );
      return p.slice(0, -1);
    });
  }, [commit, document]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const [next, ...rest] = f;
      setPast((p) => [
        ...p,
        {
          title: document.title,
          blocks: structuredClone(document.blocks),
        },
      ]);
      skipHistoryRef.current = true;
      commit(
        {
          ...document,
          title: next.title,
          blocks: next.blocks,
        },
        false,
      );
      return rest;
    });
  }, [commit, document]);

  useEffect(() => {
    const onUndo = () => undo();
    const onRedo = () => redo();
    window.addEventListener("prima:block-editor-undo", onUndo);
    window.addEventListener("prima:block-editor-redo", onRedo);
    return () => {
      window.removeEventListener("prima:block-editor-undo", onUndo);
      window.removeEventListener("prima:block-editor-redo", onRedo);
    };
  }, [undo, redo]);

  const value = useMemo<BlockEditorContextValue>(
    () => ({
      document,
      blocks: sortBlocks(document.blocks),
      autosave,
      lastSavedAt,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      setTitle,
      addBlock,
      updateBlock,
      duplicateBlock,
      deleteBlock,
      toggleCollapse,
      moveBlock,
      reorderBlocks,
      dismissCopilot,
      saveNow,
      undo,
      redo,
    }),
    [
      document,
      autosave,
      lastSavedAt,
      past.length,
      future.length,
      setTitle,
      addBlock,
      updateBlock,
      duplicateBlock,
      deleteBlock,
      toggleCollapse,
      moveBlock,
      reorderBlocks,
      dismissCopilot,
      saveNow,
      undo,
      redo,
    ],
  );

  return (
    <BlockEditorContext.Provider value={value}>
      {children}
    </BlockEditorContext.Provider>
  );
}

export function useBlockEditor() {
  const ctx = useContext(BlockEditorContext);
  if (!ctx) {
    throw new Error("useBlockEditor must be used within BlockEditorProvider");
  }
  return ctx;
}
