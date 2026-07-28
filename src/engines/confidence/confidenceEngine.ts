import { estimateExperienceMinutes } from "../pedagogy/durationEstimates";
import type {
  ConfidenceActionId,
  ConfidenceDimension,
  ConfidenceDimensionId,
  ConfidenceImprovement,
  ConfidenceInput,
  ConfidenceLevel,
  ConfidenceReport,
} from "../../types/confidence";
import type { ProjectResource, ProjectResourceType } from "../../types/project";

function levelFromScore(score: number): ConfidenceLevel {
  if (score >= 80) return "ready";
  if (score >= 55) return "almost";
  return "building";
}

function present(resources: ProjectResource[], type: ProjectResourceType) {
  return resources.find((r) => r.type === type);
}

function isUsable(resource?: ProjectResource): boolean {
  return Boolean(resource && resource.status !== "empty");
}

function isReady(resource?: ProjectResource): boolean {
  return resource?.status === "ready";
}

function scoreReadiness(resources: ProjectResource[]): ConfidenceDimension {
  const core: ProjectResourceType[] = [
    "lesson",
    "activities",
    "worksheet",
    "assessment",
  ];
  const presentCore = core.filter((t) => isUsable(present(resources, t)));
  const readyCore = core.filter((t) => isReady(present(resources, t)));
  const score = Math.round(
    (presentCore.length / core.length) * 45 +
      (readyCore.length / core.length) * 55,
  );

  const explanation =
    readyCore.length === core.length
      ? "Core lesson pieces are present and marked ready — the experience can stand on its own."
      : readyCore.length > 0
        ? `${readyCore.length} of ${core.length} core pieces are ready (${readyCore.join(", ")}). Drafts still count as progress — finish what matters most for tomorrow.`
        : presentCore.length > 0
          ? `You have ${presentCore.length} core piece${presentCore.length === 1 ? "" : "s"} started. Marking the lesson spine ready will lift readiness fast.`
          : "The learning experience is still gathering its core pieces (lesson, activity, practice, check).";

  return {
    id: "readiness",
    label: "Lesson readiness",
    score,
    level: levelFromScore(score),
    explanation,
  };
}

function scoreTiming(
  resources: ProjectResource[],
  availableMinutes: number,
): ConfidenceDimension {
  const { total } = estimateExperienceMinutes(resources);
  let score = 100;
  let explanation = `Estimated ~${total} minutes for a ${availableMinutes}-minute window — timing looks kind.`;

  if (total === 0) {
    score = 40;
    explanation =
      "Timing can’t be estimated yet because activity blocks are still empty. Add a few pieces and the clock becomes clear.";
  } else if (total > availableMinutes + 10) {
    score = 35;
    explanation = `Estimated ~${total} minutes — about ${total - availableMinutes} over your ${availableMinutes}-minute window. A small trim will help you feel unhurried.`;
  } else if (total > availableMinutes) {
    score = 60;
    explanation = `Estimated ~${total} minutes — slightly over ${availableMinutes}. One shorter check or optional block would fit the period.`;
  } else if (total < availableMinutes * 0.55) {
    score = 70;
    explanation = `Estimated ~${total} minutes — you may have room for one richer activity inside ${availableMinutes} minutes.`;
  }

  return {
    id: "timing",
    label: "Estimated timing",
    score,
    level: levelFromScore(score),
    explanation,
  };
}

function scoreResources(resources: ProjectResource[]): ConfidenceDimension {
  const pack = present(resources, "resources");
  const teaching = resources.filter(
    (r) =>
      !["blueprint", "notes", "ai_notes", "resources"].includes(r.type) &&
      r.status !== "empty",
  );
  const readyCount = teaching.filter((r) => r.status === "ready").length;
  const draftCount = teaching.filter((r) => r.status === "draft").length;

  let score = Math.round(
    (readyCount / Math.max(teaching.length, 1)) * 70 +
      (draftCount / Math.max(teaching.length, 1)) * 25 +
      (isUsable(pack) || isReady(pack) ? 15 : 0),
  );
  score = Math.min(100, score);

  const missingLabels = teaching
    .filter((r) => r.status === "empty")
    .map((r) => r.label);

  const explanation =
    teaching.length === 0
      ? "No teaching resources are attached yet. Add what you will actually hold in your hands tomorrow."
      : missingLabels.length > 0
        ? `${readyCount} ready, ${draftCount} in draft. Still open: ${missingLabels.slice(0, 3).join(", ")}.`
        : `${readyCount} teaching resource${readyCount === 1 ? "" : "s"} ready — materials look teachable.`;

  return {
    id: "resources",
    label: "Required resources",
    score,
    level: levelFromScore(score),
    explanation,
  };
}

