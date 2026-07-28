import {
  deriveInsights,
  recommendationsFromInsights,
} from "./insights";
import { celebrateMilestone, evaluateMilestones } from "./milestones";
import { promptsForMode } from "./prompts";
import { rptiStore } from "./store";
import type {
  GrowthProfile,
  LessonComparisonView,
  PersonalAnalyticsSnapshot,
  PortfolioEntry,
  ReflectionAnswer,
  ReflectionMode,
  ReflectionRecord,
} from "./types";

export const RPTI_SCHEMA_VERSION = "1.0.0";

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function startReflection(input: {
  lessonProjectId: string;
  lessonTitle: string;
  mode: ReflectionMode;
  publicationId?: string;
}): ReflectionRecord {
  const now = new Date().toISOString();
  const record: ReflectionRecord = {
    id: uid("ref"),
    schemaVersion: RPTI_SCHEMA_VERSION,
    lessonProjectId: input.lessonProjectId,
    lessonTitle: input.lessonTitle,
    publicationId: input.publicationId,
    mode: input.mode,
    status: "in_progress",
    createdAt: now,
    updatedAt: now,
    answers: [],
    strengths: [],
    improvements: [],
    personalNotes: "",
    followUpActions: [],
    shareDecision: "private",
    private: true,
  };
  rptiStore.saveReflection(record);
  return record;
}

export function updateReflection(
  id: string,
  patch: Partial<
    Pick<
      ReflectionRecord,
      | "answers"
      | "strengths"
      | "improvements"
      | "personalNotes"
      | "followUpActions"
      | "shareDecision"
      | "status"
    >
  >,
): ReflectionRecord | null {
  const current = rptiStore.getReflection(id);
  if (!current) return null;
  const next: ReflectionRecord = {
    ...current,
    ...patch,
    private: true,
    updatedAt: new Date().toISOString(),
  };
  rptiStore.saveReflection(next);
  return next;
}

export function completeReflection(
  id: string,
  input: {
    answers: ReflectionAnswer[];
    strengths?: string[];
    improvements?: string[];
    personalNotes?: string;
    followUpActions?: string[];
  },
): ReflectionRecord | null {
  const current = rptiStore.getReflection(id);
  if (!current) return null;
  const now = new Date().toISOString();
  const completed: ReflectionRecord = {
    ...current,
    answers: input.answers,
    strengths: input.strengths ?? current.strengths,
    improvements: input.improvements ?? current.improvements,
    personalNotes: input.personalNotes ?? current.personalNotes,
    followUpActions: input.followUpActions ?? current.followUpActions,
    status: "completed",
    completedAt: now,
    updatedAt: now,
    shareDecision: "private",
    private: true,
  };
  rptiStore.saveReflection(completed);

  const profile = refreshGrowthProfile("teacher_local", completed);
  syncPortfolioFromReflection(completed);
  const milestones = evaluateMilestones(
    rptiStore.listReflections(),
    rptiStore.listMilestones(),
  );
  rptiStore.saveMilestones(milestones);
  void profile;
  return completed;
}

export function refreshGrowthProfile(
  teacherId: string,
  latest?: ReflectionRecord,
): GrowthProfile {
  const reflections = rptiStore
    .listReflections()
    .filter((r) => r.status === "completed");
  const strategies = new Set<string>();
  const assessments = new Set<string>();
  let diff = 0;
  let digital = 0;
  let engagementSum = 0;
  let engagementN = 0;

  for (const r of reflections) {
    for (const a of r.answers) {
      if (a.promptId === "engagement_peak" && a.value.trim()) {
        strategies.add("activități cu implicare ridicată");
      }
      if (a.promptId === "assessment_fit") assessments.add("evaluare reflectată");
      if (a.promptId === "differentiation" && a.value.trim()) diff += 1;
      if (a.promptId === "digital" && /da|util|sprijin/i.test(a.value)) {
        digital += 1;
      }
      if (a.rating != null) {
        engagementSum += a.rating;
        engagementN += 1;
      }
    }
    for (const s of r.strengths) {
      if (/colabor|grup|joc|digital|diferenț/i.test(s)) strategies.add(s.slice(0, 40));
    }
  }

  if (latest?.mode) strategies.add(`mod reflecție: ${latest.mode}`);

  const profile: GrowthProfile = {
    teacherId,
    updatedAt: new Date().toISOString(),
    strategiesUsed: [...strategies].slice(0, 20),
    assessmentMethods: [...assessments],
    differentiationFrequency: reflections.length
      ? diff / reflections.length
      : 0,
    digitalIntegrationFrequency: reflections.length
      ? digital / reflections.length
      : 0,
    reflectionCount: reflections.length,
    completedLessonCount: new Set(reflections.map((r) => r.lessonProjectId))
      .size,
    professionalGoals: rptiStore.getProfile(teacherId).professionalGoals,
    averageSelfRatedEngagement:
      engagementN > 0 ? engagementSum / engagementN : undefined,
    evaluationForbidden: true,
  };
  rptiStore.saveProfile(profile);
  return profile;
}

