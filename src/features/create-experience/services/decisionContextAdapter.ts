/**
 * Maps Create Experience draft → AI-002 DecisionContext.
 * No decision logic — structural mapping only.
 */

import type {
  ConversationContext,
  DecisionContext,
  LearningCanvas,
  PedagogicalState,
} from "../../create-learning-experience/decision-engine";
import type { BlueprintDraft } from "../types";

export type CanvasDecisionMeta = {
  curriculumLoaded: boolean;
  curriculumLabel?: string;
  competenciesLoaded: boolean;
  /** AI-003 inferred lesson phase */
  lessonPhase?: string;
};

export function createEmptyCanvasMeta(): CanvasDecisionMeta {
  return {
    curriculumLoaded: false,
    competenciesLoaded: false,
  };
}

export function toLearningCanvas(
  draft: BlueprintDraft,
  meta: CanvasDecisionMeta,
): LearningCanvas {
  return {
    topic: draft.learningContext.topic,
    subject: draft.learningContext.subject,
    grade: draft.learningContext.grade,
    curriculum: meta.curriculumLoaded
      ? (meta.curriculumLabel ??
        `${draft.learningContext.subject ?? "General"} · ${draft.learningContext.grade ?? ""}`.trim())
      : undefined,
    lessonPhase: meta.lessonPhase,
    competencies: [...draft.competencies],
    objectives: [...draft.objectives],
    activities: [...draft.activities],
    assessment: [...draft.assessment],
    resources: [...draft.resources],
  };
}

/** Apply AI-003 HIGH facts onto draft + meta (teacher values already on draft win upstream). */
export function applyInferenceToDraft(input: {
  draft: BlueprintDraft;
  meta: CanvasDecisionMeta;
  canvas: LearningCanvas;
}): { draft: BlueprintDraft; meta: CanvasDecisionMeta } {
  return {
    draft: {
      ...input.draft,
      learningContext: {
        ...input.draft.learningContext,
        subject:
          input.draft.learningContext.subject ?? input.canvas.subject,
        grade: input.draft.learningContext.grade ?? input.canvas.grade,
        topic: input.draft.learningContext.topic ?? input.canvas.topic,
      },
    },
    meta: {
      ...input.meta,
      lessonPhase: input.meta.lessonPhase ?? input.canvas.lessonPhase,
    },
  };
}

export function buildDecisionContext(input: {
  draft: BlueprintDraft;
  meta: CanvasDecisionMeta;
  lastTeacherMessage?: string;
  turnCount: number;
}): DecisionContext {
  const canvas = toLearningCanvas(input.draft, input.meta);
  const pedagogicalState: PedagogicalState = {
    curriculumLoaded: input.meta.curriculumLoaded,
    competenciesLoaded:
      input.meta.competenciesLoaded || input.draft.competencies.length > 0,
    completedSections: {
      grade: Boolean(canvas.grade?.trim()),
      curriculum:
        input.meta.curriculumLoaded || Boolean(canvas.curriculum?.trim()),
      competencies:
        input.meta.competenciesLoaded || canvas.competencies.length > 0,
      objectives: canvas.objectives.length > 0,
      activities: canvas.activities.length > 0,
      assessment: canvas.assessment.length > 0,
      resources: canvas.resources.length > 0,
    },
  };
  const conversationContext: ConversationContext = {
    lastTeacherMessage: input.lastTeacherMessage,
    turnCount: input.turnCount,
  };

  return { canvas, pedagogicalState, conversationContext };
}
