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
import { AUTOSAVE_DELAY_MS, REUSABLE_BLOCK_TEMPLATES } from "../constants";
import { lessonBuilderRepository } from "../services/lessonBuilderRepository";
import {
  applyAiAction,
  syncLessonToWorkspace,
  type LessonCorePromptPackage,
} from "../services/lessonCoreBridge";
import { validateLesson } from "../services/lessonValidation";
import type {
  LessonAiActionId,
  LessonBlock,
  LessonBlockKind,
  LessonBuilderPanel,
  LessonDocument,
  LessonPhaseId,
  LessonSectionId,
  LessonVersion,
} from "../types";

type LessonBuilderContextValue = {
  readonly project: Project;
  readonly lesson: LessonDocument;
  readonly versions: readonly LessonVersion[];
  readonly sectionId: LessonSectionId;
  readonly setSectionId: (id: LessonSectionId) => void;
  readonly panel: LessonBuilderPanel;
  readonly setPanel: (panel: LessonBuilderPanel) => void;
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly lastSavedAt: string | null;
  readonly lastPrompt: LessonCorePromptPackage | null;
  readonly patchLesson: (
    updater: (prev: LessonDocument) => LessonDocument,
    options?: { immediate?: boolean; note?: string },
  ) => void;
  readonly saveNow: (note?: string) => void;
  readonly runValidation: () => void;
  readonly publish: () => { ok: boolean; error?: string };
  readonly archive: () => void;
  readonly duplicate: () => LessonDocument;
  readonly runAi: (action: LessonAiActionId) => void;
  readonly addBlock: (kind: LessonBlockKind, phaseId?: LessonPhaseId) => void;
  readonly addTemplateBlock: (index: number) => void;
  readonly updateBlock: (id: string, patch: Partial<LessonBlock>) => void;
  readonly removeBlock: (id: string) => void;
  readonly moveBlock: (from: number, to: number) => void;
  readonly restoreVersion: (versionId: string) => void;
  readonly addComment: (body: string) => void;
};

const LessonBuilderContext = createContext<LessonBuilderContextValue | null>(
  null,
);

function persistLesson(
  doc: LessonDocument,
  note: string,
): LessonDocument {
  const artifactId = syncLessonToWorkspace(doc);
  const withArtifact =
    doc.workspaceArtifactId === artifactId
      ? doc
      : { ...doc, workspaceArtifactId: artifactId };
  return lessonBuilderRepository.save(withArtifact, {
    note,
    actor: "teacher",
  });
}

