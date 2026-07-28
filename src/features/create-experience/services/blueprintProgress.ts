import { PROGRESS_SECTIONS, TOPIC_TO_SECTION } from "../constants";
import type {
  BlueprintDraft,
  BlueprintProgressId,
  ConversationTopicId,
  ProgressSectionView,
  SectionStatus,
} from "../types";
import type { ConfidenceMap } from "../../../engines/decision";
import { confidenceToStatus } from "./decisionAdapter";
import { contextCompleteness } from "./extractFromMessage";

function contextDetailLines(draft: BlueprintDraft): string[] {
  const ctx = draft.learningContext;
  return [
    ctx.subject && `Subject: ${ctx.subject}`,
    ctx.grade && `Grade: ${ctx.grade}`,
    ctx.topic && `Topic: ${ctx.topic}`,
    ctx.durationMinutes && `Duration: ${ctx.durationMinutes} min`,
  ].filter(Boolean) as string[];
}

function legacyStatus(
  complete: boolean,
  partial: boolean,
  needsReview: boolean,
  active: boolean,
): SectionStatus {
  if (needsReview) return "needs_review";
  if (complete) return "completed";
  if (partial || active) return "in_progress";
  return "not_started";
}

/**
 * Maps discovery draft (+ Decision confidence) → live Blueprint panel views.
 */
export function buildProgressViews(
  draft: BlueprintDraft,
  options: {
    currentTopic: ConversationTopicId;
    highlightedIds?: ReadonlySet<BlueprintProgressId>;
    confidenceMap?: ConfidenceMap | null;
  },
): ProgressSectionView[] {
  const activeSection = TOPIC_TO_SECTION[options.currentTopic];
  const highlighted = options.highlightedIds ?? new Set();
  const cm = options.confidenceMap;

  const sectionContent: Record<
    BlueprintProgressId,
    { hasContent: boolean; preview?: string; detailLines: string[] }
  > = {
    learning_context: {
      hasContent: contextCompleteness(draft.learningContext) >= 3,
      preview: [
        draft.learningContext.subject,
        draft.learningContext.grade,
        draft.learningContext.topic,
      ]
        .filter(Boolean)
        .join(" · ") || undefined,
      detailLines: contextDetailLines(draft),
    },
    competencies: {
      hasContent: draft.competencies.length > 0,
      preview: draft.competencies[0],
      detailLines: draft.competencies,
    },
    objectives: {
      hasContent: draft.objectives.length > 0,
      preview: draft.objectives[0],
      detailLines: draft.objectives,
    },
    learning_flow: {
      hasContent: draft.learningFlow.length > 0,
      preview: draft.learningFlow[0],
      detailLines: draft.learningFlow,
    },
    activities: {
      hasContent: draft.activities.length > 0,
      preview: draft.activities[0],
      detailLines: draft.activities,
    },
    assessment: {
      hasContent: draft.assessment.length > 0,
      preview: draft.assessment[0],
      detailLines: draft.assessment,
    },
    resources: {
      hasContent: draft.resources.length > 0,
      preview: draft.resources[0],
      detailLines: draft.resources,
    },
    differentiation: {
      hasContent: draft.differentiation.length > 0,
      preview: draft.differentiation[0],
      detailLines: draft.differentiation,
    },
    reflection: {
      hasContent: draft.reflection.length > 0,
      preview: draft.reflection[0],
      detailLines: draft.reflection,
    },
  };

  return PROGRESS_SECTIONS.map((section) => {
    const data = sectionContent[section.id];
    const active = activeSection === section.id;
    const needsReview = Boolean(draft.needsReview[section.id]);
    const status = cm
      ? confidenceToStatus(
          cm[section.id]?.level,
          data.hasContent ||
            (section.id === "learning_context" &&
              contextCompleteness(draft.learningContext) > 0),
          active,
          needsReview,
        )
      : legacyStatus(
          data.hasContent,
          section.id === "learning_context"
            ? contextCompleteness(draft.learningContext) > 0
            : data.hasContent,
          needsReview,
          active,
        );

    return {
      id: section.id,
      label: section.label,
      status,
      preview: data.preview,
      detailLines: data.detailLines,
      highlighted: highlighted.has(section.id),
    };
  });
}

export function nextStepHint(topic: ConversationTopicId): string {
  switch (topic) {
    case "opening":
    case "learning_context":
      return "Următorul pas: conturăm contextul lecției.";
    case "competencies":
      return "Următorul pas: numim competența pe care o întărește lecția.";
    case "objectives":
      return "Următorul pas: captăm un obiectiv clar de învățare.";
    case "learning_flow":
      return "Următorul pas: schițăm fazele parcursului lecției.";
    case "activities":
      return "Următorul pas: descriem ce vor face elevii.";
    case "assessment":
      return "Următorul pas: decidem cum verificăm învățarea.";
    case "resources":
      return "Următorul pas: notăm materialele și instrumentele.";
    case "differentiation":
      return "Următorul pas: captăm o idee de sprijin sau de extensie.";
    case "reflection":
      return "Următorul pas: alegem un semn de reflecție după lecție.";
    case "wrap_up":
      return "Proiectul lecției este gata de verificare împreună.";
    default:
      return "Continuă — câte o întrebare pe rând.";
  }
}

export function diffUpdatedSections(
  prev: BlueprintDraft,
  next: BlueprintDraft,
): BlueprintProgressId[] {
  const ids: BlueprintProgressId[] = [];
  if (
    JSON.stringify(prev.learningContext) !== JSON.stringify(next.learningContext)
  ) {
    ids.push("learning_context");
  }
  const pairs: Array<[BlueprintProgressId, string[]]> = [
    ["competencies", next.competencies],
    ["objectives", next.objectives],
    ["learning_flow", next.learningFlow],
    ["activities", next.activities],
    ["assessment", next.assessment],
    ["resources", next.resources],
    ["differentiation", next.differentiation],
    ["reflection", next.reflection],
  ];
  const prevPairs: Record<string, string[]> = {
    competencies: prev.competencies,
    objectives: prev.objectives,
    learning_flow: prev.learningFlow,
    activities: prev.activities,
    assessment: prev.assessment,
    resources: prev.resources,
    differentiation: prev.differentiation,
    reflection: prev.reflection,
  };
  for (const [id, list] of pairs) {
    if (list.join("|") !== (prevPairs[id] ?? []).join("|")) ids.push(id);
  }
  return ids;
}
