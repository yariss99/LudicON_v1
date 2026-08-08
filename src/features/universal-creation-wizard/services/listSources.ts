import { lessonStudioRepository } from "../../lesson-studio/services/lessonStudioRepository";
import { worksheetStudioRepository } from "../../worksheet-studio/services/worksheetStudioRepository";
import { assessmentStudioRepository } from "../../assessment-studio/services/assessmentStudioRepository";
import { gameStudioRepository } from "../../game-studio/services/gameStudioRepository";
import { storyStudioRepository } from "../../story-studio/services/storyStudioRepository";
import type { SourceOption, WizardSourceKind } from "../types";

/** List selectable source documents for a given kind in a project. */
export function listSourceOptions(
  projectId: string,
  sourceKind: WizardSourceKind,
): SourceOption[] {
  if (!projectId || sourceKind === "blank") return [];

  if (sourceKind === "lesson") {
    return lessonStudioRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.properties.title || "Untitled lesson",
      meta: [d.properties.subject, d.properties.grade].filter(Boolean).join(" · "),
    }));
  }
  if (sourceKind === "worksheet") {
    return worksheetStudioRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.properties.title || "Untitled worksheet",
      meta: [d.properties.subject, d.properties.grade].filter(Boolean).join(" · "),
    }));
  }
  if (sourceKind === "assessment") {
    return assessmentStudioRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.properties.title || "Untitled assessment",
      meta: [d.properties.subject, d.properties.grade].filter(Boolean).join(" · "),
    }));
  }
  if (sourceKind === "game") {
    return gameStudioRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.properties.title || "Untitled game",
      meta: [d.properties.subject, d.properties.grade].filter(Boolean).join(" · "),
    }));
  }
  if (sourceKind === "story") {
    return storyStudioRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.properties.title || "Untitled story",
      meta: [d.properties.subject, d.properties.grade].filter(Boolean).join(" · "),
    }));
  }
  return [];
}
