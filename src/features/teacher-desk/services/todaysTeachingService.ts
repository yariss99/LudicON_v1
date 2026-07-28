import type { Project, ProjectResourceType } from "../../../types/project";
import { TODAYS_TEACHING_ESTIMATE_PREFIX } from "../constants";
import type { TeachingOutcome, TodaysTeachingView } from "../types";
import { buildTodayFocusView } from "./focusService";

type OutcomeDefinition = {
  id: string;
  completedLabel: string;
  upcomingLabel: string;
  isCompleted: (project: Project) => boolean;
};

function resourceReady(project: Project, type: ProjectResourceType): boolean {
  return project.resources.some(
    (resource) => resource.type === type && resource.status === "ready",
  );
}

const OUTCOME_DEFINITIONS: readonly OutcomeDefinition[] = [
  {
    id: "blueprint",
    completedLabel: "Proiectul lecției e gata",
    upcomingLabel: "Proiectul lecției e gata",
    isCompleted: (project) =>
      resourceReady(project, "blueprint") ||
      project.state === "blueprint_review" ||
      project.state === "approved" ||
      project.state === "resources_ready",
  },
  {
    id: "assessment",
    completedLabel: "Evaluarea e gata",
    upcomingLabel: "Evaluarea e gata",
    isCompleted: (project) => resourceReady(project, "assessment"),
  },
  {
    id: "lesson",
    completedLabel: "Planul de lecție e disponibil",
    upcomingLabel: "Planul de lecție e disponibil",
    isCompleted: (project) => resourceReady(project, "lesson"),
  },
  {
    id: "worksheet",
    completedLabel: "Fișa de lucru e disponibilă",
    upcomingLabel: "Fișa de lucru e disponibilă",
    isCompleted: (project) => resourceReady(project, "worksheet"),
  },
  {
    id: "presentation",
    completedLabel: "Prezentarea e pregătită",
    upcomingLabel: "Prezentarea e pregătită",
    isCompleted: (project) => resourceReady(project, "presentation"),
  },
  {
    id: "game",
    completedLabel: "Jocul didactic e disponibil",
    upcomingLabel: "Jocul didactic e disponibil",
    isCompleted: (project) => resourceReady(project, "game"),
  },
];

function buildOutcomes(project: Project): TeachingOutcome[] {
  return OUTCOME_DEFINITIONS.map((definition) => {
    const completed = definition.isCompleted(project);
    return {
      id: definition.id,
      label: completed
        ? definition.completedLabel
        : definition.upcomingLabel,
      status: completed ? "completed" : "upcoming",
    };
  });
}

/** Outcome-oriented view of what continuing today's work unlocks. */
export function buildTodaysTeachingView(
  project: Project,
): TodaysTeachingView {
  const focus = buildTodayFocusView(project);
  const estimatedMinutes = focus.estimatedMinutes;

  return {
    experienceId: project.id,
    outcomes: buildOutcomes(project),
    estimatedMinutes,
    estimatedCompletionLabel: `${TODAYS_TEACHING_ESTIMATE_PREFIX} ${estimatedMinutes} minutes`,
  };
}
