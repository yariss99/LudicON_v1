import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useProjects } from "../../../context/ProjectContext";
import {
  buildActivityFromProjects,
  buildLibraryFromProjects,
  buildNotifications,
  buildRecommendations,
  buildSuggestions,
  buildTodaySchedule,
  STUDIO_TEACHER,
} from "../data/studioDerivations";
import type { StudioContextSnapshot } from "../types";

type TeacherStudioContextValue = {
  readonly teacher: typeof STUDIO_TEACHER;
  readonly activeProjectId: string | null;
  readonly setActiveProjectId: (id: string | null) => void;
  readonly assistantOpen: boolean;
  readonly setAssistantOpen: (open: boolean) => void;
  readonly toggleAssistant: () => void;
  readonly mobileNavOpen: boolean;
  readonly setMobileNavOpen: (open: boolean) => void;
  readonly sidebarCollapsed: boolean;
  readonly toggleSidebar: () => void;
  readonly contextSnapshot: StudioContextSnapshot;
  readonly unreadNotifications: number;
  readonly markNotificationRead: (id: string) => void;
  readonly markAllNotificationsRead: () => void;
  readonly notificationIdsRead: ReadonlySet<string>;
};

const TeacherStudioContext = createContext<TeacherStudioContextValue | null>(
  null,
);

export function TeacherStudioProvider({ children }: { children: ReactNode }) {
  const { projects, getProject } = useProjects();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    const first = projects.find((p) => !p.archived);
    return first?.id ?? null;
  });
  // Below 1100px the assistant renders as a fixed overlay, so it must not be
  // open on arrival — the teacher opens it from the top bar instead.
  const [assistantOpen, setAssistantOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth > 1100,
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    try {
      if (activeProjectId) {
        localStorage.setItem("prima.studio.activeProject", activeProjectId);
      } else {
        localStorage.removeItem("prima.studio.activeProject");
      }
    } catch {
      /* ignore */
    }
  }, [activeProjectId]);

  const toggleAssistant = useCallback(() => {
    setAssistantOpen((v) => !v);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((v) => !v);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    const all = buildNotifications(projects).map((n) => n.id);
    setReadIds(new Set(all));
  }, [projects]);

  const activeProject = activeProjectId
    ? getProject(activeProjectId)
    : undefined;

  const notifications = buildNotifications(projects);
  const unreadNotifications = notifications.filter(
    (n) => !n.read && !readIds.has(n.id),
  ).length;

  const contextSnapshot: StudioContextSnapshot = useMemo(
    () => ({
      teacher: STUDIO_TEACHER,
      activeProjectId,
      activeProjectTitle: activeProject?.title ?? null,
      workflowHint: activeProject
        ? "Continuă materialul din proiectul activ"
        : "Alege sau creează un proiect pentru a începe",
    }),
    [activeProjectId, activeProject?.title],
  );

  const value = useMemo<TeacherStudioContextValue>(
    () => ({
      teacher: STUDIO_TEACHER,
      activeProjectId,
      setActiveProjectId,
      assistantOpen,
      setAssistantOpen,
      toggleAssistant,
      mobileNavOpen,
      setMobileNavOpen,
      sidebarCollapsed,
      toggleSidebar,
      contextSnapshot,
      unreadNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      notificationIdsRead: readIds,
    }),
    [
      activeProjectId,
      assistantOpen,
      toggleAssistant,
      mobileNavOpen,
      sidebarCollapsed,
      toggleSidebar,
      contextSnapshot,
      unreadNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      readIds,
    ],
  );

  return (
    <TeacherStudioContext.Provider value={value}>
      {children}
    </TeacherStudioContext.Provider>
  );
}

export function useTeacherStudio(): TeacherStudioContextValue {
  const ctx = useContext(TeacherStudioContext);
  if (!ctx) {
    throw new Error(
      "useTeacherStudio must be used within TeacherStudioProvider",
    );
  }
  return ctx;
}

/** Derived studio data hooks — keep pages thin. */
export function useStudioHomeData() {
  const { projects } = useProjects();
  const active = projects.filter((p) => !p.archived);
  const recent = [...active]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 6);

  return {
    recentProjects: recent,
    schedule: buildTodaySchedule(active),
    recommendations: buildRecommendations(active),
    suggestions: buildSuggestions(active),
  };
}

export function useStudioLibraryData(scope: string) {
  const { projects } = useProjects();
  const all = buildLibraryFromProjects(projects);
  const filtered =
    scope === "all"
      ? all
      : all.filter((r) => r.scope === scope || (scope === "favorites" && r.favorite));
  return { resources: filtered, total: all.length };
}

export function useStudioActivityData() {
  const { projects } = useProjects();
  return { items: buildActivityFromProjects(projects) };
}

export function useStudioNotificationsData() {
  const { projects } = useProjects();
  const { notificationIdsRead } = useTeacherStudio();
  const items = buildNotifications(projects).map((n) => ({
    ...n,
    read: n.read || notificationIdsRead.has(n.id),
  }));
  return { items };
}
