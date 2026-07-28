import { SLI_SEED_META } from "./seed";
import type {
  ClassDashboardSnapshot,
  ClassInsightCard,
  DifferentiationSuggestion,
  EarlySupportIndicator,
  LearnerProfile,
  LearningEvidence,
  LearnerAlias,
  MisconceptionPattern,
  PieInstructionalHandoff,
  TeacherObservation,
} from "./types";

const MISCONCEPTION_CATALOG: Record<
  string,
  { titleRo: string; descriptionRo: string; actions: string[] }
> = {
  perimeter_vs_area: {
    titleRo: "Confuzie perimetru ↔ arie",
    descriptionRo:
      "Elevii amestecă lungimea conturului cu măsura suprafeței.",
    actions: [
      "Activitate de practică ghidată",
      "Model vizual (gard vs. iarbă)",
      "Material manipulativ",
      "Explicație alternativă",
      "Fișă remedială scurtă",
    ],
  },
};

export function buildLearnerProfile(
  alias: LearnerAlias,
  evidence: LearningEvidence[],
  observations: TeacherObservation[],
): LearnerProfile {
  const mine = evidence.filter((e) => e.learnerId === alias.id);
  const obs = observations.filter((o) => o.learnerId === alias.id);
  const strengths = [
    ...mine.filter((e) => e.strengthSignal).map((e) => e.summary),
    ...obs.filter((o) => /excelent|bun|îmbunăt/i.test(o.note)).map((o) => o.note),
  ].slice(0, 5);
  const needs = [
    ...mine.filter((e) => e.needSignal).map((e) => e.summary),
    ...obs.filter((o) => /nevoie|necesită|sprijin|practică/i.test(o.note)).map((o) => o.note),
  ].slice(0, 5);
  const misconceptionTags = [
    ...new Set(
      mine.map((e) => e.misconceptionTag).filter((t): t is string => Boolean(t)),
    ),
  ];
  const preferredActivityTypes = [
    ...new Set(
      mine
        .filter((e) => e.strengthSignal)
        .map((e) => e.source)
        .concat(
          obs
            .filter((o) => /colabor/i.test(o.note))
            .map(() => "peer_activity" as const),
        ),
    ),
  ];

  let supportNeed: LearnerProfile["supportNeed"] = "none";
  if (misconceptionTags.length >= 1 || needs.length >= 2) supportNeed = "support";
  else if (needs.length === 1) supportNeed = "watch";
  if (strengths.length >= 2 && needs.length === 0) supportNeed = "enrichment";

  return {
    learnerId: alias.id,
    alias,
    strengths,
    needs,
    preferredActivityTypes,
    participationNotes: obs.map((o) => o.note).slice(0, 5),
    misconceptionTags,
    supportStrategies: obs.flatMap((o) => o.tags).slice(0, 5),
    supportNeed,
    updatedAt: new Date().toISOString(),
    evaluationForbidden: true,
  };
}

export function detectMisconceptions(
  evidence: LearningEvidence[],
): MisconceptionPattern[] {
  const buckets = new Map<string, Set<string>>();
  for (const e of evidence) {
    if (!e.misconceptionTag) continue;
    const set = buckets.get(e.misconceptionTag) ?? new Set();
    set.add(e.learnerId);
    buckets.set(e.misconceptionTag, set);
  }

  return [...buckets.entries()].map(([tag, learners]) => {
    const catalog = MISCONCEPTION_CATALOG[tag] ?? {
      titleRo: tag,
      descriptionRo: "Dificultate de învățare observată în evidențe.",
      actions: ["Practică suplimentară", "Explicație alternativă"],
    };
    return {
      id: `misc_${tag}`,
      tag,
      titleRo: catalog.titleRo,
      descriptionRo: catalog.descriptionRo,
      learnerCount: learners.size,
      suggestedActions: catalog.actions,
    };
  });
}

