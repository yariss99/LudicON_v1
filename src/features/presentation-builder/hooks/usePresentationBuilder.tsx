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
import { AUTOSAVE_DELAY_MS } from "../constants";
import {
  createBlankSlide,
  presentationBuilderRepository,
} from "../services/presentationBuilderRepository";
import {
  applyPresentationAiAction,
  seedPresentationFromBestSource,
  syncPresentationToWorkspace,
  type PresentationCorePromptPackage,
} from "../services/presentationCoreBridge";
import {
  downloadExport,
  exportPresentation,
  type PresentationExportResult,
} from "../services/presentationExport";
import { validatePresentation } from "../services/presentationValidation";
import type {
  PresentationAiActionId,
  PresentationBuilderPanel,
  PresentationDocument,
  PresentationExportFormat,
  PresentationSectionId,
  PresentationSlide,
  PresentationThemeId,
  PresentationVersion,
  SlideType,
} from "../types";

type PresentationBuilderContextValue = {
  readonly project: Project;
  readonly presentation: PresentationDocument;
  readonly versions: readonly PresentationVersion[];
  readonly sectionId: PresentationSectionId;
  readonly setSectionId: (id: PresentationSectionId) => void;
  readonly panel: PresentationBuilderPanel;
  readonly setPanel: (panel: PresentationBuilderPanel) => void;
  readonly selectedSlideId: string | null;
  readonly setSelectedSlideId: (id: string | null) => void;
  readonly presenterIndex: number;
  readonly setPresenterIndex: (index: number) => void;
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly lastSavedAt: string | null;
  readonly lastPrompt: PresentationCorePromptPackage | null;
  readonly patchPresentation: (
    updater: (prev: PresentationDocument) => PresentationDocument,
    options?: { immediate?: boolean; note?: string },
  ) => void;
  readonly saveNow: (note?: string) => void;
  readonly runValidation: () => void;
  readonly publish: () => { ok: boolean; error?: string };
  readonly archive: () => void;
  readonly duplicate: () => PresentationDocument;
  readonly runAi: (action: PresentationAiActionId) => void;
  readonly addSlide: (type: SlideType) => void;
  readonly updateSlide: (id: string, patch: Partial<PresentationSlide>) => void;
  readonly removeSlide: (id: string) => void;
  readonly moveSlide: (from: number, to: number) => void;
  readonly setTheme: (themeId: PresentationThemeId) => void;
  readonly restoreVersion: (versionId: string) => void;
  readonly exportFormat: (
    format: PresentationExportFormat,
  ) => PresentationExportResult;
};

const PresentationBuilderContext =
  createContext<PresentationBuilderContextValue | null>(null);

function persistPresentation(
  doc: PresentationDocument,
  note: string,
): PresentationDocument {
  const artifactId = syncPresentationToWorkspace(doc);
  const withArtifact =
    doc.workspaceArtifactId === artifactId
      ? doc
      : { ...doc, workspaceArtifactId: artifactId };
  return presentationBuilderRepository.save(withArtifact, {
    note,
    actor: "teacher",
  });
}

