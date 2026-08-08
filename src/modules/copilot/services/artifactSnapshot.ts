import { lessonStudioRepository } from "../../../features/lesson-studio/services/lessonStudioRepository";
import { worksheetStudioRepository } from "../../../features/worksheet-studio/services/worksheetStudioRepository";
import { assessmentStudioRepository } from "../../../features/assessment-studio/services/assessmentStudioRepository";
import { presentationStudioRepository } from "../../../features/presentation-studio/services/presentationStudioRepository";
import { gameStudioRepository } from "../../../features/game-studio/services/gameStudioRepository";
import { storyStudioRepository } from "../../../features/story-studio/services/storyStudioRepository";
import type { CopilotArtifactSnapshot } from "../types";

/** Build artifact counts from studio repositories (Lesson / Worksheet / Assessment / …). */
export function buildArtifactSnapshot(
  projectId: string,
  projectTitle: string,
): CopilotArtifactSnapshot {
  return {
    projectId,
    projectTitle,
    lessonCount: lessonStudioRepository.listByProject(projectId).length,
    worksheetCount: worksheetStudioRepository.listByProject(projectId).length,
    assessmentCount: assessmentStudioRepository.listByProject(projectId).length,
    presentationCount: presentationStudioRepository.listByProject(projectId)
      .length,
    gameCount: gameStudioRepository.listByProject(projectId).length,
    storyCount: storyStudioRepository.listByProject(projectId).length,
  };
}

/** Resolve project id from common studio / workspace routes. */
export function resolveProjectIdFromPath(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  const studioIdx = parts.indexOf("studio");
  if (studioIdx >= 0 && parts[studioIdx + 1]) return parts[studioIdx + 1];

  for (const key of [
    "lesson-studio",
    "worksheet-studio",
    "assessment-studio",
    "presentation-studio",
    "game-studio",
    "story-studio",
    "classroom-studio",
    "lesson-builder",
    "worksheet-builder",
    "assessment-builder",
    "game-builder",
    "story-builder",
    "presentation-builder",
  ]) {
    const idx = parts.indexOf(key);
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  }

  const projectsIdx = parts.indexOf("projects");
  if (projectsIdx >= 0 && parts[projectsIdx + 1] && parts[projectsIdx + 1] !== "new") {
    return parts[projectsIdx + 1];
  }

  return null;
}