export function buildDifferentiationSuggestions(
  profiles: LearnerProfile[],
  misconceptions: MisconceptionPattern[],
): DifferentiationSuggestion[] {
  const suggestions: DifferentiationSuggestion[] = [];

  const supportIds = profiles
    .filter((p) => p.supportNeed === "support" || p.supportNeed === "watch")
    .map((p) => p.learnerId);
  if (supportIds.length) {
    suggestions.push({
      id: "diff_support_group",
      kind: "support_group",
      titleRo: "Grup de sprijin scurt",
      rationaleRo:
        "Câțiva elevi au nevoie de clarificare înainte de practica independentă.",
      learnerIds: supportIds,
      status: "pending",
    });
  }

  const enrichIds = profiles
    .filter((p) => p.supportNeed === "enrichment")
    .map((p) => p.learnerId);
  if (enrichIds.length) {
    suggestions.push({
      id: "diff_extension",
      kind: "extension",
      titleRo: "Activitate de extensie",
      rationaleRo:
        "Există elevi gata de provocări suplimentare pe aceeași temă.",
      learnerIds: enrichIds,
      status: "pending",
    });
  }

  for (const m of misconceptions) {
    suggestions.push({
      id: `diff_misc_${m.tag}`,
      kind: "alternative_explanation",
      titleRo: `Explicație alternativă — ${m.titleRo}`,
      rationaleRo: m.descriptionRo,
      learnerIds: profiles
        .filter((p) => p.misconceptionTags.includes(m.tag))
        .map((p) => p.learnerId),
      status: "pending",
      relatedMisconceptionId: m.id,
    });
    suggestions.push({
      id: `diff_practice_${m.tag}`,
      kind: "additional_practice",
      titleRo: "Fișă remedială scurtă",
      rationaleRo: "Practica ghidată reduce confuzia recurentă.",
      learnerIds: profiles
        .filter((p) => p.misconceptionTags.includes(m.tag))
        .map((p) => p.learnerId),
      status: "pending",
      relatedMisconceptionId: m.id,
    });
  }

  return suggestions;
}

export function buildClassInsights(
  evidence: LearningEvidence[],
  misconceptions: MisconceptionPattern[],
): ClassInsightCard[] {
  const insights: ClassInsightCard[] = [];
  const objEvidence = evidence.filter((e) =>
    e.objectiveIds.includes("obj_equiv"),
  );
  const strengths = objEvidence.filter((e) => e.strengthSignal).length;
  if (objEvidence.length) {
    insights.push({
      id: "ins_obj_equiv",
      titleRo: "Obiectivul de echivalență arată progres la majoritatea elevilor",
      detailRo: `${strengths} evidențe de reușită din ${objEvidence.length} înregistrări pe acest obiectiv.`,
      evidenceCount: objEvidence.length,
      descriptiveOnly: true,
    });
  }

  const coop = evidence.filter((e) => e.source === "interactive" || e.source === "peer_activity");
  if (coop.some((e) => e.strengthSignal)) {
    insights.push({
      id: "ins_collab",
      titleRo: "Activitățile cooperative au crescut participarea",
      detailRo:
        "Evidențele de tip interactiv/perechi conțin semnale de implicare pozitivă.",
      evidenceCount: coop.length,
      descriptiveOnly: true,
    });
  }

  if (misconceptions.length) {
    insights.push({
      id: "ins_misc",
      titleRo: "Apar dificultăți recurente pe măsurători",
      detailRo:
        "Mai mulți elevi au evidențe legate de aceeași confuzie — util pentru redesenarea lecției.",
      evidenceCount: misconceptions.reduce((s, m) => s + m.learnerCount, 0),
      descriptiveOnly: true,
    });
  }

  return insights;
}

