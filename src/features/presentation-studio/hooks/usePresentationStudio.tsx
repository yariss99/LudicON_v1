import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Project } from "../../../types/project";
import { useProjects } from "../../../context/ProjectContext";
import {
  inferHistoryAction,
  useEditorPersistence,
  type AutosaveState,
  type DraftOffer,
  type VersionEntry,
} from "../../../modules/editor-persistence";
import { createPresentationBlock } from "../services/seedFromResources";
import { presentationStudioRepository } from "../services/presentationStudioRepository";
import { aiImprovePresentationBlock } from "../services/blockAiSuggestions";
import type {
  PresentationBlock,
  PresentationBlockType,
  PresentationStudioDocument,
  PresentationStudioProperties,
  PresentationStudioStatus,
} from "../types";

export type { AutosaveState };

type PresentationStudioContextValue = {
  project: Project;
  presentation: PresentationStudioDocument;
  autosave: AutosaveState;
  lastSavedAt: string | null;
  canUndo: boolean;
  canRedo: boolean;
  versions: VersionEntry<PresentationStudioDocument>[];
  draftOffer: DraftOffer<PresentationStudioDocument> | null;
  setProperties: (patch: Partial<PresentationStudioProperties>) => void;
  setStatus: (status: PresentationStudioStatus) => void;
  addBlock: (type: PresentationBlockType) => void;
  updateBlock: (id: string, patch: Partial<PresentationBlock>) => void;
  duplicateBlock: (id: string) => void;
  deleteBlock: (id: string) => void;
  toggleCollapse: (id: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  applyAiImprove: (id: string) => void;
  dismissAiHint: (id: string) => void;
  completeGuided: () => void;
  saveNow: () => void;
  undo: () => void;
  redo: () => void;
  restoreVersion: (versionId: string) => void;
};

const PresentationStudioContext =
  createContext<PresentationStudioContextValue | null>(null);

function PresentationStudioSession({
  project,
  initial,
  children,
}: {
  project: Project;
  initial: PresentationStudioDocument;
  children: ReactNode;
}) {
  const persistence = useEditorPersistence<PresentationStudioDocument>({
    resourceType: "presentation",
    resourceId: initial.id,
    initialDocument: initial,
    persist: (doc) => presentationStudioRepository.save(doc),
    getUpdatedAt: (doc) => doc.updatedAt,
    bumpOnManualSave: (doc) => ({ ...doc, version: doc.version + 1 }),
  });

  const presentation = persistence.document;
  const commit = persistence.commit;

  const bumpStatus = (doc: PresentationStudioDocument) =>
    doc.status === "draft" ? ("in_progress" as const) : doc.status;

  const setProperties = useCallback(
    (patch: Partial<PresentationStudioProperties>) => {
      commit(
        {
          ...presentation,
          properties: { ...presentation.properties, ...patch },
          status: bumpStatus(presentation),
        },
        { action: inferHistoryAction({ kind: "metadata" }) },
      );
    },
    [presentation, commit],
  );

  const setStatus = useCallback(
    (status: PresentationStudioStatus) => {
      commit({ ...presentation, status }, { action: "metadata" });
    },
    [presentation, commit],
  );

  const addBlock = useCallback(
    (type: PresentationBlockType) => {
      const block = createPresentationBlock(type, presentation.blocks.length);
      commit(
        {
          ...presentation,
          blocks: [...presentation.blocks, block],
          status: bumpStatus(presentation),
        },
        { action: "block_added" },
      );
    },
    [presentation, commit],
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<PresentationBlock>) => {
      commit(
        {
          ...presentation,
          blocks: presentation.blocks.map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
          status: bumpStatus(presentation),
        },
        {
          action: inferHistoryAction({
            kind: "content" in patch || "title" in patch ? "text" : "edit",
          }),
        },
      );
    },
    [presentation, commit],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const source = presentation.blocks.find((b) => b.id === id);
      if (!source) return;
      const copy = {
        ...structuredClone(source),
        id: createPresentationBlock(source.type, presentation.blocks.length).id,
        title: `${source.title} (copy)`,
        order: presentation.blocks.length,
        aiHintDismissed: false,
      };
      const index = presentation.blocks.findIndex((b) => b.id === id);
      const blocks = [...presentation.blocks];
      blocks.splice(index + 1, 0, copy);
      commit(
        {
          ...presentation,
          blocks: blocks.map((b, order) => ({ ...b, order })),
        },
        { action: "block_added" },
      );
    },
    [presentation, commit],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      commit(
        {
          ...presentation,
          blocks: presentation.blocks
            .filter((b) => b.id !== id)
            .map((b, order) => ({ ...b, order })),
        },
        { action: "block_deleted" },
      );
    },
    [presentation, commit],
  );

  const toggleCollapse = useCallback(
    (id: string) => {
      commit({
        ...presentation,
        blocks: presentation.blocks.map((b) =>
          b.id === id ? { ...b, collapsed: !b.collapsed } : b,
        ),
      });
    },
    [presentation, commit],
  );

  const reorderBlocks = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const blocks = [...presentation.blocks].sort((a, b) => a.order - b.order);
      const [moved] = blocks.splice(fromIndex, 1);
      if (!moved) return;
      blocks.splice(toIndex, 0, moved);
      commit(
        {
          ...presentation,
          blocks: blocks.map((b, order) => ({ ...b, order })),
        },
        { action: "block_order" },
      );
    },
    [presentation, commit],
  );

  const applyAiImprove = useCallback(
    (id: string) => {
      commit({
        ...presentation,
        blocks: presentation.blocks.map((b) =>
          b.id === id
            ? {
                ...b,
                content: aiImprovePresentationBlock(b),
                aiHintDismissed: true,
              }
            : b,
        ),
        status: "in_progress",
      });
    },
    [presentation, commit],
  );

  const dismissAiHint = useCallback(
    (id: string) => {
      commit({
        ...presentation,
        blocks: presentation.blocks.map((b) =>
          b.id === id ? { ...b, aiHintDismissed: true } : b,
        ),
      });
    },
    [presentation, commit],
  );

  const completeGuided = useCallback(() => {
    const next = {
      ...presentation,
      guidedCompleted: true,
      status: "in_progress" as const,
    };
    persistence.replaceDocument(presentationStudioRepository.save(next));
  }, [presentation, persistence]);

  const value = useMemo<PresentationStudioContextValue>(
    () => ({
      project,
      presentation,
      autosave: persistence.status,
      lastSavedAt: persistence.lastSavedAt,
      canUndo: persistence.canUndo,
      canRedo: persistence.canRedo,
      versions: persistence.versions,
      draftOffer: persistence.draftOffer,
      setProperties,
      setStatus,
      addBlock,
      updateBlock,
      duplicateBlock,
      deleteBlock,
      toggleCollapse,
      reorderBlocks,
      applyAiImprove,
      dismissAiHint,
      completeGuided,
      saveNow: () => persistence.saveNow(),
      undo: persistence.undo,
      redo: persistence.redo,
      restoreVersion: persistence.restoreVersion,
    }),
    [
      project,
      presentation,
      persistence,
      setProperties,
      setStatus,
      addBlock,
      updateBlock,
      duplicateBlock,
      deleteBlock,
      toggleCollapse,
      reorderBlocks,
      applyAiImprove,
      dismissAiHint,
      completeGuided,
    ],
  );

  return (
    <PresentationStudioContext.Provider value={value}>
      {children}
    </PresentationStudioContext.Provider>
  );
}

export function PresentationStudioProvider({
  projectId,
  presentationId,
  children,
}: {
  projectId: string;
  presentationId: string;
  children: ReactNode;
}) {
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const initial = presentationStudioRepository.getById(presentationId);

  if (!project || !initial || initial.projectId !== projectId) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] p-8 text-slate-600">
        Loading Presentation Studio…
      </div>
    );
  }

  return (
    <PresentationStudioSession project={project} initial={initial}>
      {children}
    </PresentationStudioSession>
  );
}

export function usePresentationStudio() {
  const ctx = useContext(PresentationStudioContext);
  if (!ctx) {
    throw new Error(
      "usePresentationStudio must be used within PresentationStudioProvider",
    );
  }
  return ctx;
}
