import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { DecisionBlueprint } from "../../../engines/decision";
import { useProjects } from "../../../context/ProjectContext";
import { parseStudioIntent } from "../../studio/intentParser";
import { blueprintReviewRepository } from "../../blueprint-review/services/blueprintReviewRepository";
import { reviewOrchestrator } from "../../blueprint-review/services/reviewOrchestrator";
import type {
  BlueprintReviewDocument,
  LessonAssessmentBlock,
  LessonEditVersion,
  LessonStudioActivity,
  PlannedMaterialId,
} from "../../blueprint-review/types";
import { readHandoffForStudio } from "../services/handoff";
import {
  createEditVersion,
  defaultPlanned,
  ensureStudioExtensions,
  syncBlueprintFromStudio,
  type StudioSnapshot,
} from "../services/studioState";

type CollapsedMap = Record<string, boolean>;

const PLANNED_KEY = "prima.lesson.blueprint.planned";
const MAX_UNDO = 40;
const VERSION_DEBOUNCE_MS = 2500;

function stashPlannedMaterials(
  blueprintId: string,
  materials: PlannedMaterialId[],
): void {
  try {
    sessionStorage.setItem(
      `${PLANNED_KEY}.${blueprintId}`,
      JSON.stringify(materials),
    );
  } catch {
    /* ignore */
  }
}

function snapshotOf(input: {
  blueprint: DecisionBlueprint;
  activities: LessonStudioActivity[];
  assessmentBlock: LessonAssessmentBlock;
  plannedMaterials: PlannedMaterialId[];
  lessonType?: string;
}): StudioSnapshot {
  return structuredClone({
    blueprint: input.blueprint,
    activities: input.activities,
    assessmentBlock: input.assessmentBlock,
    plannedMaterials: input.plannedMaterials,
    lessonType: input.lessonType,
  });
}

