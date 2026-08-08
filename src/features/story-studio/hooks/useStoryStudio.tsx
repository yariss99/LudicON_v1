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
import { createStoryBlock } from "../services/seedFromResources";
import { storyStudioRepository } from "../services/storyStudioRepository";
import { aiImproveStoryBlock } from "../services/blockAiSuggestions";
import type {
  StoryBlock,
  StoryBlockType,
  StoryStudioDocument,
  StoryStudioProperties,
  StoryStudioStatus,
  StoryThemeId,
} from "../types";

export type { AutosaveState };

type StoryStudioContextValue = {
  project: Project;
  story: StoryStudioDocument;
  autosave: AutosaveState;
  lastSavedAt: string | null;
  canUndo: boolean;
  canRedo: boolean;
  versions: VersionEntry<StoryStudioDocument>[];
  draftOffer: DraftOffer<StoryStudioDocument> | null;
  setProperties: (patch: Partial<StoryStudioProperties>) => void;
  setStatus: (status: StoryStudioStatus) => void;
  setTheme: (theme: StoryThemeId) => void;
  addBlock: (type: StoryBlockType) => void;
  updateBlock: (id: string, patch: Partial<StoryBlock>) => void;
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

const StoryStudioContext = createContext<StoryStudioContextValue | null>(null);

function StoryStudioSession({
  project,
  initial,
  children,
}: {
  project: Project;
  initial: StoryStudioDocument;
  children: ReactNode;
}) {
  const persistence = useEditorPersistence<StoryStudioDocument>({
    resourceType: "story",
    resourceId: initial.id,
    initialDocument: initial,
    persist: (doc) => storyStudioRepository.save(doc),
    getUpdatedAt: (doc) => doc.updatedAt,
    bumpOnManualSave: (doc) => ({ ...doc, version: doc.version + 1 }),
  });

  const story = persistence.document;
  const commit = persistence.commit;

  const bumpStatus = (doc: StoryStudioDocument) =>
    doc.status === "draft" ? ("in_progress" as const) : doc.status;

  const setProperties = useCallback(
    (patch: Partial<StoryStudioProperties>) => {
      commit(
        {
          ...story,
          properties: { ...story.properties, ...patch },
          status: bumpStatus(story),
        },
        { action: inferHistoryAction({ kind: "metadata" }) },
      );
    },
    [story, commit],
  );

  const setStatus = useCallback(
    (status: StoryStudioStatus) => {
      commit({ ...story, status }, { action: "metadata" });
    },
    [story, commit],
  );

  const setTheme = useCallback(
    (theme: StoryThemeId) => {
      setProperties({ theme });
    },
    [setProperties],
  );

  const addBlock = useCallback(
    (type: StoryBlockType) => {
      const block = createStoryBlock(type, story.blocks.length);
      commit(
        {
          ...story,
          blocks: [...story.blocks, block],
          status: bumpStatus(story),
        },
        { action: "block_added" },
      );
    },
    [story, commit],
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<StoryBlock>) => {
      commit(
        {
          ...story,
          blocks: story.blocks.map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
          status: bumpStatus(story),
        },
        {
          action: inferHistoryAction({
            kind: "content" in patch || "title" in patch ? "text" : "edit",
          }),
        },
      );
    },
    [story, commit],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const source = story.blocks.find((b) => b.id === id);
      if (!source) return;
      const copy = {
        ...structuredClone(source),
        id: createStoryBlock(source.type, story.blocks.length).id,
        title: `${source.title} (copy)`,
        order: story.blocks.length,
        aiHintDismissed: false,
      };
      const index = story.blocks.findIndex((b) => b.id === id);
      const blocks = [...story.blocks];
      blocks.splice(index + 1, 0, copy);
      commit(
        {
          ...story,
          blocks: blocks.map((b, order) => ({ ...b, order })),
        },
        { action: "block_added" },
      );
    },
    [story, commit],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      commit(
        {
          ...story,
          blocks: story.blocks
            .filter((b) => b.id !== id)
            .map((b, order) => ({ ...b, order })),
        },
        { action: "block_deleted" },
      );
    },
    [story, commit],
  );

  const toggleCollapse = useCallback(
    (id: string) => {
      commit({
        ...story,
        blocks: story.blocks.map((b) =>
          b.id === id ? { ...b, collapsed: !b.collapsed } : b,
        ),
      });
    },
    [story, commit],
  );

  const reorderBlocks = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const blocks = [...story.blocks].sort((a, b) => a.order - b.order);
      const [moved] = blocks.splice(fromIndex, 1);
      if (!moved) return;
      blocks.splice(toIndex, 0, moved);
      commit(
        {
          ...story,
          blocks: blocks.map((b, order) => ({ ...b, order })),
        },
        { action: "block_order" },
      );
    },
    [story, commit],
  );

  const applyAiImprove = useCallback(
    (id: string) => {
      commit({
        ...story,
        blocks: story.blocks.map((b) =>
          b.id === id
            ? {
                ...b,
                content: aiImproveStoryBlock(b),
                aiHintDismissed: true,
              }
            : b,
        ),
        status: "in_progress",
      });
    },
    [story, commit],
  );

  const dismissAiHint = useCallback(
    (id: string) => {
      commit({
        ...story,
        blocks: story.blocks.map((b) =>
          b.id === id ? { ...b, aiHintDismissed: true } : b,
        ),
      });
    },
    [story, commit],
  );

  const completeGuided = useCallback(() => {
    const next = {
      ...story,
      guidedCompleted: true,
      status: "in_progress" as const,
    };
    persistence.replaceDocument(storyStudioRepository.save(next));
  }, [story, persistence]);

  const value = useMemo<StoryStudioContextValue>(
    () => ({
      project,
      story,
      autosave: persistence.status,
      lastSavedAt: persistence.lastSavedAt,
      canUndo: persistence.canUndo,
      canRedo: persistence.canRedo,
      versions: persistence.versions,
      draftOffer: persistence.draftOffer,
      setProperties,
      setStatus,
      setTheme,
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
      story,
      persistence,
      setProperties,
      setStatus,
      setTheme,
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
    <StoryStudioContext.Provider value={value}>
      {children}
    </StoryStudioContext.Provider>
  );
}

export function StoryStudioProvider({
  projectId,
  storyId,
  children,
}: {
  projectId: string;
  storyId: string;
  children: ReactNode;
}) {
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const initial = storyStudioRepository.getById(storyId);

  if (!project || !initial || initial.projectId !== projectId) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] p-8 text-slate-600">
        Loading Story Studio…
      </div>
    );
  }

  return (
    <StoryStudioSession project={project} initial={initial}>
      {children}
    </StoryStudioSession>
  );
}

export function useStoryStudio() {
  const ctx = useContext(StoryStudioContext);
  if (!ctx) {
    throw new Error("useStoryStudio must be used within StoryStudioProvider");
  }
  return ctx;
}
