import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import {
  activeProjects,
  sortProjectsByUpdatedAt,
} from "../../../utils/projectSearch";
import {
  buildDailyBrief,
  buildTodayFocusView,
  buildTodaysTeachingView,
} from "../services";
import { buildAtelierImpact } from "../services/atelierMetrics";

const RECENT_LESSONS_LIMIT = 3;

export function useDeskBusinessState() {
  const navigate = useNavigate();
  const { projects, openProject, refresh } = useProjects();

  const active = useMemo(
    () => sortProjectsByUpdatedAt(activeProjects(projects)),
    [projects],
  );

  const focusExperience = active[0] ?? null;
  const isEmpty = active.length === 0;

  const recentProjects = useMemo(
    () => active.slice(0, RECENT_LESSONS_LIMIT),
    [active],
  );

  const atelierImpact = useMemo(() => buildAtelierImpact(projects), [projects]);

  const todayFocus = useMemo(
    () => (focusExperience ? buildTodayFocusView(focusExperience) : null),
    [focusExperience],
  );

  const todaysTeaching = useMemo(
    () =>
      focusExperience ? buildTodaysTeachingView(focusExperience) : null,
    [focusExperience],
  );

  const dailyBrief = useMemo(
    () => buildDailyBrief(active, focusExperience),
    [active, focusExperience],
  );

  const createExperience = useCallback(() => {
    navigate("/create/experience");
  }, [navigate]);

  const browseLibrary = useCallback(() => {
    navigate("/library");
  }, [navigate]);

  const continueExperience = useCallback(
    (projectId: string) => {
      openProject(projectId);
      navigate(`/studio/${projectId}`);
    },
    [navigate, openProject],
  );

  return {
    refresh,
    isEmpty,
    dailyBrief,
    todayFocus,
    todaysTeaching,
    recentProjects,
    atelierImpact,
    focusExperienceId: focusExperience?.id ?? null,
    createExperience,
    browseLibrary,
    continueExperience,
  };
}
