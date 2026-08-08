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
import { gameTypeMeta } from "../constants";
import { createGameBlock } from "../services/seedFromResources";
import { gameStudioRepository } from "../services/gameStudioRepository";
import { aiImproveGameBlock } from "../services/blockAiSuggestions";
import type {
  GameBlock,
  GameBlockType,
  GameMechanicId,
  GameStudioDocument,
  GameStudioProperties,
  GameStudioStatus,
  GameTypeId,
} from "../types";

export type { AutosaveState };

type GameStudioContextValue = {
  project: Project;
  game: GameStudioDocument;
  autosave: AutosaveState;
  lastSavedAt: string | null;
  canUndo: boolean;
  canRedo: boolean;
  versions: VersionEntry<GameStudioDocument>[];
  draftOffer: DraftOffer<GameStudioDocument> | null;
  setProperties: (patch: Partial<GameStudioProperties>) => void;
  setStatus: (status: GameStudioStatus) => void;
  setGameType: (gameType: GameTypeId) => void;
  toggleMechanic: (id: GameMechanicId) => void;
  applySuggestedMechanics: () => void;
  addBlock: (type: GameBlockType) => void;
  updateBlock: (id: string, patch: Partial<GameBlock>) => void;
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

const GameStudioContext = createContext<GameStudioContextValue | null>(null);

function GameStudioSession({
  project,
  initial,
  children,
}: {
  project: Project;
  initial: GameStudioDocument;
  children: ReactNode;
}) {
  const persistence = useEditorPersistence<GameStudioDocument>({
    resourceType: "game",
    resourceId: initial.id,
    initialDocument: initial,
    persist: (doc) => gameStudioRepository.save(doc),
    getUpdatedAt: (doc) => doc.updatedAt,
    bumpOnManualSave: (doc) => ({ ...doc, version: doc.version + 1 }),
  });

  const game = persistence.document;
  const commit = persistence.commit;

  const bumpStatus = (doc: GameStudioDocument) =>
    doc.status === "draft" ? ("in_progress" as const) : doc.status;

  const setProperties = useCallback(
    (patch: Partial<GameStudioProperties>) => {
      commit(
        {
          ...game,
          properties: { ...game.properties, ...patch },
          status: bumpStatus(game),
        },
        { action: inferHistoryAction({ kind: "metadata" }) },
      );
    },
    [game, commit],
  );

  const setStatus = useCallback(
    (status: GameStudioStatus) => {
      commit({ ...game, status }, { action: "metadata" });
    },
    [game, commit],
  );

  const setGameType = useCallback(
    (gameType: GameTypeId) => {
      commit(
        {
          ...game,
          properties: { ...game.properties, gameType },
          status: bumpStatus(game),
        },
        { action: "metadata" },
      );
    },
    [game, commit],
  );

  const toggleMechanic = useCallback(
    (id: GameMechanicId) => {
      const has = game.mechanics.includes(id);
      commit(
        {
          ...game,
          mechanics: has
            ? game.mechanics.filter((m) => m !== id)
            : [...game.mechanics, id],
          status: bumpStatus(game),
        },
        { action: "edit" },
      );
    },
    [game, commit],
  );

  const applySuggestedMechanics = useCallback(() => {
    const suggested = gameTypeMeta(game.properties.gameType)?.suggestedMechanics;
    if (!suggested) return;
    commit(
      {
        ...game,
        mechanics: Array.from(new Set([...game.mechanics, ...suggested])),
        status: bumpStatus(game),
      },
      { action: "edit" },
    );
  }, [game, commit]);

  const addBlock = useCallback(
    (type: GameBlockType) => {
      const block = createGameBlock(type, game.blocks.length);
      commit(
        {
          ...game,
          blocks: [...game.blocks, block],
          status: bumpStatus(game),
        },
        { action: "block_added" },
      );
    },
    [game, commit],
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<GameBlock>) => {
      commit(
        {
          ...game,
          blocks: game.blocks.map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
          status: bumpStatus(game),
        },
        {
          action: inferHistoryAction({
            kind: "content" in patch || "title" in patch ? "text" : "edit",
          }),
        },
      );
    },
    [game, commit],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const source = game.blocks.find((b) => b.id === id);
      if (!source) return;
      const copy = {
        ...structuredClone(source),
        id: createGameBlock(source.type, game.blocks.length).id,
        title: `${source.title} (copy)`,
        order: game.blocks.length,
        aiHintDismissed: false,
      };
      const index = game.blocks.findIndex((b) => b.id === id);
      const blocks = [...game.blocks];
      blocks.splice(index + 1, 0, copy);
      commit(
        {
          ...game,
          blocks: blocks.map((b, order) => ({ ...b, order })),
        },
        { action: "block_added" },
      );
    },
    [game, commit],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      commit(
        {
          ...game,
          blocks: game.blocks
            .filter((b) => b.id !== id)
            .map((b, order) => ({ ...b, order })),
        },
        { action: "block_deleted" },
      );
    },
    [game, commit],
  );

  const toggleCollapse = useCallback(
    (id: string) => {
      commit({
        ...game,
        blocks: game.blocks.map((b) =>
          b.id === id ? { ...b, collapsed: !b.collapsed } : b,
        ),
      });
    },
    [game, commit],
  );

  const reorderBlocks = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const blocks = [...game.blocks].sort((a, b) => a.order - b.order);
      const [moved] = blocks.splice(fromIndex, 1);
      if (!moved) return;
      blocks.splice(toIndex, 0, moved);
      commit(
        {
          ...game,
          blocks: blocks.map((b, order) => ({ ...b, order })),
        },
        { action: "block_order" },
      );
    },
    [game, commit],
  );

  const applyAiImprove = useCallback(
    (id: string) => {
      commit({
        ...game,
        blocks: game.blocks.map((b) =>
          b.id === id
            ? {
                ...b,
                content: aiImproveGameBlock(b),
                aiHintDismissed: true,
              }
            : b,
        ),
        status: "in_progress",
      });
    },
    [game, commit],
  );

  const dismissAiHint = useCallback(
    (id: string) => {
      commit({
        ...game,
        blocks: game.blocks.map((b) =>
          b.id === id ? { ...b, aiHintDismissed: true } : b,
        ),
      });
    },
    [game, commit],
  );

  const completeGuided = useCallback(() => {
    const next = {
      ...game,
      guidedCompleted: true,
      status: "in_progress" as const,
    };
    persistence.replaceDocument(gameStudioRepository.save(next));
  }, [game, persistence]);

  const value = useMemo<GameStudioContextValue>(
    () => ({
      project,
      game,
      autosave: persistence.status,
      lastSavedAt: persistence.lastSavedAt,
      canUndo: persistence.canUndo,
      canRedo: persistence.canRedo,
      versions: persistence.versions,
      draftOffer: persistence.draftOffer,
      setProperties,
      setStatus,
      setGameType,
      toggleMechanic,
      applySuggestedMechanics,
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
      game,
      persistence,
      setProperties,
      setStatus,
      setGameType,
      toggleMechanic,
      applySuggestedMechanics,
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
    <GameStudioContext.Provider value={value}>
      {children}
    </GameStudioContext.Provider>
  );
}

export function GameStudioProvider({
  projectId,
  gameId,
  children,
}: {
  projectId: string;
  gameId: string;
  children: ReactNode;
}) {
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const initial = gameStudioRepository.getById(gameId);

  if (!project || !initial || initial.projectId !== projectId) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] p-8 text-slate-600">
        Loading Game Studio…
      </div>
    );
  }

  return (
    <GameStudioSession project={project} initial={initial}>
      {children}
    </GameStudioSession>
  );
}

export function useGameStudio() {
  const ctx = useContext(GameStudioContext);
  if (!ctx) {
    throw new Error("useGameStudio must be used within GameStudioProvider");
  }
  return ctx;
}
