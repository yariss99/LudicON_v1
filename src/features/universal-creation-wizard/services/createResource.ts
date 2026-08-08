import { createId } from "../../../utils/id";
import {
  createBlock,
  createLessonInStudio,
  lessonStudioRepository,
} from "../../lesson-studio/services/lessonStudioRepository";
import {
  createWorksheetBlock,
  createWorksheetInStudio,
  worksheetStudioRepository,
} from "../../worksheet-studio/services/worksheetStudioRepository";
import {
  createAssessmentBlock,
  createAssessmentInStudio,
  assessmentStudioRepository,
} from "../../assessment-studio/services/assessmentStudioRepository";
import {
  createPresentationInStudio,
  presentationStudioRepository,
} from "../../presentation-studio/services/presentationStudioRepository";
import { createBlankPresentationBlocks } from "../../presentation-studio/services/seedFromResources";
import {
  createGameInStudio,
  gameStudioRepository,
} from "../../game-studio/services/gameStudioRepository";
import { createDefaultGameBlocks } from "../../game-studio/services/seedFromResources";
import {
  createStoryInStudio,
  storyStudioRepository,
} from "../../story-studio/services/storyStudioRepository";
import { createDefaultStoryBlocks } from "../../story-studio/services/seedFromResources";
import { projectWorkspaceRepository } from "../../project-workspace/services/projectWorkspaceRepository";
import { notifyArtifactsChanged } from "../../home-workspace/services/homeLessonProgressStore";
import { teachingWorkflowStore } from "../../teaching-workflow/services/teachingWorkflowStore";
import type { FlowStepKind } from "../../teaching-workflow/constants";
import { openLessonPath } from "../../lesson-studio/LessonStudioPage";
import { openWorksheetPath } from "../../worksheet-studio/WorksheetStudioPage";
import { openAssessmentPath } from "../../assessment-studio/AssessmentStudioPage";
import { openPresentationPath } from "../../presentation-studio/PresentationStudioPage";
import { openGamePath } from "../../game-studio/GameStudioPage";
import { openStoryPath } from "../../story-studio/StoryStudioPage";
import type {
  CreateResourceResult,
  WizardDraft,
  WizardResourceType,
  WizardSourceKind,
} from "../types";
import { DEFAULT_STRUCTURE } from "../constants";

function applyLessonStructure(id: string) {
  const doc = lessonStudioRepository.getById(id);
  if (!doc) return;
  const types = [
    "objectives",
    "introduction",
    "discovery",
    "practice",
    "assessment",
  ] as const;
  const labels = DEFAULT_STRUCTURE.lesson;
  lessonStudioRepository.save({
    ...doc,
    blocks: types.map((type, order) => ({
      ...createBlock(type, order),
      title: labels[order] ?? createBlock(type, order).title,
    })),
  });
}

function applyWorksheetStructure(id: string) {
  const doc = worksheetStudioRepository.getById(id);
  if (!doc) return;
  const plan: { type: Parameters<typeof createWorksheetBlock>[0]; title: string }[] =
    [
      { type: "exercises", title: "Title" },
      { type: "exercises", title: "Objective" },
      { type: "exercises", title: "Exercise 1" },
      { type: "problems", title: "Exercise 2" },
      { type: "reflection", title: "Reflection" },
    ];
  worksheetStudioRepository.save({
    ...doc,
    blocks: plan.map((p, order) => ({
      ...createWorksheetBlock(p.type, order),
      title: p.title,
    })),
  });
}

function applyAssessmentStructure(id: string) {
  const doc = assessmentStudioRepository.getById(id);
  if (!doc) return;
  const plan: {
    type: Parameters<typeof createAssessmentBlock>[0];
    title: string;
  }[] = [
    { type: "short_answer", title: "Competencies" },
    { type: "multiple_choice", title: "Questions" },
    { type: "rubric", title: "Rubric" },
  ];
  assessmentStudioRepository.save({
    ...doc,
    blocks: plan.map((p, order) => ({
      ...createAssessmentBlock(p.type, order, doc.properties.competencies),
      title: p.title,
    })),
  });
}

