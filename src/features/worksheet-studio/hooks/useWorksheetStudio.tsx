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
import {
  createWorksheetBlock,
  worksheetStudioRepository,
} from "../services/worksheetStudioRepository";
import { aiImproveWorksheetBlock } from "../services/blockAiSuggestions";
import type {
  WorksheetBlock,
  WorksheetBlockType,
  WorksheetDocument,
  WorksheetProperties,
  WorksheetStatus,
} from "../types";

export type { AutosaveState };

type WorksheetStudioContextValue = {
  project: Project;
  worksheet: WorksheetDocument;
  autosave: AutosaveState;
  lastSavedAt: string | null;
  canUndo: boolean;
  canRedo: boolean;
  versions: VersionEntry<WorksheetDocument>[];
  draftOffer: DraftOffer<WorksheetDocument> | null;
  setProperties: (patch: Partial<WorksheetProperties>) => void;
  setStatus: (status: WorksheetStatus) => void;
  addBlock: (type: WorksheetBlockType) => void;
  updateBlock: (id: string, patch: Partial<WorksheetBlock>) => void;
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

const WorksheetStudioContext =
  createContext<WorksheetStudioContextValue | null>(null);

function WorksheetStudioSession({
  project,
  initial,
  children,
}: {
  project: Project;
  initial: WorksheetDocument;
  children: ReactNode;
}) {
  const persistence = useEditorPersistence<WorksheetDocument>({
    resourceType: "worksheet",
    resourceId: initial.id,
    initialDocument: initial,
    persist: (doc) => worksheetStudioRepository.save(doc),
    getUpdatedAt: (doc) => doc.updatedAt,
    bumpOnManualSave: (doc) => ({ ...doc, version: doc.version + 1 }),
  });

  const worksheet = persistence.document;
  const commit = persistence.commit;

  const setProperties = useCallback(
    (patch: Partial<WorksheetProperties>) => {
      commit(
        {
          ...worksheet,
          properties: { ...worksheet.properties, ...patch },
          status:
            worksheet.status === "draft" ? "in_progress" : worksheet.status,
        },
        { action: inferHistoryAction({ kind: "metadata" }) },
      );
    },
    [worksheet, commit],
  );

  const setStatus = useCallback(
    (status: WorksheetStatus) => {
      commit({ ...worksheet, status }, { action: "metadata" });
    },
    [worksheet, commit],
  );

  const addBlock = useCallback(
    (type: WorksheetBlockType) => {
      const block = createWorksheetBlock(type, worksheet.blocks.length);
      commit(
        {
          ...worksheet,
          blocks: [...worksheet.blocks, block],
          status:
            worksheet.status === "draft" ? "in_progress" : worksheet.status,
        },
        { action: "block_added" },
      );
    },
    [worksheet, commit],
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<WorksheetBlock>) => {
      commit(
        {
          ...worksheet,
          blocks: worksheet.blocks.map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
          status:
            worksheet.status === "draft" ? "in_progress" : worksheet.status,
        },
        {
          action: inferHistoryAction({
            kind:
              "content" in patch || "title" in patch ? "text" : "edit",
          }),
        },
      );
    },
    [worksheet, commit],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const source = worksheet.blocks.find((b) => b.id === id);
      if (!source) return;
      const copy = {
        ...structuredClone(source),
        id: createWorksheetBlock(source.type, worksheet.blocks.length).id,
        title: `${source.title} (copy)`,
        order: worksheet.blocks.length,
        aiHintDismissed: false,
      };
      const index = worksheet.blocks.findIndex((b) => b.id === id);
      const blocks = [...worksheet.blocks];
      blocks.splice(index + 1, 0, copy);
      commit(
        {
          ...worksheet,
          blocks: blocks.map((b, order) => ({ ...b, order })),
        },
        { action: "block_added" },
      );
    },
    [worksheet, commit],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      commit(
        {
          ...worksheet,
          blocks: worksheet.blocks
            .filter((b) => b.id !== id)
            .map((b, order) => ({ ...b, order })),
        },
        { action: "block_deleted" },
      );
    },
    [worksheet, commit],
  );

  const toggleCollapse = useCallback(
    (id: string) => {
      commit({
        ...worksheet,
        blocks: worksheet.blocks.map((b) =>
          b.id === id ? { ...b, collapsed: !b.collapsed } : b,
        ),
      });
    },
    [worksheet, commit],
  );

  const reorderBlocks = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const blocks = [...worksheet.blocks].sort((a, b) => a.order - b.order);
      const [moved] = blocks.splice(fromIndex, 1);
      if (!moved) return;
      blocks.splice(toIndex, 0, moved);
      commit(
        {
          ...worksheet,
          blocks: blocks.map((b, order) => ({ ...b, order })),
        },
        { action: "block_order" },
      );
    },
    [worksheet, commit],
  );

  const applyAiImprove = useCallback(
    (id: string) => {
      commit({
        ...worksheet,
        blocks: worksheet.blocks.map((b) =>
          b.id === id
            ? {
                ...b,
                content: aiImproveWorksheetBlock(b),
                aiHintDismissed: true,
              }
            : b,
        ),
        status: "in_progress",
      });
    },
    [worksheet, commit],
  );

  const dismissAiHint = useCallback(
    (id: string) => {
      commit({
        ...worksheet,
        blocks: worksheet.blocks.map((b) =>
          b.id === id ? { ...b, aiHintDismissed: true } : b,
        ),
      });
    },
    [worksheet, commit],
  );

  const completeGuided = useCallback(() => {
    const next = {
      ...worksheet,
      guidedCompleted: true,
      status: "in_progress" as const,
    };
    persistence.replaceDocument(worksheetStudioRepository.save(next));
  }, [worksheet, persistence]);

  const value = useMemo<WorksheetStudioContextValue>(
    () => ({
      project,
      worksheet,
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
      worksheet,
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
    <WorksheetStudioContext.Provider value={value}>
      {children}
    </WorksheetStudioContext.Provider>
  );
}

export function WorksheetStudioProvider({
  projectId,
  worksheetId,
  children,
}: {
  projectId: string;
  worksheetId: string;
  children: ReactNode;
}) {
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const initial = worksheetStudioRepository.getById(worksheetId);

  if (!project || !initial || initial.projectId !== projectId) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] p-8 text-slate-600">
        Loading Worksheet Studio…
      </div>
    );
  }

  return (
    <WorksheetStudioSession project={project} initial={initial}>
      {children}
    </WorksheetStudioSession>
  );
}

export function useWorksheetStudio() {
  const ctx = useContext(WorksheetStudioContext);
  if (!ctx) {
    throw new Error(
      "useWorksheetStudio must be used within WorksheetStudioProvider",
    );
  }
  return ctx;
}
