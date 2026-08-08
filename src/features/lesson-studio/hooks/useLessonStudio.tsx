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
  createBlock,
  lessonStudioRepository,
} from "../services/lessonStudioRepository";
import { aiImproveBlock } from "../services/blockAiSuggestions";
import type {
  LessonBlockType,
  LessonStudioBlock,
  LessonStudioDocument,
  LessonStudioProperties,
  LessonStudioStatus,
} from "../types";

export type { AutosaveState };

type LessonStudioContextValue = {
  project: Project;
  lesson: LessonStudioDocument;
  autosave: AutosaveState;
  lastSavedAt: string | null;
  canUndo: boolean;
  canRedo: boolean;
  versions: VersionEntry<LessonStudioDocument>[];
  draftOffer: DraftOffer<LessonStudioDocument> | null;
  setProperties: (patch: Partial<LessonStudioProperties>) => void;
  setStatus: (status: LessonStudioStatus) => void;
  setCompetenciesText: (raw: string) => void;
  setObjectivesText: (raw: string) => void;
  setKeywordsText: (raw: string) => void;
  addBlock: (type: LessonBlockType) => void;
  updateBlock: (id: string, patch: Partial<LessonStudioBlock>) => void;
  duplicateBlock: (id: string) => void;
  deleteBlock: (id: string) => void;
  toggleCollapse: (id: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  applyAiImprove: (id: string) => void;
  dismissAiHint: (id: string) => void;
  completeGuided: () => void;
  saveNow: (note?: string) => void;
  undo: () => void;
  redo: () => void;
  restoreVersion: (versionId: string) => void;
  wordCount: number;
};

const LessonStudioContext = createContext<LessonStudioContextValue | null>(
  null,
);

function countWords(lesson: LessonStudioDocument): number {
  const parts = [
    lesson.properties.title,
    lesson.properties.teachingUnit,
    ...lesson.properties.competencies,
    ...lesson.properties.learningObjectives,
    ...lesson.properties.keywords,
    ...lesson.blocks.map((b) => `${b.title} ${b.content}`),
  ];
  return parts
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function linesToList(raw: string): string[] {
  return raw
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function LessonStudioSession({
  project,
  initial,
  children,
}: {
  project: Project;
  initial: LessonStudioDocument;
  children: ReactNode;
}) {
  const persistence = useEditorPersistence<LessonStudioDocument>({
    resourceType: "lesson",
    resourceId: initial.id,
    initialDocument: initial,
    persist: (doc) => lessonStudioRepository.save(doc),
    getUpdatedAt: (doc) => doc.updatedAt,
    bumpOnManualSave: (doc) => ({ ...doc, version: doc.version + 1 }),
  });

  const lesson = persistence.document;
  const commit = persistence.commit;

  const setProperties = useCallback(
    (patch: Partial<LessonStudioProperties>) => {
      commit(
        {
          ...lesson,
          properties: { ...lesson.properties, ...patch },
          status: lesson.status === "draft" ? "in_progress" : lesson.status,
        },
        { action: inferHistoryAction({ kind: "metadata" }) },
      );
    },
    [lesson, commit],
  );

  const setStatus = useCallback(
    (status: LessonStudioStatus) => {
      commit({ ...lesson, status }, { action: "metadata" });
    },
    [lesson, commit],
  );

  const setCompetenciesText = useCallback(
    (raw: string) => setProperties({ competencies: linesToList(raw) }),
    [setProperties],
  );
  const setObjectivesText = useCallback(
    (raw: string) => setProperties({ learningObjectives: linesToList(raw) }),
    [setProperties],
  );
  const setKeywordsText = useCallback(
    (raw: string) => setProperties({ keywords: linesToList(raw) }),
    [setProperties],
  );

  const addBlock = useCallback(
    (type: LessonBlockType) => {
      const block = createBlock(type, lesson.blocks.length);
      commit(
        {
          ...lesson,
          blocks: [...lesson.blocks, block],
          status: lesson.status === "draft" ? "in_progress" : lesson.status,
        },
        { action: "block_added" },
      );
    },
    [lesson, commit],
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<LessonStudioBlock>) => {
      commit(
        {
          ...lesson,
          blocks: lesson.blocks.map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
          status: lesson.status === "draft" ? "in_progress" : lesson.status,
        },
        {
          action: inferHistoryAction({
            kind: "content" in patch || "title" in patch ? "text" : "edit",
          }),
        },
      );
    },
    [lesson, commit],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const source = lesson.blocks.find((b) => b.id === id);
      if (!source) return;
      const copy = {
        ...structuredClone(source),
        id: createBlock(source.type, lesson.blocks.length).id,
        title: `${source.title} (copy)`,
        order: lesson.blocks.length,
        aiHintDismissed: false,
      };
      const index = lesson.blocks.findIndex((b) => b.id === id);
      const blocks = [...lesson.blocks];
      blocks.splice(index + 1, 0, copy);
      commit(
        {
          ...lesson,
          blocks: blocks.map((b, order) => ({ ...b, order })),
        },
        { action: "block_added" },
      );
    },
    [lesson, commit],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      commit(
        {
          ...lesson,
          blocks: lesson.blocks
            .filter((b) => b.id !== id)
            .map((b, order) => ({ ...b, order })),
        },
        { action: "block_deleted" },
      );
    },
    [lesson, commit],
  );

  const toggleCollapse = useCallback(
    (id: string) => {
      commit({
        ...lesson,
        blocks: lesson.blocks.map((b) =>
          b.id === id ? { ...b, collapsed: !b.collapsed } : b,
        ),
      });
    },
    [lesson, commit],
  );

  const reorderBlocks = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const blocks = [...lesson.blocks].sort((a, b) => a.order - b.order);
      const [moved] = blocks.splice(fromIndex, 1);
      if (!moved) return;
      blocks.splice(toIndex, 0, moved);
      commit(
        {
          ...lesson,
          blocks: blocks.map((b, order) => ({ ...b, order })),
        },
        { action: "block_order" },
      );
    },
    [lesson, commit],
  );

  const applyAiImprove = useCallback(
    (id: string) => {
      commit({
        ...lesson,
        blocks: lesson.blocks.map((b) =>
          b.id === id
            ? {
                ...b,
                content: aiImproveBlock(b),
                aiHintDismissed: true,
              }
            : b,
        ),
        status: "in_progress",
      });
    },
    [lesson, commit],
  );

  const dismissAiHint = useCallback(
    (id: string) => {
      commit({
        ...lesson,
        blocks: lesson.blocks.map((b) =>
          b.id === id ? { ...b, aiHintDismissed: true } : b,
        ),
      });
    },
    [lesson, commit],
  );

  const completeGuided = useCallback(() => {
    const next = {
      ...lesson,
      guidedCompleted: true,
      status: "in_progress" as const,
    };
    persistence.replaceDocument(lessonStudioRepository.save(next));
  }, [lesson, persistence]);

  const value = useMemo<LessonStudioContextValue>(
    () => ({
      project,
      lesson,
      autosave: persistence.status,
      lastSavedAt: persistence.lastSavedAt,
      canUndo: persistence.canUndo,
      canRedo: persistence.canRedo,
      versions: persistence.versions,
      draftOffer: persistence.draftOffer,
      setProperties,
      setStatus,
      setCompetenciesText,
      setObjectivesText,
      setKeywordsText,
      addBlock,
      updateBlock,
      duplicateBlock,
      deleteBlock,
      toggleCollapse,
      reorderBlocks,
      applyAiImprove,
      dismissAiHint,
      completeGuided,
      saveNow: (note?: string) => persistence.saveNow(note),
      undo: persistence.undo,
      redo: persistence.redo,
      restoreVersion: persistence.restoreVersion,
      wordCount: countWords(lesson),
    }),
    [
      project,
      lesson,
      persistence,
      setProperties,
      setStatus,
      setCompetenciesText,
      setObjectivesText,
      setKeywordsText,
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
    <LessonStudioContext.Provider value={value}>
      {children}
    </LessonStudioContext.Provider>
  );
}

export function LessonStudioProvider({
  projectId,
  lessonId,
  children,
}: {
  projectId: string;
  lessonId: string;
  children: ReactNode;
}) {
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const initial = lessonStudioRepository.getById(lessonId);

  if (!project || !initial || initial.projectId !== projectId) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] p-8 text-slate-600">
        Loading Lesson Studio…
      </div>
    );
  }

  return (
    <LessonStudioSession project={project} initial={initial}>
      {children}
    </LessonStudioSession>
  );
}

export function useLessonStudio() {
  const ctx = useContext(LessonStudioContext);
  if (!ctx) {
    throw new Error("useLessonStudio must be used within LessonStudioProvider");
  }
  return ctx;
}
