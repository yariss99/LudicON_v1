import type {
  PedagogicalFinding,
  PedagogicalReview,
  PedagogicalReviewInput,
  PedagogicalStage,
} from "../../types/pedagogy";
import { estimateExperienceMinutes } from "./durationEstimates";
import {
  detectAssessment,
  detectBalance,
  detectDifferentiation,
  detectStages,
} from "./signals";

const STAGE_LABEL: Record<PedagogicalStage, string> = {
  attention: "Attention",
  discovery: "Discovery",
  practice: "Practice",
  reflection: "Reflection",
  assessment: "Assessment",
};

const STAGE_SUGGESTION: Record<PedagogicalStage, string> = {
  attention:
    "A short hook — a question, image, or 2-minute game — helps every learner arrive ready.",
  discovery:
    "An explore-first moment (materials, pairs, or a tiny inquiry) lets students build the idea themselves.",
  practice:
    "A guided practice step turns understanding into confidence before independent work.",
  reflection:
    "A 3-minute reflection (“What clicked? What still feels fuzzy?”) deepens lasting learning.",
  assessment:
    "A gentle check — exit ticket, show-me board, or peer explain — shows you what landed.",
};

function uid(prefix: string, key: string): string {
  return `${prefix}_${key}`;
}

function buildFindings(input: PedagogicalReviewInput): {
  strengths: PedagogicalFinding[];
  suggestions: PedagogicalFinding[];
  improvements: PedagogicalFinding[];
  stages: ReturnType<typeof detectStages>;
  time: PedagogicalReview["time"];
  balance: ReturnType<typeof detectBalance>;
  differentiation: ReturnType<typeof detectDifferentiation>;
  assessment: ReturnType<typeof detectAssessment>;
} {
  const availableMinutes = input.availableMinutes ?? 45;
  const stages = detectStages(input.resources);
  const balance = detectBalance(input.resources);
  const differentiation = detectDifferentiation(
    input.resources,
    input.intention ?? input.project.description,
  );
  const assessment = detectAssessment(
    input.resources,
    input.intention ?? input.project.description,
  );
  const { total, breakdown } = estimateExperienceMinutes(input.resources);
  const time = {
    availableMinutes,
    estimatedMinutes: total,
    exceedsAvailable: total > availableMinutes,
    breakdown,
  };

  const strengths: PedagogicalFinding[] = [];
  const suggestions: PedagogicalFinding[] = [];
  const improvements: PedagogicalFinding[] = [];

  // --- Stage strengths & gaps ---
  for (const stage of stages) {
    if (stage.present) {
      strengths.push({
        id: uid("str", stage.stage),
        checkId: "stages",
        kind: "strength",
        stage: stage.stage,
        title: `${STAGE_LABEL[stage.stage]} is in the journey`,
        detail:
          stage.evidence.length > 0
            ? `Supported by ${stage.evidence.slice(0, 2).join(" and ")}.`
            : "This stage shows up in your experience design.",
      });
    } else {
      suggestions.push({
        id: uid("sug", `stage_${stage.stage}`),
        checkId: "stages",
        kind: "suggestion",
        stage: stage.stage,
        title: `You could enrich with ${STAGE_LABEL[stage.stage].toLowerCase()}`,
        detail: STAGE_SUGGESTION[stage.stage],
      });
    }
  }

  // Cap stage suggestions — keep panel calm (max 2 as suggestions; rest as optional improvements)
  const stageSuggestionIds = suggestions
    .filter((s) => s.checkId === "stages")
    .map((s) => s.id);
  if (stageSuggestionIds.length > 2) {
    for (const id of stageSuggestionIds.slice(2)) {
      const idx = suggestions.findIndex((s) => s.id === id);
      if (idx < 0) continue;
      const [item] = suggestions.splice(idx, 1);
      improvements.push({
        ...item,
        kind: "improvement",
        id: uid("imp", item.id),
        title: item.title.replace(
          "You could enrich with",
          "Optional next step:",
        ),
      });
    }
  }

  // --- Time ---
  if (!time.exceedsAvailable && time.estimatedMinutes > 0) {
    strengths.push({
      id: uid("str", "time_fit"),
      checkId: "time",
      kind: "strength",
      title: "Timing looks comfortable",
      detail: `About ${time.estimatedMinutes} minutes planned for a ${time.availableMinutes}-minute window.`,
    });
  } else if (time.exceedsAvailable) {
    suggestions.push({
      id: uid("sug", "time"),
      checkId: "time",
      kind: "suggestion",
      title: "A gentler pace might help",
      detail: `This experience is estimated around ${time.estimatedMinutes} minutes, and you have ${time.availableMinutes}. You might shorten one activity or split practice across two days — your call.`,
    });
  }

  // --- Balance ---
  if (balance.scores.active > 0 && !balance.fewActiveMoments) {
    strengths.push({
      id: uid("str", "active"),
      checkId: "balance",
      kind: "strength",
      title: "Active learning moments are present",
      detail: "Students get to do something with the idea — not only hear it.",
    });
  }
  if (balance.lectureHeavy) {
    suggestions.push({
      id: uid("sug", "lecture"),
      checkId: "balance",
      kind: "suggestion",
      title: "Invite a short active beat",
      detail:
        "Your story and visuals are strong. A 5-minute pair talk or hands-on try could balance the listening time.",
    });
  }
  if (balance.worksheetHeavy || balance.individualHeavy) {
    suggestions.push({
      id: uid("sug", "worksheet_balance"),
      checkId: "balance",
      kind: "suggestion",
      title: "Mix in a collaborative moment",
      detail:
        "Independent practice is valuable. A quick pair check or mini-game before the sheet can lift energy and understanding.",
    });
  }
  if (balance.digitalHeavy) {
    improvements.push({
      id: uid("imp", "digital"),
      checkId: "balance",
      kind: "improvement",
      title: "Optional: offline anchor",
      detail:
        "Screens are doing good work. A paper, material, or movement moment can ground the digital energy.",
    });
  }
  if (balance.fewActiveMoments && !balance.lectureHeavy) {
    suggestions.push({
      id: uid("sug", "active"),
      checkId: "balance",
      kind: "suggestion",
      title: "Add one joyful active moment",
      detail:
        "Even a 4-minute stand-and-share or build-with-materials task can transform engagement.",
    });
  }

  // --- Differentiation ---
  if (differentiation.hasGroupWork && differentiation.hasIndividualWork) {
    strengths.push({
      id: uid("str", "diff_modes"),
      checkId: "differentiation",
      kind: "strength",
      title: "Group and individual paths appear",
      detail: "Learners can collaborate and also work at their own pace.",
    });
  }
  if (!differentiation.hasSupportPath) {
    suggestions.push({
      id: uid("sug", "support"),
      checkId: "differentiation",
      kind: "suggestion",
      title: "A support path would welcome every learner",
      detail:
        "Consider a scaffolded version, sentence starters, or worked example for students who need a softer entry.",
    });
  }
  if (!differentiation.hasAdvancedPath) {
    improvements.push({
      id: uid("imp", "advanced"),
      checkId: "differentiation",
      kind: "improvement",
      title: "Optional challenge for curious minds",
      detail:
        "An extension question or “teach a peer” task keeps advanced learners stretched without leaving others behind.",
    });
  }
  if (!differentiation.hasGroupWork) {
    improvements.push({
      id: uid("imp", "group"),
      checkId: "differentiation",
      kind: "improvement",
      title: "Optional: peer learning beat",
      detail:
        "A short pair or trio task can surface thinking you would not see in solo work alone.",
    });
  }

  // --- Assessment ---
  if (assessment.hasFormative) {
    strengths.push({
      id: uid("str", "formative"),
      checkId: "assessment",
      kind: "strength",
      title: "Formative checking is planned",
      detail: "You’ll see understanding while there is still time to respond.",
    });
  } else {
    suggestions.push({
      id: uid("sug", "formative"),
      checkId: "assessment",
      kind: "suggestion",
      title: "A light formative check would help",
      detail:
        "An exit ticket, thumbs check, or “explain to a partner” moment keeps feedback kind and timely.",
    });
  }
  if (assessment.hasReflection) {
    strengths.push({
      id: uid("str", "reflect"),
      checkId: "assessment",
      kind: "strength",
      title: "Reflection is part of the design",
      detail: "Students get space to notice their own learning.",
    });
  } else if (!stages.find((s) => s.stage === "reflection")?.present) {
    // already suggested via stages — skip duplicate wording unless empty
  }
  if (!assessment.hasFeedbackMoment) {
    improvements.push({
      id: uid("imp", "feedback"),
      checkId: "assessment",
      kind: "improvement",
      title: "Optional feedback ritual",
      detail:
        "A warm closing (“one thing I learned / one question I still have”) makes progress visible.",
    });
  }
  if (!assessment.hasSummative && assessment.hasFormative) {
    // fine — formative-first is good; soft optional
    improvements.push({
      id: uid("imp", "summative"),
      checkId: "assessment",
      kind: "improvement",
      title: "Optional later checkpoint",
      detail:
        "When you are ready, a short quiz or portfolio piece can celebrate growth — no rush.",
    });
  }

  // Deduplicate titles lightly
  const dedupe = (items: PedagogicalFinding[]) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.title)) return false;
      seen.add(item.title);
      return true;
    });
  };

  return {
    strengths: dedupe(strengths).slice(0, 6),
    suggestions: dedupe(suggestions).slice(0, 5),
    improvements: dedupe(improvements).slice(0, 4),
    stages,
    time,
    balance,
    differentiation,
    assessment,
  };
}

