import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Project } from "../../../types/project";
import { useProjects } from "../../../context/ProjectContext";
import { createId } from "../../../utils/id";
import {
  classroomStudioRepository,
  listClassroomResources,
} from "../services/classroomStudioRepository";
import type {
  ClassroomActivity,
  ClassroomCalendarEvent,
  ClassroomGroup,
  ClassroomModuleId,
  ClassroomResourcePick,
  ClassroomSession,
} from "../types";

type AutosaveState = "idle" | "saving" | "saved" | "dirty";

type ClassroomStudioContextValue = {
  project: Project;
  session: ClassroomSession;
  module: ClassroomModuleId;
  setModule: (id: ClassroomModuleId) => void;
  resources: ClassroomResourcePick;
  autosave: AutosaveState;
  lastSavedAt: string | null;
  updateSession: (patch: Partial<ClassroomSession>) => void;
  setActiveActivity: (id: string | null) => void;
  addActivity: (partial?: Partial<ClassroomActivity>) => void;
  updateActivity: (id: string, patch: Partial<ClassroomActivity>) => void;
  deleteActivity: (id: string) => void;
  reorderActivities: (from: number, to: number) => void;
  addGroup: () => void;
  updateGroup: (id: string, patch: Partial<ClassroomGroup>) => void;
  deleteGroup: (id: string) => void;
  addCalendarEvent: (partial?: Partial<ClassroomCalendarEvent>) => void;
  updateCalendarEvent: (
    id: string,
    patch: Partial<ClassroomCalendarEvent>,
  ) => void;
  deleteCalendarEvent: (id: string) => void;
  launchBundle: (picks: {
    lessonId?: string;
    presentationId?: string;
    worksheetId?: string;
    gameId?: string;
    assessmentId?: string;
  }) => void;
  saveNow: () => void;
  refreshResources: () => void;
};

const ClassroomStudioContext =
  createContext<ClassroomStudioContextValue | null>(null);