function applyPresentationStructure(id: string) {
  const doc = presentationStudioRepository.getById(id);
  if (!doc) return;
  const blanks = createBlankPresentationBlocks();
  // title, text×2 as intro/content, reflection as summary
  const blocks = [
    { ...blanks[0], title: "Title", order: 0 },
    {
      ...(blanks[1] ?? blanks[0]),
      id: createId("pblk"),
      title: "Introduction",
      order: 1,
    },
    {
      ...(blanks[1] ?? blanks[0]),
      id: createId("pblk"),
      type: "text" as const,
      title: "Content Slides",
      order: 2,
    },
    {
      ...(blanks[4] ?? blanks[0]),
      id: createId("pblk"),
      type: "reflection" as const,
      title: "Summary",
      order: 3,
    },
  ];
  presentationStudioRepository.save({ ...doc, blocks });
}

function applyGameStructure(id: string) {
  const doc = gameStudioRepository.getById(id);
  if (!doc) return;
  const defaults = createDefaultGameBlocks();
  const byType = (t: string) => defaults.find((b) => b.type === t) ?? defaults[0];
  const blocks = [
    { ...byType("mission"), id: createId("gblk"), title: "Mission", order: 0 },
    {
      ...byType("question"),
      id: createId("gblk"),
      title: "Challenges",
      order: 1,
    },
    { ...byType("reward"), id: createId("gblk"), title: "Rewards", order: 2 },
  ];
  gameStudioRepository.save({ ...doc, blocks });
}

function applyStoryStructure(id: string) {
  const doc = storyStudioRepository.getById(id);
  if (!doc) return;
  const defaults = createDefaultStoryBlocks();
  const byType = (t: string) => defaults.find((b) => b.type === t) ?? defaults[0];
  const blocks = [
    {
      ...byType("character"),
      id: createId("sblk"),
      title: "Characters",
      order: 0,
    },
    { ...byType("mission"), id: createId("sblk"), title: "Mission", order: 1 },
    { ...byType("scene"), id: createId("sblk"), title: "Scenes", order: 2 },
    {
      ...byType("reflection"),
      id: createId("sblk"),
      title: "Reflection",
      order: 3,
    },
  ];
  storyStudioRepository.save({ ...doc, blocks });
}

function toGameSource(
  kind: WizardSourceKind,
): "scratch" | "lesson" | "worksheet" | "assessment" {
  if (kind === "blank") return "scratch";
  if (kind === "lesson" || kind === "worksheet" || kind === "assessment") {
    return kind;
  }
  return "scratch";
}

function toPresentationSource(
  kind: WizardSourceKind,
): "blank" | "lesson" | "worksheet" | "assessment" | "story" {
  if (kind === "blank") return "blank";
  if (
    kind === "lesson" ||
    kind === "worksheet" ||
    kind === "assessment" ||
    kind === "story"
  ) {
    return kind;
  }
  return "blank";
}

function toStorySource(
  kind: WizardSourceKind,
): "blank" | "lesson" | "worksheet" | "assessment" | "game" {
  if (kind === "blank") return "blank";
  if (
    kind === "lesson" ||
    kind === "worksheet" ||
    kind === "assessment" ||
    kind === "game"
  ) {
    return kind;
  }
  return "blank";
}

function openPath(
  type: WizardResourceType,
  projectId: string,
  id: string,
): string {
  switch (type) {
    case "lesson":
      return openLessonPath(projectId, id, "guided", false);
    case "worksheet":
      return openWorksheetPath(projectId, id, "guided", false);
    case "assessment":
      return openAssessmentPath(projectId, id, "guided", false);
    case "presentation":
      return openPresentationPath(projectId, id, "guided", false);
    case "game":
      return openGamePath(projectId, id, "guided", false);
    case "story":
      return openStoryPath(projectId, id, "guided", false);
  }
}

function syncWorkspaceArtifact(
  projectId: string,
  kind: WizardResourceType,
  title: string,
  studioId: string,
) {
  const unit = projectWorkspaceRepository.ensureDefaultUnit(projectId);
  projectWorkspaceRepository.createArtifact({
    projectId,
    kind,
    title,
    unitId: unit.id,
    createdBy: "teacher",
    payload: { studioId, via: "universal-creation-wizard" },
    tags: ["wizard", kind],
  });
  projectWorkspaceRepository.addActivity({
    projectId,
    kind: "teacher_action",
    title: `Created ${kind}`,
    detail: title,
    actor: "teacher",
    artifactId: studioId,
  });
}

