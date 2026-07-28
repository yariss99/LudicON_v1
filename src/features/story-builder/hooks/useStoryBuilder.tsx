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
  createBlankCharacter,
  createBlankScene,
  storyBuilderRepository,
} from "../services/storyBuilderRepository";
import {
  applyStoryAiAction,
  syncStoryToWorkspace,
  type StoryCorePromptPackage,
} from "../services/storyCoreBridge";
import {
  downloadExport,
  exportStory,
  type StoryExportResult,
} from "../services/storyExport";
import { validateStory } from "../services/storyValidation";
import type {
  SceneType,
  StoryAiActionId,
  StoryBuilderPanel,
  StoryChoice,
  StoryDocument,
  StoryExportFormat,
  StoryScene,
  StorySectionId,
  StoryVersion,
} from "../types";

type StoryBuilderContextValue = {
  readonly project: Project;
  readonly story: StoryDocument;
  readonly versions: readonly StoryVersion[];
  readonly sectionId: StorySectionId;
  readonly setSectionId: (id: StorySectionId) => void;
  readonly panel: StoryBuilderPanel;
  readonly setPanel: (panel: StoryBuilderPanel) => void;
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly lastSavedAt: string | null;
  readonly lastPrompt: StoryCorePromptPackage | null;
  readonly previewSceneId: string | null;
  readonly setPreviewSceneId: (id: string | null) => void;
  readonly patchStory: (
    updater: (prev: StoryDocument) => StoryDocument,
    options?: { immediate?: boolean; note?: string },
  ) => void;
  readonly saveNow: (note?: string) => void;
  readonly runValidation: () => void;
  readonly publish: () => { ok: boolean; error?: string };
  readonly archive: () => void;
  readonly duplicate: () => StoryDocument;
  readonly runAi: (action: StoryAiActionId) => void;
  readonly addCharacter: () => void;
  readonly addScene: (type: SceneType) => void;
  readonly updateScene: (id: string, patch: Partial<StoryScene>) => void;
  readonly removeScene: (id: string) => void;
  readonly moveScene: (from: number, to: number) => void;
  readonly updateChoice: (
    sceneId: string,
    choiceId: string,
    patch: Partial<StoryChoice>,
  ) => void;
  readonly addChoice: (sceneId: string) => void;
  readonly restoreVersion: (versionId: string) => void;
  readonly exportFormat: (format: StoryExportFormat) => StoryExportResult;
};

const StoryBuilderContext = createContext<StoryBuilderContextValue | null>(null);

function persistStory(doc: StoryDocument, note: string): StoryDocument {
  const artifactId = syncStoryToWorkspace(doc);
  const withArtifact =
    doc.workspaceArtifactId === artifactId
      ? doc
      : { ...doc, workspaceArtifactId: artifactId };
  return storyBuilderRepository.save(withArtifact, {
    note,
    actor: "teacher",
  });
}