export function ClassroomStudioProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: ReactNode;
}) {
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const [session, setSession] = useState<ClassroomSession | null>(() =>
    projectId
      ? classroomStudioRepository.ensureForProject(projectId, {
          className: getProject(projectId)?.grade
            ? `Class ${getProject(projectId)?.grade}`
            : "My class",
        })
      : null,
  );
  const [module, setModule] = useState<ClassroomModuleId>("dashboard");
  const [resources, setResources] = useState<ClassroomResourcePick>(() =>
    listClassroomResources(projectId),
  );
  const [autosave, setAutosave] = useState<AutosaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const dirtyRef = useRef(false);
  const docRef = useRef(session);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    docRef.current = session;
  }, [session]);

  const refreshResources = useCallback(() => {
    setResources(listClassroomResources(projectId));
  }, [projectId]);

  const persist = useCallback((next: ClassroomSession) => {
    const saved = classroomStudioRepository.save(next);
    setSession(saved);
    dirtyRef.current = false;
    setAutosave("saved");
    setLastSavedAt(saved.updatedAt);
    return saved;
  }, []);

  const commit = useCallback((next: ClassroomSession) => {
    setSession(next);
    dirtyRef.current = true;
    setAutosave("dirty");
  }, []);

  useEffect(() => {
    if (autosave !== "dirty") return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (!dirtyRef.current || !docRef.current) return;
      setAutosave("saving");
      persist(docRef.current);
    }, 1000);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [autosave, session, persist]);

  const updateSession = useCallback(
    (patch: Partial<ClassroomSession>) => {
      if (!session) return;
      commit({ ...session, ...patch, id: session.id });
    },
    [session, commit],
  );

  const setActiveActivity = useCallback(
    (id: string | null) => {
      updateSession({ activeActivityId: id });
    },
    [updateSession],
  );

  const addActivity = useCallback(
    (partial?: Partial<ClassroomActivity>) => {
      if (!session) return;
      const activity: ClassroomActivity = {
        id: createId("cact"),
        title: partial?.title ?? "New activity",
        kind: partial?.kind ?? "custom",
        resourceId: partial?.resourceId,
        resourceHref: partial?.resourceHref,
        estimatedMinutes: partial?.estimatedMinutes ?? 10,
        teacherNotes: partial?.teacherNotes ?? "",
        order: session.activities.length,
      };
      commit({
        ...session,
        activities: [...session.activities, activity],
      });
    },
    [session, commit],
  );

  const updateActivity = useCallback(
    (id: string, patch: Partial<ClassroomActivity>) => {
      if (!session) return;
      commit({
        ...session,
        activities: session.activities.map((a) =>
          a.id === id ? { ...a, ...patch } : a,
        ),
      });
    },
    [session, commit],
  );

  const deleteActivity = useCallback(
    (id: string) => {
      if (!session) return;
      const activities = session.activities
        .filter((a) => a.id !== id)
        .map((a, order) => ({ ...a, order }));
      commit({
        ...session,
        activities,
        activeActivityId:
          session.activeActivityId === id
            ? activities[0]?.id ?? null
            : session.activeActivityId,
      });
    },
    [session, commit],
  );

  const reorderActivities = useCallback(
    (from: number, to: number) => {
      if (!session) return;
      if (from === to) return;
      const activities = [...session.activities].sort(
        (a, b) => a.order - b.order,
      );
      const [moved] = activities.splice(from, 1);
      if (!moved) return;
      activities.splice(to, 0, moved);
      commit({
        ...session,
        activities: activities.map((a, order) => ({ ...a, order })),
      });
    },
    [session, commit],
  );

  const addGroup = useCallback(() => {
    if (!session) return;
    const group: ClassroomGroup = {
      id: createId("cgrp"),
      name: `Group ${String.fromCharCode(65 + session.groups.length)}`,
      color: "#64748B",
      memberLabels: [],
      notes: "",
    };
    commit({ ...session, groups: [...session.groups, group] });
  }, [session, commit]);

  const updateGroup = useCallback(
    (id: string, patch: Partial<ClassroomGroup>) => {
      if (!session) return;
      commit({
        ...session,
        groups: session.groups.map((g) =>
          g.id === id ? { ...g, ...patch } : g,
        ),
      });
    },
    [session, commit],
  );

  const deleteGroup = useCallback(
    (id: string) => {
      if (!session) return;
      commit({
        ...session,
        groups: session.groups.filter((g) => g.id !== id),
      });
    },
    [session, commit],
  );

  const addCalendarEvent = useCallback(
    (partial?: Partial<ClassroomCalendarEvent>) => {
      if (!session) return;
      const event: ClassroomCalendarEvent = {
        id: createId("ccal"),
        title: partial?.title ?? "Class session",
        date: partial?.date ?? new Date().toISOString().slice(0, 10),
        activityId: partial?.activityId,
        notes: partial?.notes ?? "",
      };
      commit({
        ...session,
        calendarEvents: [...session.calendarEvents, event],
      });
    },
    [session, commit],
  );

  const updateCalendarEvent = useCallback(
    (id: string, patch: Partial<ClassroomCalendarEvent>) => {
      if (!session) return;
      commit({
        ...session,
        calendarEvents: session.calendarEvents.map((e) =>
          e.id === id ? { ...e, ...patch } : e,
        ),
      });
    },
    [session, commit],
  );

  const deleteCalendarEvent = useCallback(
    (id: string) => {
      if (!session) return;
      commit({
        ...session,
        calendarEvents: session.calendarEvents.filter((e) => e.id !== id),
      });
    },
    [session, commit],
  );

  const launchBundle = useCallback(
    (picks: {
      lessonId?: string;
      presentationId?: string;
      worksheetId?: string;
      gameId?: string;
      assessmentId?: string;
    }) => {
      if (!session) return;
      const saved = classroomStudioRepository.applyResourceBundle(
        session.id,
        picks,
      );
      setSession(saved);
      setAutosave("saved");
      setLastSavedAt(saved.updatedAt);
      setModule("timeline");
      refreshResources();
    },
    [session, refreshResources],
  );

  const saveNow = useCallback(() => {
    if (!session) return;
    setAutosave("saving");
    persist(session);
  }, [session, persist]);

  const value = useMemo<ClassroomStudioContextValue | null>(() => {
    if (!project || !session) return null;
    return {
      project,
      session,
      module,
      setModule,
      resources,
      autosave,
      lastSavedAt,
      updateSession,
      setActiveActivity,
      addActivity,
      updateActivity,
      deleteActivity,
      reorderActivities,
      addGroup,
      updateGroup,
      deleteGroup,
      addCalendarEvent,
      updateCalendarEvent,
      deleteCalendarEvent,
      launchBundle,
      saveNow,
      refreshResources,
    };
  }, [
    project,
    session,
    module,
    resources,
    autosave,
    lastSavedAt,
    updateSession,
    setActiveActivity,
    addActivity,
    updateActivity,
    deleteActivity,
    reorderActivities,
    addGroup,
    updateGroup,
    deleteGroup,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    launchBundle,
    saveNow,
    refreshResources,
  ]);

  if (!project || !session || !value) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] p-8 text-slate-600">
        Loading Classroom Studio…
      </div>
    );
  }

  return (
    <ClassroomStudioContext.Provider value={value}>
      {children}
    </ClassroomStudioContext.Provider>
  );
}

export function useClassroomStudio() {
  const ctx = useContext(ClassroomStudioContext);
  if (!ctx) {
    throw new Error(
      "useClassroomStudio must be used within ClassroomStudioProvider",
    );
  }
  return ctx;
}