function sourceMeta(
  draft: WizardDraft,
): { title?: string; subject?: string; grade?: string } {
  if (!draft.sourceKind || draft.sourceKind === "blank" || !draft.sourceId) {
    return {};
  }
  const id = draft.sourceId;
  if (draft.sourceKind === "lesson") {
    const d = lessonStudioRepository.getById(id);
    return d
      ? {
          title: d.properties.title,
          subject: d.properties.subject,
          grade: d.properties.grade,
        }
      : {};
  }
  if (draft.sourceKind === "worksheet") {
    const d = worksheetStudioRepository.getById(id);
    return d
      ? {
          title: d.properties.title,
          subject: d.properties.subject,
          grade: d.properties.grade,
        }
      : {};
  }
  if (draft.sourceKind === "assessment") {
    const d = assessmentStudioRepository.getById(id);
    return d
      ? {
          title: d.properties.title,
          subject: d.properties.subject,
          grade: d.properties.grade,
        }
      : {};
  }
  if (draft.sourceKind === "game") {
    const d = gameStudioRepository.getById(id);
    return d
      ? {
          title: d.properties.title,
          subject: d.properties.subject,
          grade: d.properties.grade,
        }
      : {};
  }
  if (draft.sourceKind === "story") {
    const d = storyStudioRepository.getById(id);
    return d
      ? {
          title: d.properties.title,
          subject: d.properties.subject,
          grade: d.properties.grade,
        }
      : {};
  }
  return {};
}

/**
 * Create a studio resource with Mission 002 default structure,
 * sync workspace counts, and notify Copilot.
 */
export function createResourceFromWizard(
  draft: WizardDraft,
): CreateResourceResult {
  if (!draft.resourceType) throw new Error("RESOURCE_TYPE_REQUIRED");
  if (!draft.projectId) throw new Error("PROJECT_REQUIRED");
  if (!draft.title.trim()) throw new Error("TITLE_REQUIRED");

  const type = draft.resourceType;
  const projectId = draft.projectId;
  const sourceKind = draft.sourceKind ?? "blank";
  const meta = sourceMeta(draft);
  const seed = {
    title: draft.title.trim(),
    subject: draft.subject || meta.subject || "",
    grade: draft.grade || meta.grade || "",
  };

  let resourceId = "";

  switch (type) {
    case "lesson": {
      const doc = createLessonInStudio(projectId, seed);
      applyLessonStructure(doc.id);
      resourceId = doc.id;
      break;
    }
    case "worksheet": {
      const doc = createWorksheetInStudio(projectId, {
        ...seed,
        instructions:
          sourceKind === "lesson" && meta.title
            ? `Based on lesson: ${meta.title}`
            : "",
      });
      applyWorksheetStructure(doc.id);
      resourceId = doc.id;
      break;
    }
    case "assessment": {
      const doc = createAssessmentInStudio(projectId, seed);
      applyAssessmentStructure(doc.id);
      resourceId = doc.id;
      break;
    }
    case "presentation": {
      const doc = createPresentationInStudio(projectId, {
        ...seed,
        sourceKind: toPresentationSource(sourceKind),
        sourceId: draft.sourceId ?? undefined,
      });
      if (sourceKind === "blank") applyPresentationStructure(doc.id);
      resourceId = doc.id;
      break;
    }
    case "game": {
      const doc = createGameInStudio(projectId, {
        ...seed,
        sourceKind: toGameSource(sourceKind),
        sourceId: draft.sourceId ?? undefined,
      });
      if (sourceKind === "blank") applyGameStructure(doc.id);
      resourceId = doc.id;
      break;
    }
    case "story": {
      const doc = createStoryInStudio(projectId, {
        ...seed,
        sourceKind: toStorySource(sourceKind),
        sourceId: draft.sourceId ?? undefined,
      });
      if (sourceKind === "blank") applyStoryStructure(doc.id);
      resourceId = doc.id;
      break;
    }
  }

  syncWorkspaceArtifact(projectId, type, seed.title, resourceId);
  teachingWorkflowStore.touch({
    projectId,
    kind: type as FlowStepKind,
    resourceId,
    markCompleted: true,
  });
  notifyArtifactsChanged();

  return {
    resourceType: type,
    projectId,
    resourceId,
    title: seed.title,
    href: openPath(type, projectId, resourceId),
  };
}
