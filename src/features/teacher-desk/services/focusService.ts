import type { Project, ProjectState } from "../../../types/project";
import {
  JOURNEY_NEXT_STEPS,
  JOURNEY_STAGE_IDS,
  JOURNEY_STAGE_LABELS,
  JOURNEY_TIME_ESTIMATES_MIN,
} from "../constants";
import type {
  JourneyStage,
  JourneyStageId,
  JourneyStageStatus,
  TodayFocusView,
} from "../types";

function resolveCurrentStageIndex(project: Project): number {
  const { state } = project;

  if (state === "conversation") return stageIndex("context");
  if (state === "blueprint_review") return stageIndex("review");
  if (state === "approved") return stageIndex("generate");

  // resources_ready — land on the first incomplete pedagogical stage
  const assessment = project.resources.find(
    (resource) => resource.type === "assessment",
  );
  if (assessment && assessment.status !== "ready") {
    return stageIndex("assessment");
  }

  const classroomResources = project.resources.filter((resource) =>
    ["worksheet", "presentation", "lesson", "activities", "game"].includes(
      resource.type,
    ),
  );
  const resourcesOpen = classroomResources.some(
    (resource) => resource.status !== "ready",
  );
  if (resourcesOpen) return stageIndex("resources");

  return stageIndex("generate");
}

function stageIndex(id: JourneyStageId): number {
  return JOURNEY_STAGE_IDS.indexOf(id);
}

function buildStages(currentIndex: number): JourneyStage[] {
  return JOURNEY_STAGE_IDS.map((id, index) => {
    let status: JourneyStageStatus = "pending";
    if (index < currentIndex) status = "completed";
    if (index === currentIndex) status = "current";
    return {
      id,
      label: JOURNEY_STAGE_LABELS[id],
      status,
    };
  });
}

function estimateMinutes(
  currentIndex: number,
  state: ProjectState,
): number {
  const pendingCount = JOURNEY_STAGE_IDS.length - currentIndex;
  if (state === "resources_ready" && pendingCount <= 1) {
    return JOURNEY_TIME_ESTIMATES_MIN[0];
  }
  if (pendingCount <= 2) return JOURNEY_TIME_ESTIMATES_MIN[0];
  if (pendingCount <= 4) return JOURNEY_TIME_ESTIMATES_MIN[1];
  return JOURNEY_TIME_ESTIMATES_MIN[2];
}

export function buildTodayFocusView(project: Project): TodayFocusView {
  const currentIndex = resolveCurrentStageIndex(project);
  const currentStageId = JOURNEY_STAGE_IDS[currentIndex] ?? "context";
  const estimatedMinutes = estimateMinutes(currentIndex, project.state);

  return {
    experience: project,
    stages: buildStages(currentIndex),
    currentStageId,
    nextStep: JOURNEY_NEXT_STEPS[currentStageId],
    estimatedMinutes,
    estimatedTimeLabel: `${estimatedMinutes} min`,
  };
}
