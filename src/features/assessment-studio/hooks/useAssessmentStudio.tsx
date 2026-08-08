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
import { projectWorkspaceRepository } from "../../project-workspace/services/projectWorkspaceRepository";
import {
  createAssessmentBlock,
  assessmentStudioRepository,
} from "../services/assessmentStudioRepository";
import { aiImproveAssessmentBlock } from "../services/blockAiSuggestions";
import type {
  AssessmentBlock,
  AssessmentBlockType,
  AssessmentPurpose,
  AssessmentStudioDocument,
  AssessmentStudioProperties,
  AssessmentStudioStatus,
} from "../types";

export type { AutosaveState };

type AssessmentStudioContextValue = {
  project: Project;
  assessment: AssessmentStudioDocument;
  projectCompetencies: string[];
  autosave: AutosaveState;
  lastSavedAt: string | null;
  canUndo: boolean;
  canRedo: boolean;
  versions: VersionEntry<AssessmentStudioDocument>[];
  draftOffer: DraftOffer<AssessmentStudioDocument> | null;
  setProperties: (patch: Partial<AssessmentStudioProperties>) => void;
  setPurpose: (purpose: AssessmentPurpose) => void;
  setStatus: (status: AssessmentStudioStatus) => void;
  toggleDocumentCompetency: (competency: string) => void;
  addBlock: (type: AssessmentBlockType) => void;
  updateBlock: (id: string, patch: Partial<AssessmentBlock>) => void;
  toggleBlockCompetency: (blockId: string, competency: string) => void;
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

const AssessmentStudioContext =
  createContext<AssessmentStudioContextValue | null>(null);

function AssessmentStudioSession({
  project,
  projectCompetencies,
  initial,
  children,
}: {
  project: Project;
  projectCompetencies: string[];
  initial: AssessmentStudioDocument;
  children: ReactNode;
}) {
  const persistence = useEditorPersistence<AssessmentStudioDocument>({
    resourceType: "assessment",
    resourceId: initial.id,
    initialDocument: initial,
    persist: (doc) => assessmentStudioRepository.save(doc),
    getUpdatedAt: (doc) => doc.updatedAt,
    bumpOnManualSave: (doc) => ({ ...doc, version: doc.version + 1 }),
  });

  const assessment = persistence.document;
  const commit = persistence.commit;

  const bumpStatus = (doc: AssessmentStudioDocument) =>
    doc.status === "draft" ? ("in_progress" as const) : doc.status;

  const setProperties = useCallback(
    (patch: Partial<AssessmentStudioProperties>) => {
      commit(
        {
          ...assessment,
          properties: { ...assessment.properties, ...patch },
          status: bumpStatus(assessment),
        },
        { action: inferHistoryAction({ kind: "metadata" }) },
      );
    },
    [assessment, commit],
  );

  const setPurpose = useCallback(
    (purpose: AssessmentPurpose) => {
      setProperties({ purpose });
    },
    [setProperties],
  );

  const setStatus = useCallback(
    (status: AssessmentStudioStatus) => {
      commit({ ...assessment, status }, { action: "metadata" });
    },
    [assessment, commit],
  );

  const toggleDocumentCompetency = useCallback(
    (competency: string) => {
      const current = assessment.properties.competencies;
      const next = current.includes(competency)
        ? current.filter((c) => c !== competency)
        : [...current, competency];
      setProperties({ competencies: next });
    },
    [assessment, setProperties],
  );

  const addBlock = useCallback(
    (type: AssessmentBlockType) => {
      const seed = assessment.properties.competencies.slice(0, 1);
      const block = createAssessmentBlock(
        type,
        assessment.blocks.length,
        seed,
      );
      commit(
        {
          ...assessment,
          blocks: [...assessment.blocks, block],
          status: bumpStatus(assessment),
        },
        { action: "block_added" },
      );
    },
    [assessment, commit],
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<AssessmentBlock>) => {
      commit(
        {
          ...assessment,
          blocks: assessment.blocks.map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
          status: bumpStatus(assessment),
        },
        {
          action: inferHistoryAction({
            kind: "content" in patch || "title" in patch ? "text" : "edit",
          }),
        },
      );
    },
    [assessment, commit],
  );

  const toggleBlockCompetency = useCallback(
    (blockId: string, competency: string) => {
      commit(
        {
          ...assessment,
          blocks: assessment.blocks.map((b) => {
            if (b.id !== blockId) return b;
            const has = b.competencyIds.includes(competency);
            return {
              ...b,
              competencyIds: has
                ? b.competencyIds.filter((c) => c !== competency)
                : [...b.competencyIds, competency],
            };
          }),
          status: bumpStatus(assessment),
        },
        { action: "edit" },
      );
    },
    [assessment, commit],
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const source = assessment.blocks.find((b) => b.id === id);
      if (!source) return;
      const copy = {
        ...structuredClone(source),
        id: createAssessmentBlock(source.type, assessment.blocks.length).id,
        title: `${source.title} (copy)`,
        order: assessment.blocks.length,
        aiHintDismissed: false,
      };
      const index = assessment.blocks.findIndex((b) => b.id === id);
      const blocks = [...assessment.blocks];
      blocks.splice(index + 1, 0, copy);
      commit(
        {
          ...assessment,
          blocks: blocks.map((b, order) => ({ ...b, order })),
        },
        { action: "block_added" },
      );
    },
    [assessment, commit],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      commit(
        {
          ...assessment,
          blocks: assessment.blocks
            .filter((b) => b.id !== id)
            .map((b, order) => ({ ...b, order })),
        },
        { action: "block_deleted" },
      );
    },
    [assessment, commit],
  );

  const toggleCollapse = useCallback(
    (id: string) => {
      commit({
        ...assessment,
        blocks: assessment.blocks.map((b) =>
          b.id === id ? { ...b, collapsed: !b.collapsed } : b,
        ),
      });
    },
    [assessment, commit],
  );

  const reorderBlocks = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const blocks = [...assessment.blocks].sort((a, b) => a.order - b.order);
      const [moved] = blocks.splice(fromIndex, 1);
      if (!moved) return;
      blocks.splice(toIndex, 0, moved);
      commit(
        {
          ...assessment,
          blocks: blocks.map((b, order) => ({ ...b, order })),
        },
        { action: "block_order" },
      );
    },
    [assessment, commit],
  );

  const applyAiImprove = useCallback(
    (id: string) => {
      commit({
        ...assessment,
        blocks: assessment.blocks.map((b) =>
          b.id === id
            ? {
                ...b,
                content: aiImproveAssessmentBlock(b),
                aiHintDismissed: true,
              }
            : b,
        ),
        status: "in_progress",
      });
    },
    [assessment, commit],
  );

  const dismissAiHint = useCallback(
    (id: string) => {
      commit({
        ...assessment,
        blocks: assessment.blocks.map((b) =>
          b.id === id ? { ...b, aiHintDismissed: true } : b,
        ),
      });
    },
    [assessment, commit],
  );

  const completeGuided = useCallback(() => {
    const next = {
      ...assessment,
      guidedCompleted: true,
      status: "in_progress" as const,
    };
    persistence.replaceDocument(assessmentStudioRepository.save(next));
  }, [assessment, persistence]);

  const value = useMemo<AssessmentStudioContextValue>(
    () => ({
      project,
      assessment,
      projectCompetencies,
      autosave: persistence.status,
      lastSavedAt: persistence.lastSavedAt,
      canUndo: persistence.canUndo,
      canRedo: persistence.canRedo,
      versions: persistence.versions,
      draftOffer: persistence.draftOffer,
      setProperties,
      setPurpose,
      setStatus,
      toggleDocumentCompetency,
      addBlock,
      updateBlock,
      toggleBlockCompetency,
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
      assessment,
      projectCompetencies,
      persistence,
      setProperties,
      setPurpose,
      setStatus,
      toggleDocumentCompetency,
      addBlock,
      updateBlock,
      toggleBlockCompetency,
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
    <AssessmentStudioContext.Provider value={value}>
      {children}
    </AssessmentStudioContext.Provider>
  );
}

export function AssessmentStudioProvider({
  projectId,
  assessmentId,
  children,
}: {
  projectId: string;
  assessmentId: string;
  children: ReactNode;
}) {
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const initial = assessmentStudioRepository.getById(assessmentId);
  const projectCompetencies = useMemo(() => {
    const meta = projectWorkspaceRepository.getMetadata(projectId);
    return [...meta.competencies].map((c) => c.trim()).filter(Boolean);
  }, [projectId]);

  if (!project || !initial || initial.projectId !== projectId) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] p-8 text-slate-600">
        Loading Assessment Studio…
      </div>
    );
  }

  return (
    <AssessmentStudioSession
      project={project}
      projectCompetencies={projectCompetencies}
      initial={initial}
    >
      {children}
    </AssessmentStudioSession>
  );
}

export function useAssessmentStudio() {
  const ctx = useContext(AssessmentStudioContext);
  if (!ctx) {
    throw new Error(
      "useAssessmentStudio must be used within AssessmentStudioProvider",
    );
  }
  return ctx;
}
