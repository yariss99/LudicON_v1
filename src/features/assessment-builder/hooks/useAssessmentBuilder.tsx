import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useProjects } from "../../../context/ProjectContext";
import type { Project } from "../../../types/project";
import { createId } from "../../../utils/id";
import { AUTOSAVE_DELAY_MS } from "../constants";
import {
  assessmentBuilderRepository,
  createBlankQuestion,
  createBlankRubric,
} from "../services/assessmentBuilderRepository";
import {
  applyAssessmentAiAction,
  syncAssessmentToWorkspace,
  type AssessmentCorePromptPackage,
} from "../services/assessmentCoreBridge";
import {
  downloadExport,
  exportAssessment,
  type AssessmentExportResult,
} from "../services/assessmentExport";
import { validateAssessment } from "../services/assessmentValidation";
import type {
  AssessmentAiActionId,
  AssessmentBuilderPanel,
  AssessmentDocument,
  AssessmentExportFormat,
  AssessmentQuestion,
  AssessmentSectionId,
  AssessmentVersion,
  QuestionType,
} from "../types";

type AssessmentBuilderContextValue = {
  readonly project: Project;
  readonly assessment: AssessmentDocument;
  readonly versions: readonly AssessmentVersion[];
  readonly sectionId: AssessmentSectionId;
  readonly setSectionId: (id: AssessmentSectionId) => void;
  readonly panel: AssessmentBuilderPanel;
  readonly setPanel: (panel: AssessmentBuilderPanel) => void;
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly lastSavedAt: string | null;
  readonly lastPrompt: AssessmentCorePromptPackage | null;
  readonly lastAiNote: string | null;
  readonly patchAssessment: (
    updater: (prev: AssessmentDocument) => AssessmentDocument,
    options?: { immediate?: boolean; note?: string },
  ) => void;
  readonly saveNow: (note?: string) => void;
  readonly runValidation: () => void;
  readonly publish: () => { ok: boolean; error?: string };
  readonly archive: () => void;
  readonly duplicate: () => AssessmentDocument;
  readonly runAi: (action: AssessmentAiActionId) => void;
  readonly addGroup: () => void;
  readonly addQuestion: (groupId: string, type: QuestionType) => void;
  readonly updateQuestion: (
    groupId: string,
    questionId: string,
    patch: Partial<AssessmentQuestion>,
  ) => void;
  readonly removeQuestion: (groupId: string, questionId: string) => void;
  readonly addFromBank: (groupId: string, questionId: string) => void;
  readonly addRubric: () => void;
  readonly restoreVersion: (versionId: string) => void;
  readonly exportFormat: (format: AssessmentExportFormat) => AssessmentExportResult;
};

const AssessmentBuilderContext =
  createContext<AssessmentBuilderContextValue | null>(null);

function persistAssessment(
  doc: AssessmentDocument,
  note: string,
): AssessmentDocument {
  const artifactId = syncAssessmentToWorkspace(doc);
  const withArtifact =
    doc.workspaceArtifactId === artifactId
      ? doc
      : { ...doc, workspaceArtifactId: artifactId };
  return assessmentBuilderRepository.save(withArtifact, {
    note,
    actor: "teacher",
  });
}