function scoreAssessment(resources: ProjectResource[]): ConfidenceDimension {
  const assessment = present(resources, "assessment");
  let score = 20;
  let explanation =
    "No assessment moment yet. A tiny check (even two questions) makes readiness feel real.";

  if (isReady(assessment)) {
    score = 95;
    explanation = `Assessment is ready (“${assessment!.label}”) — you’ll know what landed before the bell.`;
  } else if (isUsable(assessment)) {
    score = 55;
    explanation = `Assessment exists as a draft (“${assessment!.label}”). Marking it ready — even as a short exit ticket — strengthens coverage.`;
  }

  return {
    id: "assessment",
    label: "Assessment coverage",
    score,
    level: levelFromScore(score),
    explanation,
  };
}

function scoreDifferentiation(
  resources: ProjectResource[],
  intention?: string,
): ConfidenceDimension {
  const activities = present(resources, "activities");
  const worksheet = present(resources, "worksheet");
  const game = present(resources, "game");
  const text = `${intention ?? ""} ${resources.map((r) => r.label).join(" ")}`.toLowerCase();
  const supportSignal = /support|scaffold|differenti|challenge|extension/.test(
    text,
  );

  let score = 25;
  const parts: string[] = [];

  if (isUsable(activities) || isUsable(game)) {
    score += 30;
    parts.push("group / active path");
  }
  if (isUsable(worksheet)) {
    score += 25;
    parts.push("individual practice");
  }
  if (supportSignal || (isUsable(activities) && isUsable(worksheet))) {
    score += 20;
    parts.push("room for different paces");
  }
  score = Math.min(100, score);

  const explanation =
    parts.length === 0
      ? "Differentiation is still light. One collaborative path plus one quieter practice path helps every learner feel invited."
      : `Differentiation signals present: ${parts.join(", ")}. ${
          score >= 80
            ? "Learners can take more than one route."
            : "A support or challenge tweak would make paths clearer."
        }`;

  return {
    id: "differentiation",
    label: "Differentiation",
    score,
    level: levelFromScore(score),
    explanation,
  };
}

function scoreReflection(resources: ProjectResource[]): ConfidenceDimension {
  const reflection =
    present(resources, "reflection") ?? present(resources, "ai_notes");

  let score = 25;
  let explanation =
    "No reflection beat yet. Three calm minutes at the end help students — and you — leave ready.";

  if (isReady(reflection)) {
    score = 95;
    explanation = `Reflection is ready (“${reflection!.label}”) — the experience has a thoughtful close.`;
  } else if (isUsable(reflection)) {
    score = 60;
    explanation = `Reflection is drafted (“${reflection!.label}”). Marking it ready locks in a closing ritual.`;
  }

  return {
    id: "reflection",
    label: "Reflection",
    score,
    level: levelFromScore(score),
    explanation,
  };
}