export function useLessonBlueprint() {
  const { blueprintId = "" } = useParams();
  const navigate = useNavigate();
  const { createStudioProject } = useProjects();

  const [doc, setDoc] = useState<BlueprintReviewDocument | null>(null);
  const [uiState, setUiState] = useState<"loading" | "empty" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [collapsed, setCollapsed] = useState<CollapsedMap>({});
  const [activities, setActivities] = useState<LessonStudioActivity[]>([]);
  const [assessmentBlock, setAssessmentBlock] = useState<LessonAssessmentBlock>({
    method: "",
    tools: "",
    successCriteria: "",
    observationNotes: "",
  });
  const [lessonType, setLessonType] = useState<string | undefined>();
  const [editHistory, setEditHistory] = useState<LessonEditVersion[]>([]);
  const [readOnly, setReadOnly] = useState(false);

  const saveTimer = useRef<number | null>(null);
  const versionTimer = useRef<number | null>(null);
  const pendingVersionSummary = useRef("Modificare lecție");
  const docRef = useRef<BlueprintReviewDocument | null>(null);
  const activitiesRef = useRef<LessonStudioActivity[]>([]);
  const assessmentRef = useRef<LessonAssessmentBlock>(assessmentBlock);
  const lessonTypeRef = useRef<string | undefined>(undefined);
  const historyRef = useRef<LessonEditVersion[]>([]);
  const undoStack = useRef<StudioSnapshot[]>([]);
  const redoStack = useRef<StudioSnapshot[]>([]);
  const applyingHistory = useRef(false);

  useEffect(() => {
    docRef.current = doc;
  }, [doc]);
  useEffect(() => {
    activitiesRef.current = activities;
  }, [activities]);
  useEffect(() => {
    assessmentRef.current = assessmentBlock;
  }, [assessmentBlock]);
  useEffect(() => {
    lessonTypeRef.current = lessonType;
  }, [lessonType]);
  useEffect(() => {
    historyRef.current = editHistory;
  }, [editHistory]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setReadOnly(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const hydrateFromDoc = useCallback((loaded: BlueprintReviewDocument) => {
    const ext = ensureStudioExtensions({
      blueprint: loaded.blueprint,
      plannedMaterials: loaded.plannedMaterials,
      studioExtensions: loaded.studioExtensions,
    });
    setDoc({
      ...loaded,
      plannedMaterials: defaultPlanned(loaded.plannedMaterials),
      studioExtensions: ext,
    });
    setActivities(ext.activities);
    setAssessmentBlock(ext.assessmentBlock);
    setLessonType(ext.lessonType);
    setEditHistory(ext.editHistory);
    undoStack.current = [];
    redoStack.current = [];
  }, []);

  const load = useCallback(async () => {
    setUiState("loading");
    setError(null);
    try {
      if (blueprintId && blueprintId !== "new") {
        const existing = reviewOrchestrator.load(blueprintId);
        if (!existing) {
          setDoc(null);
          setUiState("empty");
          return;
        }
        hydrateFromDoc(existing);
        setUiState("ready");
        return;
      }

      const handoff = readHandoffForStudio();
      if (!handoff) {
        setDoc(null);
        setUiState("empty");
        return;
      }

      const created =
        await reviewOrchestrator.createFromDecisionSession(handoff);
      hydrateFromDoc(created);
      setUiState("ready");
      navigate(`/blueprint/review/${created.id}`, { replace: true });
    } catch {
      setError("Nu am putut deschide proiectul lecției. Munca ta este păstrată.");
      setUiState("error");
    }
  }, [blueprintId, hydrateFromDoc, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const currentSnapshot = useCallback((): StudioSnapshot | null => {
    if (!docRef.current) return null;
    return snapshotOf({
      blueprint: docRef.current.blueprint,
      activities: activitiesRef.current,
      assessmentBlock: assessmentRef.current,
      plannedMaterials: defaultPlanned(docRef.current.plannedMaterials),
      lessonType: lessonTypeRef.current,
    });
  }, []);

  const pushUndo = useCallback(() => {
    if (applyingHistory.current) return;
    const snap = currentSnapshot();
    if (!snap) return;
    undoStack.current = [...undoStack.current, snap].slice(-MAX_UNDO);
    redoStack.current = [];
  }, [currentSnapshot]);

  const persist = useCallback(
    (
      nextDoc: BlueprintReviewDocument,
      nextActivities: LessonStudioActivity[],
      nextAssessment: LessonAssessmentBlock,
      nextLessonType: string | undefined,
      nextHistory: LessonEditVersion[],
    ) => {
      const syncedBlueprint = syncBlueprintFromStudio(
        nextDoc.blueprint,
        nextActivities,
        nextAssessment,
      );
      const withStudio: BlueprintReviewDocument = {
        ...nextDoc,
        blueprint: syncedBlueprint,
        studioExtensions: {
          activities: nextActivities,
          assessmentBlock: nextAssessment,
          lessonType: nextLessonType,
          editHistory: nextHistory,
        },
        decisionSession: {
          ...nextDoc.decisionSession,
          blueprint: syncedBlueprint,
        },
      };
      setSaving(true);
      const saved = reviewOrchestrator.saveTeacherEdits(withStudio);
      setDoc(saved);
      setSaving(false);
      return saved;
    },
    [],
  );

  const scheduleVersion = useCallback((summary: string) => {
    pendingVersionSummary.current = summary;
    if (versionTimer.current) window.clearTimeout(versionTimer.current);
    versionTimer.current = window.setTimeout(() => {
      const snap = currentSnapshot();
      if (!snap || !docRef.current) return;
      const version = createEditVersion(pendingVersionSummary.current, snap);
      const nextHistory = [...historyRef.current, version].slice(-30);
      setEditHistory(nextHistory);
      persist(
        docRef.current,
        activitiesRef.current,
        assessmentRef.current,
        lessonTypeRef.current,
        nextHistory,
      );
    }, VERSION_DEBOUNCE_MS);
  }, [currentSnapshot, persist]);

  const scheduleSave = useCallback(
    (
      nextDoc: BlueprintReviewDocument,
      nextActivities: LessonStudioActivity[],
      nextAssessment: LessonAssessmentBlock,
      nextLessonType: string | undefined,
      versionSummary?: string,
    ) => {
      setDoc(nextDoc);
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        persist(
          nextDoc,
          nextActivities,
          nextAssessment,
          nextLessonType,
          historyRef.current,
        );
        if (versionSummary) scheduleVersion(versionSummary);
      }, 400);
    },
    [persist, scheduleVersion],
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      if (versionTimer.current) window.clearTimeout(versionTimer.current);
    };
  }, []);

  const applySnapshot = useCallback(
    (snap: StudioSnapshot) => {
      if (!docRef.current) return;
      applyingHistory.current = true;
      setActivities(snap.activities);
      setAssessmentBlock(snap.assessmentBlock);
      setLessonType(snap.lessonType);
      const nextDoc: BlueprintReviewDocument = {
        ...docRef.current,
        blueprint: snap.blueprint,
        plannedMaterials: snap.plannedMaterials,
      };
      setDoc(nextDoc);
      persist(
        nextDoc,
        snap.activities,
        snap.assessmentBlock,
        snap.lessonType,
        historyRef.current,
      );
      window.setTimeout(() => {
        applyingHistory.current = false;
      }, 0);
    },
    [persist],
  );

  const undo = useCallback(() => {
    const previous = undoStack.current.pop();
    if (!previous) return;
    const current = currentSnapshot();
    if (current) redoStack.current.push(current);
    applySnapshot(previous);
  }, [applySnapshot, currentSnapshot]);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    const current = currentSnapshot();
    if (current) undoStack.current.push(current);
    applySnapshot(next);
  }, [applySnapshot, currentSnapshot]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (readOnly) return;
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;
      const key = event.key.toLowerCase();
      if (key === "z" && event.shiftKey) {
        event.preventDefault();
        redo();
        return;
      }
      if (key === "z") {
        event.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [readOnly, redo, undo]);

  const updateBlueprint = useCallback(
    (
      updater: (blueprint: DecisionBlueprint) => DecisionBlueprint,
      versionSummary = "Modificare informații generale",
    ) => {
      if (!docRef.current || readOnly) return;
      pushUndo();
      const nextDoc: BlueprintReviewDocument = {
        ...docRef.current,
        blueprint: updater(docRef.current.blueprint),
      };
      scheduleSave(
        nextDoc,
        activitiesRef.current,
        assessmentRef.current,
        lessonTypeRef.current,
        versionSummary,
      );
    },
    [pushUndo, readOnly, scheduleSave],
  );

  const updateLessonType = useCallback(
    (value: string) => {
      if (!docRef.current || readOnly) return;
      pushUndo();
      setLessonType(value);
      scheduleSave(
        docRef.current,
        activitiesRef.current,
        assessmentRef.current,
        value,
        "Schimbat tipul lecției",
      );
    },
    [pushUndo, readOnly, scheduleSave],
  );

  const setPlannedMaterials = useCallback(
    (plannedMaterials: PlannedMaterialId[]) => {
      if (!docRef.current || readOnly) return;
      pushUndo();
      const next = { ...docRef.current, plannedMaterials };
      scheduleSave(
        next,
        activitiesRef.current,
        assessmentRef.current,
        lessonTypeRef.current,
        "Actualizat materialele de creat",
      );
    },
    [pushUndo, readOnly, scheduleSave],
  );

  const updateActivities = useCallback(
    (nextActivities: LessonStudioActivity[]) => {
      if (readOnly) return;
      pushUndo();
      setActivities(nextActivities);
      if (!docRef.current) return;
      scheduleSave(
        docRef.current,
        nextActivities,
        assessmentRef.current,
        lessonTypeRef.current,
        "Actualizat desfășurarea lecției",
      );
    },
    [pushUndo, readOnly, scheduleSave],
  );

  const updateAssessment = useCallback(
    (next: LessonAssessmentBlock) => {
      if (readOnly) return;
      pushUndo();
      setAssessmentBlock(next);
      if (!docRef.current) return;
      scheduleSave(
        docRef.current,
        activitiesRef.current,
        next,
        lessonTypeRef.current,
        "Actualizat evaluarea",
      );
    },
    [pushUndo, readOnly, scheduleSave],
  );

  const updateCompetencies = useCallback(
    (competencies: string[]) => {
      updateBlueprint((bp) => ({ ...bp, competencies }), "Modificat competențele");
    },
    [updateBlueprint],
  );

  const updateObjectives = useCallback(
    (objectives: string[]) => {
      updateBlueprint((bp) => ({ ...bp, objectives }), "Modificat obiectivele");
    },
    [updateBlueprint],
  );

  const toggleCard = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const restoreVersion = useCallback(
    (versionId: string) => {
      const version = historyRef.current.find((v) => v.id === versionId);
      if (!version) return;
      pushUndo();
      applySnapshot(version.snapshot);
      setNotice("Versiunea a fost restaurată.");
      window.setTimeout(() => setNotice(null), 2400);
    },
    [applySnapshot, pushUndo],
  );

  const saveNow = useCallback(() => {
    if (!docRef.current) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    persist(
      docRef.current,
      activitiesRef.current,
      assessmentRef.current,
      lessonTypeRef.current,
      historyRef.current,
    );
  }, [persist]);

  const createMaterials = useCallback(async () => {
    if (!docRef.current || readOnly) return;
    setCreating(true);
    setError(null);
    try {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      if (versionTimer.current) window.clearTimeout(versionTimer.current);
      const saved = persist(
        docRef.current,
        activitiesRef.current,
        assessmentRef.current,
        lessonTypeRef.current,
        historyRef.current,
      );

      let result = reviewOrchestrator.approveForTeachingMaterials(saved);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      let projectId = result.projectId;
      if (!projectId) {
        const ctx = result.blueprint.learningContext;
        const intent = parseStudioIntent(
          [
            ctx.subject && `Subject: ${ctx.subject}`,
            ctx.grade && `Grade: ${ctx.grade}`,
            ctx.topic && `Topic: ${ctx.topic}`,
            result.blueprint.objectives[0] &&
              `Objective: ${result.blueprint.objectives[0]}`,
          ]
            .filter(Boolean)
            .join(". ") || result.title,
        );
        if (ctx.subject) intent.subject = ctx.subject;
        if (ctx.grade) intent.grade = ctx.grade;
        if (ctx.topic) {
          intent.title = `${ctx.topic[0]?.toUpperCase() ?? ""}${ctx.topic.slice(1)}`;
        }
        const project = createStudioProject(intent);
        projectId = project.id;
        result = blueprintReviewRepository.save({
          ...result,
          projectId,
          generationUnlocked: true,
        });
      }

      stashPlannedMaterials(result.id, result.plannedMaterials ?? []);
      setDoc(result);
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      navigate(`/generation/${result.id}`);
    } catch {
      setError(
        "Nu am putut deschide materialele. Proiectul lecției este păstrat — încearcă din nou.",
      );
    } finally {
      setCreating(false);
    }
  }, [createStudioProject, navigate, persist, readOnly]);

  const previewLesson = useCallback(() => {
    setNotice("Previzualizarea lecției va fi disponibilă în curând.");
    window.setTimeout(() => setNotice(null), 2400);
  }, []);

  const exportLesson = useCallback(() => {
    if (!docRef.current) return;
    const payload = {
      title: docRef.current.title,
      blueprint: docRef.current.blueprint,
      activities: activitiesRef.current,
      assessment: assessmentRef.current,
      lessonType: lessonTypeRef.current,
      plannedMaterials: docRef.current.plannedMaterials,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(docRef.current.blueprint.learningContext.topic || "lectie")
      .toLowerCase()
      .replace(/\s+/g, "-")}-proiect.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Lecția a fost exportată.");
    window.setTimeout(() => setNotice(null), 2400);
  }, []);

  const plannedMaterials = useMemo(
    () => defaultPlanned(doc?.plannedMaterials),
    [doc?.plannedMaterials],
  );

  return {
    doc,
    uiState,
    error,
    notice,
    saving,
    creating,
    collapsed,
    activities,
    assessmentBlock,
    lessonType,
    editHistory,
    plannedMaterials,
    readOnly,
    toggleCard,
    updateBlueprint,
    updateLessonType,
    updateCompetencies,
    updateObjectives,
    updateActivities,
    updateAssessment,
    setPlannedMaterials,
    restoreVersion,
    saveNow,
    createMaterials,
    previewLesson,
    exportLesson,
    undo,
    redo,
    clearError: () => setError(null),
  };
}