export function buildEarlySupportIndicators(
  profiles: LearnerProfile[],
  evidence: LearningEvidence[],
): EarlySupportIndicator[] {
  const indicators: EarlySupportIndicator[] = [];

  for (const profile of profiles) {
    const mine = evidence.filter((e) => e.learnerId === profile.learnerId);
    const miscCount = mine.filter((e) => e.misconceptionTag).length;
    if (miscCount >= 2) {
      indicators.push({
        id: `esi_misc_${profile.learnerId}`,
        kind: "repeated_misconception",
        learnerId: profile.learnerId,
        titleRo: "Aceeași dificultate apare din nou",
        instructionalSuggestionRo:
          "Oferă un model vizual și o practică ghidată scurtă la următoarea oră.",
        nonLabeling: true,
      });
    }
    if (mine.some((e) => e.source === "homework" && e.needSignal)) {
      indicators.push({
        id: `esi_hw_${profile.learnerId}`,
        kind: "incomplete_work",
        learnerId: profile.learnerId,
        titleRo: "Temă incompletă observată",
        instructionalSuggestionRo:
          "Verifică dacă volumul temei este realist; oferă o variantă scurtată.",
        nonLabeling: true,
      });
    }
  }

  return indicators;
}

export function buildClassDashboard(
  classId: string,
  learners: LearnerAlias[],
  evidence: LearningEvidence[],
  observations: TeacherObservation[],
): {
  dashboard: ClassDashboardSnapshot;
  profiles: LearnerProfile[];
  suggestions: DifferentiationSuggestion[];
  earlySupport: EarlySupportIndicator[];
  pieHandoff: PieInstructionalHandoff | null;
} {
  const classLearners = learners.filter((l) => l.classId === classId);
  const profiles = classLearners.map((a) =>
    buildLearnerProfile(a, evidence, observations),
  );
  const misconceptions = detectMisconceptions(evidence);
  const suggestions = buildDifferentiationSuggestions(profiles, misconceptions);
  const insights = buildClassInsights(evidence, misconceptions);
  const earlySupport = buildEarlySupportIndicators(profiles, evidence);

  const objectives = SLI_SEED_META.objectives.map((obj) => {
    const related = evidence.filter((e) => e.objectiveIds.includes(obj.id));
    const strength = related.filter((e) => e.strengthSignal).length;
    const share =
      related.length === 0 ? 0 : Math.round((strength / related.length) * 100);
    return {
      objectiveId: obj.id,
      labelRo: obj.labelRo,
      achievedApproxShare: share,
      evidenceCount: related.length,
    };
  });

  const competencies = SLI_SEED_META.competencies.map((comp) => {
    const related = evidence.filter((e) => e.competencyIds.includes(comp.id));
    const learnersWith = new Set(related.map((e) => e.learnerId)).size;
    const needs =
      related.filter((e) => e.needSignal).length >=
      Math.max(1, related.length / 2);
    return {
      competencyId: comp.id,
      labelRo: comp.labelRo,
      evidenceCount: related.length,
      learnersWithEvidence: learnersWith,
      needsReinforcement: needs,
    };
  });

  const dashboard: ClassDashboardSnapshot = {
    classId,
    lessonProjectId: SLI_SEED_META.lessonProjectId,
    lessonTitle: SLI_SEED_META.lessonTitle,
    objectives,
    competencies,
    misconceptions,
    needingSupport: profiles
      .filter((p) => p.supportNeed === "support" || p.supportNeed === "watch")
      .map((p) => p.learnerId),
    readyForEnrichment: profiles
      .filter((p) => p.supportNeed === "enrichment")
      .map((p) => p.learnerId),
    insights,
    rankingForbidden: true,
  };

  const hardObjective = objectives.find((o) => o.achievedApproxShare < 50);
  const pieHandoff: PieInstructionalHandoff | null = misconceptions.length
    ? {
        focusSection: "activities",
        noteRo:
          "Mulți elevi au dificultăți pe aceeași idee — merită redesenarea activității și o evaluare alternativă.",
        relatedObjectiveIds: hardObjective
          ? [hardObjective.objectiveId]
          : objectives.map((o) => o.objectiveId),
        misconceptionTags: misconceptions.map((m) => m.tag),
      }
    : hardObjective
      ? {
          focusSection: "assessment",
          noteRo: `Obiectivul „${hardObjective.labelRo}” are puține evidențe de reușită — verifică activitățile și evaluarea.`,
          relatedObjectiveIds: [hardObjective.objectiveId],
          misconceptionTags: [],
        }
      : null;

  return { dashboard, profiles, suggestions, earlySupport, pieHandoff };
}