export function AssessmentBuilderProvider({
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
  const [assessment, setAssessment] = useState<AssessmentDocument | null>(null);
  const [versions, setVersions] = useState<AssessmentVersion[]>([]);
  const [sectionId, setSectionId] = useState<AssessmentSectionId>("general");
  const [panel, setPanel] = useState<AssessmentBuilderPanel>("editor");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] =
    useState<AssessmentCorePromptPackage | null>(null);
  const [lastAiNote, setLastAiNote] = useState<string | null>(null);
  const ref = useRef<AssessmentDocument | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    ref.current = assessment;
  }, [assessment]);

  const refreshVersions = useCallback((id: string) => {
    setVersions(assessmentBuilderRepository.listVersions(id));
  }, []);

  useEffect(() => {
    if (!project) return;
    const existing = assessmentBuilderRepository.getById(assessmentId);
    if (
      !existing ||
      existing.projectId !== project.id ||
      !existing.lessonId
    ) {
      setAssessment(null);
      return;
    }
    setAssessment(existing);
    refreshVersions(existing.id);
  }, [project, assessmentId, refreshVersions]);

  const commit = useCallback(
    (doc: AssessmentDocument, note: string) => {
      setSaving(true);
      try {
        const saved = persistAssessment(doc, note);
        ref.current = saved;
        setAssessment(saved);
        setDirty(false);
        setLastSavedAt(saved.updatedAt);
        refreshVersions(saved.id);
        return saved;
      } finally {
        setSaving(false);
      }
    },
    [refreshVersions],
  );

  const schedule = useCallback(
    (doc: AssessmentDocument) => {
      ref.current = doc;
      setAssessment(doc);
      setDirty(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        const pending = ref.current;
        if (pending) commit(pending, "autosave");
      }, AUTOSAVE_DELAY_MS);
    },
    [commit],
  );

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const patchAssessment = useCallback(
    (
      updater: (prev: AssessmentDocument) => AssessmentDocument,
      options?: { immediate?: boolean; note?: string },
    ) => {
      const prev = ref.current;
      if (!prev) return;
      const next = updater(prev);
      if (options?.immediate) {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        commit(next, options.note ?? "save");
        return;
      }
      schedule(next);
    },
    [commit, schedule],
  );

  if (!project || !assessment) return null;

  const value: AssessmentBuilderContextValue = {
    project,
    assessment,
    versions,
    sectionId,
    setSectionId,
    panel,
    setPanel,
    dirty,
    saving,
    lastSavedAt,
    lastPrompt,
    lastAiNote,
    patchAssessment,
    saveNow: (note) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      commit(ref.current ?? assessment, note ?? "manual-save");
    },
    runValidation: () => {
      const current = ref.current ?? assessment;
      const report = validateAssessment(current);
      commit(
        {
          ...current,
          validation: report,
          status: report.passed
            ? current.status === "published"
              ? "published"
              : "validated"
            : "draft",
        },
        "validation",
      );
      setPanel("validation");
    },
    publish: () => {
      try {
        const current = ref.current ?? assessment;
        const report = validateAssessment(current);
        const validated = commit(
          {
            ...current,
            validation: report,
            status: report.passed ? current.status : "draft",
          },
          "pre-publish-validation",
        );
        if (!report.passed) {
          setPanel("validation");
          return {
            ok: false,
            error: "Validarea a eșuat. Remediază erorile înainte de publicare.",
          };
        }
        const published = assessmentBuilderRepository.publish(validated.id);
        syncAssessmentToWorkspace(published);
        ref.current = published;
        setAssessment(published);
        refreshVersions(published.id);
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "Publicare eșuată",
        };
      }
    },
    archive: () => {
      const archived = assessmentBuilderRepository.archive(assessment.id);
      syncAssessmentToWorkspace(archived);
      ref.current = archived;
      setAssessment(archived);
      refreshVersions(archived.id);
    },
    duplicate: () => {
      const copy = assessmentBuilderRepository.duplicate(assessment.id);
      return persistAssessment(copy, "duplicate-link");
    },
    runAi: (action) => {
      const current = ref.current ?? assessment;
      const { assessment: generated, prompt, note } = applyAssessmentAiAction({
        project,
        assessment: current,
        action,
        sectionId,
      });
      setLastPrompt(prompt);
      setLastAiNote(note ?? null);
      commit(generated, `ai:${action}`);
      setPanel("ai");
    },
    addGroup: () => {
      patchAssessment(
        (prev) => ({
          ...prev,
          groups: [
            ...prev.groups,
            {
              id: createId("agroup"),
              title: `Grup ${prev.groups.length + 1}`,
              instructions: "",
              questions: [],
              order: prev.groups.length,
            },
          ],
        }),
        { immediate: true, note: "add-group" },
      );
    },
    addQuestion: (groupId, type) => {
      patchAssessment(
        (prev) => ({
          ...prev,
          groups: prev.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  questions: [
                    ...g.questions,
                    createBlankQuestion(type, g.questions.length),
                  ],
                }
              : g,
          ),
        }),
        { immediate: true, note: "add-question" },
      );
    },
    updateQuestion: (groupId, questionId, patch) => {
      patchAssessment((prev) => ({
        ...prev,
        groups: prev.groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                questions: g.questions.map((q) =>
                  q.id === questionId ? { ...q, ...patch } : q,
                ),
              }
            : g,
        ),
      }));
    },
    removeQuestion: (groupId, questionId) => {
      patchAssessment(
        (prev) => ({
          ...prev,
          groups: prev.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  questions: g.questions
                    .filter((q) => q.id !== questionId)
                    .map((q, order) => ({ ...q, order })),
                }
              : g,
          ),
        }),
        { immediate: true, note: "remove-question" },
      );
    },
    addFromBank: (groupId, questionId) => {
      patchAssessment(
        (prev) => {
          const bankItem = prev.bank.find((q) => q.id === questionId);
          if (!bankItem) return prev;
          return {
            ...prev,
            groups: prev.groups.map((g) =>
              g.id === groupId
                ? {
                    ...g,
                    questions: [
                      ...g.questions,
                      {
                        ...bankItem,
                        id: createId("aq"),
                        order: g.questions.length,
                      },
                    ],
                  }
                : g,
            ),
          };
        },
        { immediate: true, note: "bank-to-group" },
      );
    },
    addRubric: () => {
      patchAssessment(
        (prev) => ({
          ...prev,
          rubrics: [...prev.rubrics, createBlankRubric()],
        }),
        { immediate: true, note: "add-rubric" },
      );
    },
    restoreVersion: (versionId) => {
      const restored = assessmentBuilderRepository.restoreVersion(versionId);
      syncAssessmentToWorkspace(restored);
      ref.current = restored;
      setAssessment(restored);
      refreshVersions(restored.id);
      setPanel("versions");
    },
    exportFormat: (format) => {
      const current = ref.current ?? assessment;
      const result = exportAssessment(current, format);
      downloadExport(result);
      setPanel("export");
      return result;
    },
  };

  return (
    <AssessmentBuilderContext.Provider value={value}>
      {children}
    </AssessmentBuilderContext.Provider>
  );
}

export function useAssessmentBuilder(): AssessmentBuilderContextValue {
  const ctx = useContext(AssessmentBuilderContext);
  if (!ctx) {
    throw new Error(
      "useAssessmentBuilder must be used within AssessmentBuilderProvider",
    );
  }
  return ctx;
}

export function createAssessmentInProject(input: {
  project: Project;
  lessonId: string;
  title?: string;
  kind?: AssessmentDocument["kind"];
}): AssessmentDocument {
  const created = assessmentBuilderRepository.create({
    projectId: input.project.id,
    lessonId: input.lessonId,
    title: input.title,
    subject: input.project.subject,
    grade: input.project.grade,
    kind: input.kind,
  });
  return persistAssessment(created, "link-artifact");
}