export function StoryBuilderProvider({
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
  const [story, setStory] = useState<StoryDocument | null>(null);
  const [versions, setVersions] = useState<StoryVersion[]>([]);
  const [sectionId, setSectionId] = useState<StorySectionId>("general");
  const [panel, setPanel] = useState<StoryBuilderPanel>("editor");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<StoryCorePromptPackage | null>(
    null,
  );
  const [previewSceneId, setPreviewSceneId] = useState<string | null>(null);
  const ref = useRef<StoryDocument | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    ref.current = story;
  }, [story]);

  const refreshVersions = useCallback((id: string) => {
    setVersions(storyBuilderRepository.listVersions(id));
  }, []);

  useEffect(() => {
    if (!project) return;
    const existing = storyBuilderRepository.getById(storyId);
    if (!existing || existing.projectId !== project.id || !existing.lessonId) {
      setStory(null);
      return;
    }
    setStory(existing);
    setPreviewSceneId(existing.scenes[0]?.id ?? null);
    refreshVersions(existing.id);
  }, [project, storyId, refreshVersions]);

  const commit = useCallback(
    (doc: StoryDocument, note: string) => {
      setSaving(true);
      try {
        const saved = persistStory(doc, note);
        ref.current = saved;
        setStory(saved);
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
    (doc: StoryDocument) => {
      ref.current = doc;
      setStory(doc);
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

  const patchStory = useCallback(
    (
      updater: (prev: StoryDocument) => StoryDocument,
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

  if (!project || !story) return null;

  const value: StoryBuilderContextValue = {
    project,
    story,
    versions,
    sectionId,
    setSectionId,
    panel,
    setPanel,
    dirty,
    saving,
    lastSavedAt,
    lastPrompt,
    previewSceneId,
    setPreviewSceneId,
    patchStory,
    saveNow: (note) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      commit(ref.current ?? story, note ?? "manual-save");
    },
    runValidation: () => {
      const current = ref.current ?? story;
      const report = validateStory(current);
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
        const current = ref.current ?? story;
        const report = validateStory(current);
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
        const published = storyBuilderRepository.publish(validated.id);
        syncStoryToWorkspace(published);
        ref.current = published;
        setStory(published);
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
      const archived = storyBuilderRepository.archive(story.id);
      syncStoryToWorkspace(archived);
      ref.current = archived;
      setStory(archived);
      refreshVersions(archived.id);
    },
    duplicate: () => {
      const copy = storyBuilderRepository.duplicate(story.id);
      return persistStory(copy, "duplicate-link");
    },
    runAi: (action) => {
      const current = ref.current ?? story;
      const { story: generated, prompt } = applyStoryAiAction({
        project,
        story: current,
        action,
        sectionId,
      });
      setLastPrompt(prompt);
      const saved = commit(generated, `ai:${action}`);
      setPreviewSceneId(saved.scenes[0]?.id ?? null);
      setPanel("ai");
    },
    addCharacter: () => {
      patchStory(
        (prev) => ({
          ...prev,
          characters: [...prev.characters, createBlankCharacter()],
        }),
        { immediate: true, note: "add-character" },
      );
    },
    addScene: (type) => {
      patchStory(
        (prev) => ({
          ...prev,
          scenes: [
            ...prev.scenes,
            createBlankScene(type, prev.scenes.length),
          ],
        }),
        { immediate: true, note: "add-scene" },
      );
    },
    updateScene: (id, patch) => {
      patchStory((prev) => ({
        ...prev,
        scenes: prev.scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }));
    },
    removeScene: (id) => {
      patchStory(
        (prev) => ({
          ...prev,
          scenes: prev.scenes
            .filter((s) => s.id !== id)
            .map((s, order) => ({ ...s, order })),
        }),
        { immediate: true, note: "remove-scene" },
      );
    },
    moveScene: (from, to) => {
      patchStory(
        (prev) => {
          const scenes = [...prev.scenes].sort((a, b) => a.order - b.order);
          if (from < 0 || to < 0 || from >= scenes.length || to >= scenes.length) {
            return prev;
          }
          const [item] = scenes.splice(from, 1);
          scenes.splice(to, 0, item!);
          return {
            ...prev,
            scenes: scenes.map((s, order) => ({ ...s, order })),
          };
        },
        { immediate: true, note: "reorder-scenes" },
      );
    },
    updateChoice: (sceneId, choiceId, patch) => {
      patchStory((prev) => ({
        ...prev,
        scenes: prev.scenes.map((s) =>
          s.id === sceneId
            ? {
                ...s,
                choices: s.choices.map((c) =>
                  c.id === choiceId ? { ...c, ...patch } : c,
                ),
              }
            : s,
        ),
      }));
    },
    addChoice: (sceneId) => {
      patchStory(
        (prev) => ({
          ...prev,
          scenes: prev.scenes.map((s) =>
            s.id === sceneId
              ? {
                  ...s,
                  choices: [
                    ...s.choices,
                    { id: createId("schoice"), label: "Alegere nouă" },
                  ],
                }
              : s,
          ),
        }),
        { immediate: true, note: "add-choice" },
      );
    },
    restoreVersion: (versionId) => {
      const restored = storyBuilderRepository.restoreVersion(versionId);
      syncStoryToWorkspace(restored);
      ref.current = restored;
      setStory(restored);
      refreshVersions(restored.id);
      setPanel("versions");
    },
    exportFormat: (format) => {
      const current = ref.current ?? story;
      const result = exportStory(current, format);
      downloadExport(result);
      setPanel("export");
      return result;
    },
  };

  return (
    <StoryBuilderContext.Provider value={value}>
      {children}
    </StoryBuilderContext.Provider>
  );
}

export function useStoryBuilder(): StoryBuilderContextValue {
  const ctx = useContext(StoryBuilderContext);
  if (!ctx) {
    throw new Error("useStoryBuilder must be used within StoryBuilderProvider");
  }
  return ctx;
}

export function createStoryInProject(input: {
  project: Project;
  lessonId: string;
  title?: string;
  kind?: StoryDocument["kind"];
}): StoryDocument {
  const created = storyBuilderRepository.create({
    projectId: input.project.id,
    lessonId: input.lessonId,
    title: input.title,
    subject: input.project.subject,
    grade: input.project.grade,
    kind: input.kind,
  });
  return persistStory(created, "link-artifact");
}
