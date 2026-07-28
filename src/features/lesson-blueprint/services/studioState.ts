import type { DecisionBlueprint } from "../../../engines/decision";
import type {
  LessonAssessmentBlock,
  LessonEditVersion,
  LessonStudioActivity,
  LessonStudioExtensions,
  PlannedMaterialId,
} from "../../blueprint-review/types";
import { DEFAULT_ACTIVITY_TITLES, DEFAULT_PLANNED_MATERIALS } from "../constants";

export type StudioSnapshot = {
  blueprint: DecisionBlueprint;
  activities: LessonStudioActivity[];
  assessmentBlock: LessonAssessmentBlock;
  plannedMaterials: PlannedMaterialId[];
  lessonType?: string;
};

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyAssessmentBlock(): LessonAssessmentBlock {
  return {
    method: "",
    tools: "",
    successCriteria: "",
    observationNotes: "",
  };
}

export function activitiesFromLegacy(
  activities: string[],
  learningFlow: string[],
): LessonStudioActivity[] {
  if (activities.length === 0 && learningFlow.length === 0) return [];

  if (activities.length === 0) {
    return learningFlow.map((title, index) => ({
      id: uid(`flow${index}`),
      title,
      description: "",
    }));
  }

  return activities.map((description, index) => ({
    id: uid(`act${index}`),
    title:
      learningFlow[index] ??
      DEFAULT_ACTIVITY_TITLES[
        Math.min(index, DEFAULT_ACTIVITY_TITLES.length - 1)
      ] ??
      "Activitate",
    description,
  }));
}

export function assessmentFromLegacy(
  assessment: string[],
): LessonAssessmentBlock {
  if (assessment.length === 0) return emptyAssessmentBlock();
  return {
    method: assessment[0] ?? "",
    tools: assessment[1] ?? "",
    successCriteria: assessment[2] ?? "",
    observationNotes: assessment.slice(3).join(" · "),
  };
}

export function syncBlueprintFromStudio(
  blueprint: DecisionBlueprint,
  activities: LessonStudioActivity[],
  assessmentBlock: LessonAssessmentBlock,
): DecisionBlueprint {
  const assessment = [
    assessmentBlock.method,
    assessmentBlock.tools,
    assessmentBlock.successCriteria,
    assessmentBlock.observationNotes,
  ].filter((line) => line.trim().length > 0);

  return {
    ...blueprint,
    learningFlow: activities.map((a) => a.title.trim() || "Activitate"),
    activities: activities.map(
      (a) => a.description.trim() || a.title.trim() || "Activitate",
    ),
    assessment,
  };
}

export function ensureStudioExtensions(input: {
  blueprint: DecisionBlueprint;
  plannedMaterials?: PlannedMaterialId[];
  studioExtensions?: LessonStudioExtensions;
}): LessonStudioExtensions {
  if (input.studioExtensions?.activities) {
    return {
      activities: input.studioExtensions.activities,
      assessmentBlock:
        input.studioExtensions.assessmentBlock ??
        assessmentFromLegacy(input.blueprint.assessment),
      lessonType: input.studioExtensions.lessonType,
      editHistory: input.studioExtensions.editHistory ?? [],
    };
  }

  return {
    activities: activitiesFromLegacy(
      input.blueprint.activities,
      input.blueprint.learningFlow,
    ),
    assessmentBlock: assessmentFromLegacy(input.blueprint.assessment),
    lessonType: undefined,
    editHistory: [],
  };
}

export function defaultPlanned(
  planned?: PlannedMaterialId[],
): PlannedMaterialId[] {
  return planned?.length ? planned : [...DEFAULT_PLANNED_MATERIALS];
}

export function createEditVersion(
  summary: string,
  snapshot: StudioSnapshot,
): LessonEditVersion {
  return {
    id: uid("ver"),
    at: new Date().toISOString(),
    summary,
    snapshot: structuredClone(snapshot),
  };
}

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const diffSec = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (diffSec < 10) return "Acum câteva secunde";
  if (diffSec < 60) return `Acum ${diffSec} secunde`;
  const mins = Math.round(diffSec / 60);
  if (mins < 60) return mins === 1 ? "Acum un minut" : `Acum ${mins} minute`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return hours === 1 ? "Acum o oră" : `Acum ${hours} ore`;
  return new Date(iso).toLocaleString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
