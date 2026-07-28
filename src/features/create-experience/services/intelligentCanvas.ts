import type { ConfidenceMap } from "../../../engines/decision";
import {
  CANVAS_SECTIONS,
} from "../constants/canvas";
import type {
  BlueprintDraft,
  BlueprintProgressId,
  ConversationTopicId,
} from "../types";
import type {
  BuildCanvasInput,
  CanvasMilestone,
  CanvasSectionId,
  CanvasSectionState,
  CanvasSectionView,
  IntelligentCanvasView,
  UnderstandingLevel,
} from "../types/canvas";

function linesFrom(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

function sectionContent(
  draft: BlueprintDraft,
): Record<CanvasSectionId, string[]> {
  const ctx = draft.learningContext;
  const competencies = linesFrom(draft.competencies);
  const general = competencies.slice(0, 1);
  const specific = competencies.slice(1);

  return {
    topic: ctx.topic ? [ctx.topic] : [],
    subject: ctx.subject ? [ctx.subject] : [],
    grade: ctx.grade ? [ctx.grade] : [],
    curriculum:
      ctx.subject && ctx.grade
        ? [`${ctx.subject} · ${ctx.grade}`]
        : [],
    general_competencies: general,
    specific_competencies: specific,
    learning_objectives: linesFrom(draft.objectives),
    learning_activities: linesFrom([
      ...draft.learningFlow,
      ...draft.activities,
    ]),
    assessment: linesFrom(draft.assessment),
    resources: linesFrom(draft.resources),
    differentiation: linesFrom(draft.differentiation),
    accessibility: [],
    digital_integration: [],
    generated_assets: [],
  };
}

function activeCanvasIds(topic: ConversationTopicId): Set<CanvasSectionId> {
  switch (topic) {
    case "learning_context":
    case "opening":
      return new Set(["topic", "subject", "grade", "curriculum"]);
    case "competencies":
      return new Set(["general_competencies", "specific_competencies"]);
    case "objectives":
      return new Set(["learning_objectives"]);
    case "learning_flow":
    case "activities":
      return new Set(["learning_activities"]);
    case "assessment":
      return new Set(["assessment"]);
    case "resources":
      return new Set(["resources"]);
    case "differentiation":
      return new Set(["differentiation", "accessibility"]);
    case "reflection":
    case "wrap_up":
      return new Set(["generated_assets"]);
    default:
      return new Set();
  }
}

function resolveState(input: {
  lines: string[];
  isActive: boolean;
  needsReview: boolean;
  confidenceLevel?: string;
}): CanvasSectionState {
  if (input.needsReview || input.confidenceLevel === "low") {
    return input.lines.length > 0 || input.isActive
      ? "needs_review"
      : "unknown";
  }
  if (input.lines.length === 0) {
    return input.isActive ? "in_progress" : "unknown";
  }
  if (input.isActive) return "in_progress";
  if (input.confidenceLevel === "high") return "completed";
  if (input.confidenceLevel === "medium") return "completed";
  return "detected";
}

function confidenceForCanvasId(
  id: CanvasSectionId,
  map: ConfidenceMap | null | undefined,
): string | undefined {
  if (!map) return undefined;
  switch (id) {
    case "topic":
    case "subject":
    case "grade":
    case "curriculum":
      return map.learning_context?.level;
    case "general_competencies":
    case "specific_competencies":
      return map.competencies?.level;
    case "learning_objectives":
      return map.objectives?.level;
    case "learning_activities":
      return map.activities?.level ?? map.learning_flow?.level;
    case "assessment":
      return map.assessment?.level;
    case "resources":
      return map.resources?.level;
    case "differentiation":
    case "accessibility":
      return map.differentiation?.level;
    default:
      return undefined;
  }
}

function needsReviewFor(
  id: CanvasSectionId,
  draft: BlueprintDraft,
): boolean {
  const review = draft.needsReview;
  switch (id) {
    case "topic":
    case "subject":
    case "grade":
    case "curriculum":
      return Boolean(review.learning_context);
    case "general_competencies":
    case "specific_competencies":
      return Boolean(review.competencies);
    case "learning_objectives":
      return Boolean(review.objectives);
    case "learning_activities":
      return Boolean(review.activities || review.learning_flow);
    case "assessment":
      return Boolean(review.assessment);
    case "resources":
      return Boolean(review.resources);
    case "differentiation":
    case "accessibility":
      return Boolean(review.differentiation);
    default:
      return false;
  }
}

function understandingLevel(
  draft: BlueprintDraft,
  confidenceMap: ConfidenceMap | null | undefined,
): UnderstandingLevel {
  const ctx = draft.learningContext;
  const contextComplete = Boolean(ctx.subject && ctx.grade && ctx.topic);
  const hasObjectives = draft.objectives.length > 0;
  const lowConfidence = confidenceMap
    ? Object.values(confidenceMap).some((item) => item.level === "low")
    : false;
  const needsReview = Object.values(draft.needsReview).some(Boolean);

  if (needsReview || lowConfidence) return "needs_clarification";
  if (!contextComplete) return "needs_one_detail";
  if (contextComplete && hasObjectives && draft.activities.length > 0) {
    return "excellent";
  }
  if (contextComplete && (hasObjectives || draft.competencies.length > 0)) {
    return "good";
  }
  if (contextComplete) return "good";
  return "needs_one_detail";
}

function nextMilestone(topic: ConversationTopicId): CanvasMilestone {
  switch (topic) {
    case "opening":
    case "learning_context":
      return { id: "competencies", label: "Identificăm competențele" };
    case "competencies":
      return { id: "objectives", label: "Definim obiectivele lecției" };
    case "objectives":
      return { id: "activities", label: "Pregătim activitățile de învățare" };
    case "learning_flow":
    case "activities":
      return { id: "assessment", label: "Gândim evaluarea" };
    case "assessment":
      return { id: "resources", label: "Pregătim resursele" };
    case "resources":
      return { id: "differentiation", label: "Planificăm diferențierea" };
    case "differentiation":
      return { id: "review", label: "Verifică și modifică lecția" };
    default:
      return { id: "review", label: "Verifică și modifică lecția" };
  }
}

function criticalMissingId(
  topic: ConversationTopicId,
  content: Record<CanvasSectionId, string[]>,
): CanvasSectionId | null {
  const ctx = activeCanvasIds(topic);
  for (const id of ctx) {
    if (content[id].length === 0) return id;
  }
  return null;
}

/** CE-003 — build living canvas view from draft + conversation context. */
export function buildIntelligentCanvas(
  input: BuildCanvasInput,
): IntelligentCanvasView {
  const content = sectionContent(input.draft);
  const active = activeCanvasIds(input.currentTopic);
  const criticalId = criticalMissingId(input.currentTopic, content);
  const newly = input.newlyUpdatedIds ?? new Set<CanvasSectionId>();
  const inferred = input.inferredIds ?? new Set<CanvasSectionId>();

  const sections: CanvasSectionView[] = CANVAS_SECTIONS.map((meta) => {
    const lines = content[meta.id];
    const state = resolveState({
      lines,
      isActive: active.has(meta.id),
      needsReview: needsReviewFor(meta.id, input.draft),
      confidenceLevel: confidenceForCanvasId(meta.id, input.confidenceMap),
    });

    return {
      id: meta.id,
      label: meta.label,
      lines,
      state,
      isNew: newly.has(meta.id) && !inferred.has(meta.id),
      isInferred: inferred.has(meta.id),
      criticalMissing: criticalId === meta.id && lines.length === 0,
    };
  });

  const guided = input.guided;
  const currentQuestion = guided
    ? {
        question: guided.question,
        why: guided.whyNeeded,
      }
    : null;

  return {
    sections,
    understanding: understandingLevel(input.draft, input.confidenceMap),
    currentQuestion,
    nextMilestone: nextMilestone(input.currentTopic),
    hasContent: sections.some((section) => section.lines.length > 0),
  };
}

/** Map Blueprint panel updates → canvas section ids for “New” highlights. */
export function panelIdsToCanvasHighlights(
  panelIds: BlueprintProgressId[],
): CanvasSectionId[] {
  const highlighted = new Set<CanvasSectionId>();

  for (const id of panelIds) {
    switch (id) {
      case "learning_context":
        highlighted.add("topic");
        highlighted.add("subject");
        highlighted.add("grade");
        highlighted.add("curriculum");
        break;
      case "competencies":
        highlighted.add("general_competencies");
        highlighted.add("specific_competencies");
        break;
      case "objectives":
        highlighted.add("learning_objectives");
        break;
      case "activities":
      case "learning_flow":
        highlighted.add("learning_activities");
        break;
      case "assessment":
        highlighted.add("assessment");
        break;
      case "resources":
        highlighted.add("resources");
        break;
      case "differentiation":
        highlighted.add("differentiation");
        break;
      default:
        break;
    }
  }

  return [...highlighted];
}
