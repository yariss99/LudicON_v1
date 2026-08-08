import { lessonStudioRepository } from "../../lesson-studio/services/lessonStudioRepository";
import { worksheetStudioRepository } from "../../worksheet-studio/services/worksheetStudioRepository";
import { assessmentStudioRepository } from "../../assessment-studio/services/assessmentStudioRepository";
import { presentationStudioRepository } from "../../presentation-studio/services/presentationStudioRepository";
import { gameStudioRepository } from "../../game-studio/services/gameStudioRepository";
import { storyStudioRepository } from "../../story-studio/services/storyStudioRepository";
import type { ArtifactInventory } from "../suggestionTypes";

/** Snapshot studio artifacts for a project — input to SuggestionEngine. */
export function buildArtifactInventory(
  projectId: string,
  projectTitle: string,
): ArtifactInventory {
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