function buildSummary(
  strengths: PedagogicalFinding[],
  suggestions: PedagogicalFinding[],
  time: PedagogicalReview["time"],
): string {
  if (strengths.length >= 3 && suggestions.length === 0) {
    return "This learning experience already has a strong pedagogical shape. You’re in a good place.";
  }
  if (time.exceedsAvailable) {
    return "There is solid substance here. A small trim for time would make it even kinder to teach.";
  }
  if (strengths.length > 0) {
    return `Nice foundation — ${strengths.length} strength${strengths.length === 1 ? "" : "s"} already show. A few optional ideas below if you want to go further.`;
  }
  return "Every experience starts somewhere. These ideas are invitations — you decide what fits your class.";
}

/**
 * Pedagogical Intelligence Engine — educational reasoning, not generative AI.
 * Pure function: same input → same review.
 */
export function analyzeLearningExperience(
  input: PedagogicalReviewInput,
): PedagogicalReview {
  const built = buildFindings(input);
  return {
    analyzedAt: new Date().toISOString(),
    stages: built.stages,
    time: built.time,
    balance: built.balance,
    differentiation: built.differentiation,
    assessment: built.assessment,
    strengths: built.strengths,
    suggestions: built.suggestions,
    improvements: built.improvements,
    summary: buildSummary(built.strengths, built.suggestions, built.time),
  };
}

export const pedagogicalEngine = {
  analyze: analyzeLearningExperience,
};
