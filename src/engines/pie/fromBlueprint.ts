import type { DecisionBlueprint } from "../decision/types";
import type { PieActivityView, PieAnalysisInput, PieResourceRef } from "./types";

type StudioActivityLike = {
  id: string;
  title: string;
  description?: string;
  durationMinutes?: number;
};

/**
 * Build a PIE analysis input from FEATURE-001 / DecisionBlueprint facts.
 */
export function pieInputFromBlueprint(input: {
  lessonProjectId: string;
  title?: string;
  blueprint: DecisionBlueprint;
  activities?: StudioActivityLike[];
  availableMinutes?: number;
  plannedMaterialLabels?: string[];
  curriculumVersion?: string;
}): PieAnalysisInput {
  const ctx = input.blueprint.learningContext;
  const available =
    input.availableMinutes ?? ctx.durationMinutes ?? 45;

  const activities: PieActivityView[] =
    input.activities?.map((a, index) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      durationMinutes: a.durationMinutes,
      phase: input.blueprint.learningFlow[index],
      collaborative: /grup|coop|perechi|echip/i.test(
        `${a.title} ${a.description ?? ""}`,
      ),
      practical: /practic|exerci|aplic|experiment/i.test(
        `${a.title} ${a.description ?? ""}`,
      ),
    })) ??
    input.blueprint.activities.map((title, index) => ({
      id: `act_${index}`,
      title,
      phase: input.blueprint.learningFlow[index],
      collaborative: /grup|coop|perechi|echip/i.test(title),
      practical: /practic|exerci|aplic/i.test(title),
    }));

  const resources: PieResourceRef[] = [
    ...input.blueprint.resources.map((label, index) => ({
      id: `res_${index}`,
      label,
    })),
    ...(input.plannedMaterialLabels ?? []).map((label, index) => ({
      id: `mat_${index}`,
      label,
      objectType: label,
    })),
  ];

  return {
    lessonProjectId: input.lessonProjectId,
    title:
      input.title ??
      ctx.topic ??
      [ctx.subject, ctx.grade].filter(Boolean).join(" · ") ??
      "Proiectul lecției",
    subject: ctx.subject ?? "",
    grade: ctx.grade ?? "",
    availableMinutes: available,
    teachingStrategy: input.blueprint.learningFlow[0],
    competencies: [...input.blueprint.competencies],
    learningObjectives: [...input.blueprint.objectives],
    learningFlow: [...input.blueprint.learningFlow],
    activities,
    assessment: [...input.blueprint.assessment],
    resources,
    differentiation: [...input.blueprint.differentiation],
    reflection: [...input.blueprint.reflection],
    curriculumVersion: input.curriculumVersion,
    language: ctx.language ?? "ro",
  };
}