export function LessonBuilderProvider({
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
  const [lesson, setLesson] = useState<LessonDocument | null>(null);
  const [versions, setVersions] = useState<LessonVersion[]>([]);
  const [sectionId, setSectionId] = useState<LessonSectionId>("general");
  const [panel, setPanel] = useState<LessonBuilderPanel>("editor");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<LessonCorePromptPackage | null>(
    null,
  );
  const lessonRef = useRef<LessonDocument | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    lessonRef.current = lesson;
  }, [lesson]);

  const refreshVersions = useCallback((id: string) => {
    setVersions(lessonBuilderRepository.listVersions(id));
  }, []);

  useEffect(() => {
    if (!project) return;
    const existing = lessonBuilderRepository.getById(lessonId);
    if (!existing || existing.projectId !== project.id) {
      setLesson(null);
      return;
    }
    setLesson(existing);
    refreshVersions(existing.id);
  }, [project, lessonId, refreshVersions]);

  const commit = useCallback(
    (doc: LessonDocument, note: string) => {
      setSaving(true);
      try {
        const saved = persistLesson(doc, note);
        lessonRef.current = saved;
        setLesson(saved);
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
    (doc: LessonDocument) => {
      lessonRef.current = doc;
      setLesson(doc);
      setDirty(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        const pending = lessonRef.current;
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

  const patchLesson = useCallback(
    (
      updater: (prev: LessonDocument) => LessonDocument,
      options?: { immediate?: boolean; note?: string },
    ) => {
      const prev = lessonRef.current;
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

  if (!project || !lesson) {
    return null;
  }

  const value: LessonBuilderContextValue = {
    project,
    lesson,
    versions,
    sectionId,
    setSectionId,
    panel,
    setPanel,
    dirty,
    saving,
    lastSavedAt,
    lastPrompt,
    patchLesson,
    saveNow: (note) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      const doc = lessonRef.current ?? lesson;
      commit(doc, note ?? "manual-save");
    },
    runValidation: () => {
      const current = lessonRef.current ?? lesson;
      const report = validateLesson(current);
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
        const current = lessonRef.current ?? lesson;
        const report = validateLesson(current);
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
        const published = lessonBuilderRepository.publish(validated.id);
        syncLessonToWorkspace(published);
        lessonRef.current = published;
        setLesson(published);
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
      const archived = lessonBuilderRepository.archive(lesson.id);
      syncLessonToWorkspace(archived);
      lessonRef.current = archived;
      setLesson(archived);
      refreshVersions(archived.id);
    },
    duplicate: () => {
      const copy = lessonBuilderRepository.duplicate(lesson.id);
      return persistLesson(copy, "duplicate-link");
    },
    runAi: (action) => {
      const current = lessonRef.current ?? lesson;
      const { lesson: generated, prompt } = applyAiAction({
        project,
        lesson: current,
        action,
        sectionId,
      });
      setLastPrompt(prompt);
      commit(generated, `ai:${action}`);
      setPanel("ai");
    },
    addBlock: (kind, phaseId) => {
      patchLesson(
        (prev) => ({
          ...prev,
          blocks: [
            ...prev.blocks,
            {
              id: createId("lblock"),
              kind,
              title: kind === "activity" ? "Activitate nouă" : "Bloc nou",
              content: "",
              phaseId,
              reusable: false,
              order: prev.blocks.length,
            },
          ],
        }),
        { immediate: true, note: "add-block" },
      );
    },
    addTemplateBlock: (index) => {
      const template = REUSABLE_BLOCK_TEMPLATES[index];
      if (!template) return;
      patchLesson(
        (prev) => ({
          ...prev,
          blocks: [
            ...prev.blocks,
            {
              id: createId("lblock"),
              kind: template.kind,
              title: template.title,
              content: template.content,
              phaseId: template.phaseId,
              reusable: true,
              order: prev.blocks.length,
            },
          ],
        }),
        { immediate: true, note: "template-block" },
      );
    },
    updateBlock: (id, patch) => {
      patchLesson((prev) => ({
        ...prev,
        blocks: prev.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      }));
    },
    removeBlock: (id) => {
      patchLesson(
        (prev) => ({
          ...prev,
          blocks: prev.blocks
            .filter((b) => b.id !== id)
            .map((b, order) => ({ ...b, order })),
        }),
        { immediate: true, note: "remove-block" },
      );
    },
    moveBlock: (from, to) => {
      patchLesson(
        (prev) => {
          const blocks = [...prev.blocks].sort((a, b) => a.order - b.order);
          if (
            from < 0 ||
            to < 0 ||
            from >= blocks.length ||
            to >= blocks.length
          ) {
            return prev;
          }
          const [item] = blocks.splice(from, 1);
          blocks.splice(to, 0, item!);
          return {
            ...prev,
            blocks: blocks.map((b, order) => ({ ...b, order })),
          };
        },
        { immediate: true, note: "reorder-blocks" },
      );
    },
    restoreVersion: (versionId) => {
      const restored = lessonBuilderRepository.restoreVersion(versionId);
      syncLessonToWorkspace(restored);
      lessonRef.current = restored;
      setLesson(restored);
      refreshVersions(restored.id);
      setPanel("versions");
    },
    addComment: (body) => {
      const updated = lessonBuilderRepository.addComment(lesson.id, {
        sectionId,
        body: body.trim(),
        author: "teacher",
      });
      lessonRef.current = updated;
      setLesson(updated);
    },
  };

  return (
    <LessonBuilderContext.Provider value={value}>
      {children}
    </LessonBuilderContext.Provider>
  );
}

export function useLessonBuilder(): LessonBuilderContextValue {
  const ctx = useContext(LessonBuilderContext);
  if (!ctx) {
    throw new Error("useLessonBuilder must be used within LessonBuilderProvider");
  }
  return ctx;
}

export function createLessonInProject(
  project: Project,
  title?: string,
): LessonDocument {
  const created = lessonBuilderRepository.create({
    projectId: project.id,
    general: {
      title: title?.trim() || "Lecție nouă",
      subject: project.subject,
      grade: project.grade,
    },
  });
  return persistLesson(created, "link-artifact");
}
