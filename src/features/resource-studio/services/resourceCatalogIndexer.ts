import type { Project } from "../../../types/project";
import { assessmentStudioRepository } from "../../assessment-studio/services/assessmentStudioRepository";
import { lessonStudioRepository } from "../../lesson-studio/services/lessonStudioRepository";
import { worksheetStudioRepository } from "../../worksheet-studio/services/worksheetStudioRepository";
import { gameStudioRepository } from "../../game-studio/services/gameStudioRepository";
import { presentationStudioRepository } from "../../presentation-studio/services/presentationStudioRepository";
import { storyStudioRepository } from "../../story-studio/services/storyStudioRepository";
import {
  resourceStudioRepository,
  stableResourceId,
} from "./resourceStudioRepository";
import type { ResourceStudioItem } from "../types";

/**
 * Sync studio / builder assets into Resource Studio so teachers never lose them.
 * Preserves favorites, usage, tags, and reuse links on upsert.
 */
export function reindexResourceStudio(projects: readonly Project[]): void {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const indexed: ResourceStudioItem[] = [];

  for (const lesson of lessonStudioRepository.list()) {
    const project = byId.get(lesson.projectId);
    if (!project) continue;
    indexed.push({
      id: stableResourceId("lesson", lesson.id),
      title: lesson.properties.title || "Untitled lesson",
      subject: lesson.properties.subject || project.subject,
      grade: lesson.properties.grade || project.grade,
      projectId: project.id,
      projectTitle: project.title,
      type: "lesson",
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      tags: ["lesson", "studio"],
      favorite: false,
      usageCount: 0,
      linkedTo: [lesson.id],
      sourceHref: `/lesson-studio/${project.id}/${lesson.id}`,
      sourceKind: "studio",
      description: `${lesson.blocks.length} pedagogical blocks`,
      contentPreview: lesson.blocks
        .slice(0, 3)
        .map((b) => b.title)
        .join(" · "),
    });
  }

  for (const worksheet of worksheetStudioRepository.list()) {
    const project = byId.get(worksheet.projectId);
    if (!project) continue;
    indexed.push({
      id: stableResourceId("worksheet", worksheet.id),
      title: worksheet.properties.title || "Untitled worksheet",
      subject: worksheet.properties.subject || project.subject,
      grade: worksheet.properties.grade || project.grade,
      projectId: project.id,
      projectTitle: project.title,
      type: "worksheet",
      createdAt: worksheet.createdAt,
      updatedAt: worksheet.updatedAt,
      tags: ["worksheet", "studio"],
      favorite: false,
      usageCount: 0,
      linkedTo: [worksheet.id],
      sourceHref: `/worksheet-studio/${project.id}/${worksheet.id}`,
      sourceKind: "studio",
      description: `${worksheet.blocks.length} worksheet blocks`,
      contentPreview: worksheet.properties.instructions.slice(0, 120),
    });
  }

  for (const assessment of assessmentStudioRepository.list()) {
    const project = byId.get(assessment.projectId);
    if (!project) continue;
    indexed.push({
      id: stableResourceId("assessment", assessment.id),
      title: assessment.properties.title || "Untitled assessment",
      subject: assessment.properties.subject || project.subject,
      grade: assessment.properties.grade || project.grade,
      projectId: project.id,
      projectTitle: project.title,
      type: "assessment",
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
      tags: ["assessment", "studio", assessment.properties.purpose],
      favorite: false,
      usageCount: 0,
      linkedTo: [assessment.id],
      sourceHref: `/assessment-studio/${project.id}/${assessment.id}`,
      sourceKind: "studio",
      description: `${assessment.summary.itemCount} items · ~${assessment.summary.estimatedDurationMinutes} min`,
      contentPreview: assessment.summary.targetedCompetencies
        .slice(0, 4)
        .join(" · "),
    });
  }

  for (const presentation of presentationStudioRepository.list()) {
    const project = byId.get(presentation.projectId);
    if (!project) continue;
    indexed.push({
      id: stableResourceId("presentation", presentation.id),
      title: presentation.properties.title || "Untitled presentation",
      subject: presentation.properties.subject || project.subject,
      grade: presentation.properties.grade || project.grade,
      projectId: project.id,
      projectTitle: project.title,
      type: "presentation",
      createdAt: presentation.createdAt,
      updatedAt: presentation.updatedAt,
      tags: ["presentation", "studio", presentation.source.kind],
      favorite: false,
      usageCount: 0,
      linkedTo: [presentation.id],
      sourceHref: `/presentation-studio/${project.id}/${presentation.id}`,
      sourceKind: "studio",
      description: `${presentation.blocks.length} slides`,
      contentPreview: presentation.source.sourceTitle || "",
    });
  }

  for (const game of gameStudioRepository.list()) {
    const project = byId.get(game.projectId);
    if (!project) continue;
    indexed.push({
      id: stableResourceId("game", game.id),
      title: game.properties.title || "Untitled game",
      subject: game.properties.subject || project.subject,
      grade: game.properties.grade || project.grade,
      projectId: project.id,
      projectTitle: project.title,
      type: "game",
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
      tags: ["game", "studio", game.properties.gameType],
      favorite: false,
      usageCount: 0,
      linkedTo: [game.id],
      sourceHref: `/game-studio/${project.id}/${game.id}`,
      sourceKind: "studio",
      description: `${game.blocks.length} blocks · ${game.mechanics.length} mechanics`,
      contentPreview: game.properties.learningObjective || "",
    });
  }

  for (const story of storyStudioRepository.list()) {
    const project = byId.get(story.projectId);
    if (!project) continue;
    indexed.push({
      id: stableResourceId("story", story.id),
      title: story.properties.title || "Untitled story",
      subject: story.properties.subject || project.subject,
      grade: story.properties.grade || project.grade,
      projectId: project.id,
      projectTitle: project.title,
      type: "story",
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      tags: ["story", "studio", story.properties.theme],
      favorite: false,
      usageCount: 0,
      linkedTo: [story.id],
      sourceHref: `/story-studio/${project.id}/${story.id}`,
      sourceKind: "studio",
      description: `${story.blocks.length} narrative beats`,
      contentPreview: story.properties.learningObjective || "",
    });
  }

  resourceStudioRepository.upsertIndexed(indexed);
}