export function PresentationBuilderProvider({
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
  const [presentation, setPresentation] =
    useState<PresentationDocument | null>(null);
  const [versions, setVersions] = useState<PresentationVersion[]>([]);
  const [sectionId, setSectionId] =
    useState<PresentationSectionId>("general");
  const [panel, setPanel] = useState<PresentationBuilderPanel>("editor");
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [presenterIndex, setPresenterIndex] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] =
    useState<PresentationCorePromptPackage | null>(null);
  const ref = useRef<PresentationDocument | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    ref.current = presentation;
  }, [presentation]);

  const refreshVersions = useCallback((id: string) => {
    setVersions(presentationBuilderRepository.listVersions(id));
  }, []);

  useEffect(() => {
    if (!project) return;
    const existing = presentationBuilderRepository.getById(presentationId);
    if (!existing || existing.projectId !== project.id) {
      setPresentation(null);
      return;
    }
    setPresentation(existing);
    setSelectedSlideId(existing.slides[0]?.id ?? null);
    refreshVersions(existing.id);
  }, [project, presentationId, refreshVersions]);

  const commit = useCallback(
    (doc: PresentationDocument, note: string) => {
      setSaving(true);
      try {
        const saved = persistPresentation(doc, note);
        ref.current = saved;
        setPresentation(saved);
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
    (doc: PresentationDocument) => {
      ref.current = doc;
      setPresentation(doc);
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

  const patchPresentation = useCallback(
    (
      updater: (prev: PresentationDocument) => PresentationDocument,
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

  if (!project || !presentation) return null;

  const value: PresentationBuilderContextValue = {
    project,
    presentation,
    versions,
    sectionId,
    setSectionId,
    panel,
    setPanel,
    selectedSlideId,
    setSelectedSlideId,
    presenterIndex,
    setPresenterIndex,
    dirty,
    saving,
    lastSavedAt,
    lastPrompt,
    patchPresentation,
    saveNow: (note) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      commit(ref.current ?? presentation, note ?? "manual-save");
    },
    runValidation: () => {
      const current = ref.current ?? presentation;
      const report = validatePresentation(current);
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
        const current = ref.current ?? presentation;
        const report = validatePresentation(current);
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
        const published = presentationBuilderRepository.publish(validated.id);
        syncPresentationToWorkspace(published);
        ref.current = published;
        setPresentation(published);
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
      const archived = presentationBuilderRepository.archive(presentation.id);
      syncPresentationToWorkspace(archived);
      ref.current = archived;
      setPresentation(archived);
      refreshVersions(archived.id);
    },
    duplicate: () => {
      const copy = presentationBuilderRepository.duplicate(presentation.id);
      return persistPresentation(copy, "duplicate-link");
    },
    runAi: (action) => {
      const current = ref.current ?? presentation;
      const { presentation: generated, prompt } = applyPresentationAiAction({
        project,
        presentation: current,
        action,
        sectionId,
      });
      setLastPrompt(prompt);
      const saved = commit(generated, `ai:${action}`);
      setSelectedSlideId(saved.slides[0]?.id ?? null);
      setPanel("ai");
    },
    addSlide: (type) => {
      patchPresentation(
        (prev) => {
          const s = createBlankSlide(type, prev.slides.length);
          setSelectedSlideId(s.id);
          return { ...prev, slides: [...prev.slides, s] };
        },
        { immediate: true, note: "add-slide" },
      );
    },
    updateSlide: (id, patch) => {
      patchPresentation((prev) => ({
        ...prev,
        slides: prev.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }));
    },
    removeSlide: (id) => {
      patchPresentation(
        (prev) => ({
          ...prev,
          slides: prev.slides
            .filter((s) => s.id !== id)
            .map((s, order) => ({ ...s, order })),
        }),
        { immediate: true, note: "remove-slide" },
      );
    },
    moveSlide: (from, to) => {
      patchPresentation(
        (prev) => {
          const slides = [...prev.slides].sort((a, b) => a.order - b.order);
          if (
            from < 0 ||
            to < 0 ||
            from >= slides.length ||
            to >= slides.length
          ) {
            return prev;
          }
          const [item] = slides.splice(from, 1);
          slides.splice(to, 0, item!);
          return {
            ...prev,
            slides: slides.map((s, order) => ({ ...s, order })),
          };
        },
        { immediate: true, note: "reorder-slides" },
      );
    },
    setTheme: (themeId) => {
      patchPresentation(
        (prev) => ({ ...prev, themeId }),
        { immediate: true, note: "set-theme" },
      );
    },
    restoreVersion: (versionId) => {
      const restored =
        presentationBuilderRepository.restoreVersion(versionId);
      syncPresentationToWorkspace(restored);
      ref.current = restored;
      setPresentation(restored);
      refreshVersions(restored.id);
      setPanel("versions");
    },
    exportFormat: (format) => {
      const current = ref.current ?? presentation;
      const result = exportPresentation(current, format);
      downloadExport(result);
      setPanel("export");
      return result;
    },
  };

  return (
    <PresentationBuilderContext.Provider value={value}>
      {children}
    </PresentationBuilderContext.Provider>
  );
}

export function usePresentationBuilder(): PresentationBuilderContextValue {
  const ctx = useContext(PresentationBuilderContext);
  if (!ctx) {
    throw new Error(
      "usePresentationBuilder must be used within PresentationBuilderProvider",
    );
  }
  return ctx;
}

export function createPresentationInProject(input: {
  project: Project;
  lessonId?: string;
  title?: string;
  kind?: PresentationDocument["kind"];
  seedFromSource?: boolean;
}): PresentationDocument {
  const created = presentationBuilderRepository.create({
    projectId: input.project.id,
    lessonId: input.lessonId,
    title: input.title,
    subject: input.project.subject,
    grade: input.project.grade,
    kind: input.kind,
  });
  const seeded =
    input.seedFromSource === false
      ? created
      : seedPresentationFromBestSource(input.project, created);
  return persistPresentation(
    seeded,
    seeded === created ? "link-artifact" : "seed-source",
  );
}