function syncPortfolioFromReflection(record: ReflectionRecord): void {
  const entry: PortfolioEntry = {
    id: uid("pf"),
    kind: "reflection_note",
    title: `Reflecție · ${record.lessonTitle}`,
    createdAt: record.completedAt ?? record.updatedAt,
    lessonProjectId: record.lessonProjectId,
    reflectionId: record.id,
    publicationId: record.publicationId,
    notes: record.personalNotes || record.strengths.join("; "),
    editable: true,
    shareDecision: record.shareDecision,
  };
  rptiStore.savePortfolioEntry(entry);

  rptiStore.savePortfolioEntry({
    id: `pf_lesson_${record.lessonProjectId}`,
    kind: "lesson_design",
    title: record.lessonTitle,
    createdAt: record.createdAt,
    lessonProjectId: record.lessonProjectId,
    notes: "Proiect de lecție legat de reflecție",
    editable: true,
    shareDecision: "private",
  });
}

export function compareLessons(
  leftId: string,
  rightId: string,
): LessonComparisonView | null {
  const all = rptiStore.listReflections().filter((r) => r.status === "completed");
  const left = all.find((r) => r.lessonProjectId === leftId) ?? all.find((r) => r.id === leftId);
  const right =
    all.find((r) => r.lessonProjectId === rightId) ?? all.find((r) => r.id === rightId);
  if (!left || !right) return null;

  const pick = (r: ReflectionRecord, promptId: string) =>
    r.answers.find((a) => a.promptId === promptId)?.value || "—";

  return {
    leftLessonId: left.lessonProjectId,
    rightLessonId: right.lessonProjectId,
    dimensions: [
      {
        id: "timing",
        labelRo: "Timp",
        leftSummary: pick(left, "timing"),
        rightSummary: pick(right, "timing"),
      },
      {
        id: "engagement",
        labelRo: "Implicare",
        leftSummary: pick(left, "engagement_peak"),
        rightSummary: pick(right, "engagement_peak"),
      },
      {
        id: "assessment",
        labelRo: "Evaluare",
        leftSummary: pick(left, "assessment_fit"),
        rightSummary: pick(right, "assessment_fit"),
      },
      {
        id: "strategy",
        labelRo: "Ce aș schimba",
        leftSummary: pick(left, "change_next"),
        rightSummary: pick(right, "change_next"),
      },
      {
        id: "strengths",
        labelRo: "Puncte tari",
        leftSummary: left.strengths.join("; ") || "—",
        rightSummary: right.strengths.join("; ") || "—",
      },
    ],
  };
}

export function personalAnalytics(): PersonalAnalyticsSnapshot {
  const completed = rptiStore
    .listReflections()
    .filter((r) => r.status === "completed");
  const months = Array.from({ length: 6 }, () => 0);
  const now = new Date();
  for (const r of completed) {
    const d = new Date(r.completedAt ?? r.updatedAt);
    const diff =
      (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (diff >= 0 && diff < 6) months[5 - diff] += 1;
  }

  const profile = rptiStore.getProfile("teacher_local");
  return {
    strategyDiversity: profile.strategiesUsed.length,
    assessmentBalance: profile.assessmentMethods.length > 0 ? 1 : 0,
    reflectionFrequency: completed.length,
    resourceReuse: profile.digitalIntegrationFrequency,
    monthlyReflectionCounts: months,
  };
}

export function buildInsightsBundle() {
  const reflections = rptiStore.listReflections();
  const insights = deriveInsights(reflections);
  const recommendations = recommendationsFromInsights(insights);
  return { insights, recommendations };
}

export function applyRecommendationHandoff(recommendationId: string): {
  focusSection: string;
  note: string;
} | null {
  const { recommendations } = buildInsightsBundle();
  const rec = recommendations.find((r) => r.id === recommendationId);
  return rec?.applyToFutureLesson ?? null;
}

export const reflectivePracticeEngine = {
  promptsForMode,
  startReflection,
  updateReflection,
  completeReflection,
  listReflections: () => rptiStore.listReflections(),
  getGrowthProfile: () => rptiStore.getProfile("teacher_local"),
  listPortfolio: () => rptiStore.listPortfolio(),
  listMilestones: () => rptiStore.listMilestones(),
  celebrateMilestone: (id: string) => {
    const next = celebrateMilestone(rptiStore.listMilestones(), id);
    rptiStore.saveMilestones(next);
    return next;
  },
  buildInsightsBundle,
  compareLessons,
  personalAnalytics,
  applyRecommendationHandoff,
  refreshGrowthProfile,
};