function buildImprovements(
  dimensions: ConfidenceDimension[],
  resources: ProjectResource[],
  availableMinutes: number,
  estimatedMinutes: number,
): ConfidenceImprovement[] {
  const improvements: ConfidenceImprovement[] = [];
  const byId = Object.fromEntries(
    dimensions.map((d) => [d.id, d]),
  ) as Record<ConfidenceDimensionId, ConfidenceDimension>;

  const lesson = present(resources, "lesson");
  const assessment = present(resources, "assessment");
  const reflection = present(resources, "reflection");
  const activities = present(resources, "activities");
  const worksheet = present(resources, "worksheet");
  const pack = present(resources, "resources");
  const presentation = present(resources, "presentation");

  if (lesson && lesson.status !== "ready") {
    improvements.push({
      id: "imp_ready_lesson",
      actionId: "ready_lesson",
      dimension: "readiness",
      label: "Mark lesson spine ready",
      detail: "One click — confirm the lesson flow is teachable as-is.",
      impactHint: "Boosts lesson readiness",
    });
  }

  if (!isUsable(assessment)) {
    improvements.push({
      id: "imp_add_assessment",
      actionId: "add_short_assessment",
      dimension: "assessment",
      label: "Add a 2-minute exit ticket",
      detail: "Tiny formative check — two prompts, class-level, kind.",
      impactHint: "Boosts assessment coverage",
    });
  } else if (assessment && assessment.status !== "ready") {
    improvements.push({
      id: "imp_ready_assessment",
      actionId: "ready_assessment",
      dimension: "assessment",
      label: "Mark assessment ready",
      detail: `Keep “${assessment.label}” and mark it teachable.`,
      impactHint: "Boosts assessment coverage",
    });
  }

  if (!isUsable(reflection)) {
    improvements.push({
      id: "imp_add_reflection",
      actionId: "add_reflection",
      dimension: "reflection",
      label: "Add a 3-minute reflection",
      detail: "“One thing I learned / one question I still have.”",
      impactHint: "Boosts reflection",
    });
  } else if (reflection && reflection.status !== "ready") {
    improvements.push({
      id: "imp_ready_reflection",
      actionId: "ready_reflection",
      dimension: "reflection",
      label: "Mark reflection ready",
      detail: "Lock in your closing ritual for tomorrow.",
      impactHint: "Boosts reflection",
    });
  }

  if (!isUsable(activities) && byId.differentiation.score < 75) {
    improvements.push({
      id: "imp_add_collab",
      actionId: "add_collaborative_activity",
      dimension: "differentiation",
      label: "Add a pair activity",
      detail: "A short collaborative beat for shared thinking.",
      impactHint: "Boosts differentiation",
    });
  }

  if (
    isUsable(worksheet) &&
    byId.differentiation.score < 80 &&
    !/support|scaffold|challenge/i.test(worksheet?.label ?? "")
  ) {
    improvements.push({
      id: "imp_support",
      actionId: "add_support_path",
      dimension: "differentiation",
      label: "Add support + challenge labels",
      detail: "Rename practice to show two paces — still one worksheet.",
      impactHint: "Boosts differentiation",
    });
  }

  if (pack && pack.status === "empty") {
    improvements.push({
      id: "imp_resources",
      actionId: "ready_resources",
      dimension: "resources",
      label: "Prepare materials checklist",
      detail: "Mark resources ready with a simple “what to bring” list.",
      impactHint: "Boosts required resources",
    });
  }

  if (
    estimatedMinutes > availableMinutes &&
    presentation &&
    presentation.status !== "empty"
  ) {
    improvements.push({
      id: "imp_trim",
      actionId: "trim_optional_block",
      dimension: "timing",
      label: "Make presentation optional",
      detail: "Keep it available, but don’t count it as required time.",
      impactHint: "Eases estimated timing",
    });
  }

  // Prefer lowest dimensions first; max 4 calm actions
  return improvements
    .sort(
      (a, b) =>
        (byId[a.dimension]?.score ?? 100) - (byId[b.dimension]?.score ?? 100),
    )
    .slice(0, 4);
}

function headlineFor(level: ConfidenceLevel): string {
  if (level === "ready") return "You are ready to teach this.";
  if (level === "almost") return "Almost there — a small step will get you ready.";
  return "This experience is building — small steps will get you ready.";
}

/**
 * Confidence Engine — scores learning-experience readiness only.
 * Never scores teacher quality.
 */
export function analyzeConfidence(input: ConfidenceInput): ConfidenceReport {
  const availableMinutes = input.availableMinutes ?? 45;
  const { total: estimatedMinutes } = estimateExperienceMinutes(
    input.resources,
  );

  const dimensions: ConfidenceDimension[] = [
    scoreReadiness(input.resources),
    scoreTiming(input.resources, availableMinutes),
    scoreResources(input.resources),
    scoreAssessment(input.resources),
    scoreDifferentiation(input.resources, input.intention),
    scoreReflection(input.resources),
  ];

  const weights: Record<ConfidenceDimensionId, number> = {
    readiness: 0.28,
    timing: 0.14,
    resources: 0.16,
    assessment: 0.16,
    differentiation: 0.14,
    reflection: 0.12,
  };

  const score = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * weights[d.id], 0),
  );
  const level = levelFromScore(score);

  return {
    score,
    level,
    headline: headlineFor(level),
    reassurance:
      "This number is lesson readiness — never a judgment of you as a teacher.",
    dimensions,
    improvements: buildImprovements(
      dimensions,
      input.resources,
      availableMinutes,
      estimatedMinutes,
    ),
    estimatedMinutes,
    availableMinutes,
    analyzedAt: new Date().toISOString(),
  };
}

export type { ConfidenceActionId };
