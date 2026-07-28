import type { ProjectResource, ProjectResourceType } from "../../types/project";
import type {
  AssessmentSignals,
  BalanceSignals,
  DifferentiationSignals,
  PedagogicalStage,
  StagePresence,
} from "../../types/pedagogy";

const PRESENT: ProjectResource["status"][] = ["ready", "draft"];

function hasType(
  resources: ProjectResource[],
  types: ProjectResourceType | ProjectResourceType[],
): ProjectResource[] {
  const set = new Set(Array.isArray(types) ? types : [types]);
  return resources.filter(
    (r) => set.has(r.type) && PRESENT.includes(r.status),
  );
}

function corpus(resources: ProjectResource[], intention?: string): string {
  return [
    intention ?? "",
    ...resources.map((r) => `${r.label} ${r.type}`),
  ]
    .join(" ")
    .toLowerCase();
}

/** Map resource types → educational stages they can evidence */
const STAGE_EVIDENCE: Record<PedagogicalStage, ProjectResourceType[]> = {
  attention: ["presentation", "game", "lesson"],
  discovery: ["activities", "game", "lesson"],
  practice: ["worksheet", "activities", "game"],
  reflection: ["reflection", "notes", "ai_notes"],
  assessment: ["assessment"],
};

export function detectStages(
  resources: ProjectResource[],
): StagePresence[] {
  return (Object.keys(STAGE_EVIDENCE) as PedagogicalStage[]).map((stage) => {
    const evidenceTypes = STAGE_EVIDENCE[stage];
    const hits = hasType(resources, evidenceTypes);
    return {
      stage,
      present: hits.length > 0,
      evidence: hits.map((h) => h.label),
    };
  });
}

export function detectBalance(resources: ProjectResource[]): BalanceSignals {
  const active = resources.filter((r) =>
    PRESENT.includes(r.status) &&
    (r.type === "activities" || r.type === "game"),
  ).length;
  const worksheets = resources.filter(
    (r) => PRESENT.includes(r.status) && r.type === "worksheet",
  ).length;
  const lecture = resources.filter(
    (r) =>
      PRESENT.includes(r.status) &&
      (r.type === "presentation" || r.type === "lesson"),
  ).length;
  const digital = resources.filter(
    (r) =>
      PRESENT.includes(r.status) &&
      (r.type === "game" || r.type === "presentation"),
  ).length;
  const individual = worksheets;
  const totalPresent = resources.filter((r) =>
    PRESENT.includes(r.status),
  ).length || 1;

  const scores = {
    lecture: lecture / totalPresent,
    worksheet: worksheets / totalPresent,
    individual: individual / totalPresent,
    digital: digital / totalPresent,
    active: active / totalPresent,
  };

  return {
    lectureHeavy: lecture >= 2 && active === 0,
    worksheetHeavy: worksheets >= 1 && active === 0 && lecture === 0,
    individualHeavy: individual >= 1 && active === 0,
    digitalHeavy: digital >= 2 && active === 0 && worksheets === 0,
    fewActiveMoments: active === 0 && totalPresent >= 2,
    scores,
  };
}

export function detectDifferentiation(
  resources: ProjectResource[],
  intention?: string,
): DifferentiationSignals {
  const text = corpus(resources, intention);
  const hasAdvancedPath =
    /advanced|challenge|extension|gifted|mai (?:avansat|rapid)/.test(text) ||
    (hasType(resources, "game").length > 0 &&
      hasType(resources, "worksheet").length > 0);
  const hasSupportPath =
    /support|scaffold|differenti|ajutor|sprijin|adapted|simplify/.test(text) ||
    (hasType(resources, "activities").length > 0 &&
      hasType(resources, "worksheet").length > 0);
  const hasGroupWork =
    hasType(resources, ["activities", "game"]).length > 0 ||
    /group|pair|echip|collabor/.test(text);
  const hasIndividualWork =
    hasType(resources, "worksheet").length > 0 ||
    /individual|independent/.test(text);

  return {
    hasAdvancedPath,
    hasSupportPath,
    hasGroupWork,
    hasIndividualWork,
  };
}

export function detectAssessment(
  resources: ProjectResource[],
  intention?: string,
): AssessmentSignals {
  const text = corpus(resources, intention);
  const assessments = hasType(resources, "assessment");
  const hasFormative =
    assessments.length > 0 ||
    /formative|exit ticket|check.?in|quick check|observ/.test(text);
  const hasSummative =
    /summative|test|quiz|evaluare final|end.?of/.test(text) ||
    assessments.some((a) => /test|quiz|summative|final/i.test(a.label));
  const hasReflection = hasType(resources, [
    "reflection",
    "notes",
    "ai_notes",
  ]).length > 0;
  const hasFeedbackMoment =
    hasReflection ||
    /feedback|peer|share|celebrate/.test(text) ||
    hasType(resources, "activities").length > 0;

  return {
    hasFormative,
    hasSummative,
    hasReflection,
    hasFeedbackMoment,
  };
}
