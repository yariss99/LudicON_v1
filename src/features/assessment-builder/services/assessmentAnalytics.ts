import type {
  AssessmentAnalytics,
  AssessmentDocument,
  BloomLevel,
  DifficultyLevel,
} from "../types";

const BLOOM: BloomLevel[] = [
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
];

const DIFF: DifficultyLevel[] = ["easy", "medium", "hard"];

export function computeAssessmentAnalytics(
  doc: AssessmentDocument,
): AssessmentAnalytics {
  const questions = doc.groups.flatMap((g) => g.questions);
  const difficultyDistribution = Object.fromEntries(
    DIFF.map((d) => [d, 0]),
  ) as Record<DifficultyLevel, number>;
  const bloomDistribution = Object.fromEntries(
    BLOOM.map((b) => [b, 0]),
  ) as Record<BloomLevel, number>;

  for (const q of questions) {
    difficultyDistribution[q.difficulty] += 1;
    bloomDistribution[q.bloom] += 1;
  }

  const competencyMap = new Map<string, number>();
  for (const q of questions) {
    for (const c of q.competencyIds) {
      competencyMap.set(c, (competencyMap.get(c) ?? 0) + 1);
    }
  }
  for (const c of doc.competencies) {
    if (!competencyMap.has(c)) competencyMap.set(c, 0);
  }

  const estimatedSeconds = questions.reduce(
    (sum, q) => sum + (q.estimatedSeconds || 60),
    0,
  );
  const estimatedMinutes = Math.max(
    1,
    Math.round(estimatedSeconds / 60) || doc.durationMinutes || 1,
  );

  const easy = difficultyDistribution.easy;
  const medium = difficultyDistribution.medium;
  const hard = difficultyDistribution.hard;
  const total = questions.length || 1;
  const estimatedSuccessRate = Math.round(
    Math.min(
      95,
      Math.max(
        35,
        (easy * 0.85 + medium * 0.65 + hard * 0.4) / total * 100,
      ),
    ),
  );

  const bloomUsed = BLOOM.filter((b) => bloomDistribution[b] > 0).length;
  const coveredCompetencies = [...competencyMap.values()].filter(
    (n) => n > 0,
  ).length;
  const qualityScore = Math.round(
    Math.min(
      100,
      (questions.length > 0 ? 25 : 0) +
        bloomUsed * 8 +
        coveredCompetencies * 6 +
        (doc.objectives.length > 0 ? 10 : 0) +
        (doc.rubrics.length > 0 || doc.scoring.mode === "automatic" ? 10 : 0) +
        (Math.abs(estimatedMinutes - doc.durationMinutes) <= 5 ? 10 : 0),
    ),
  );

  return {
    difficultyDistribution,
    bloomDistribution,
    competencyCoverage: [...competencyMap.entries()].map(
      ([competency, questionCount]) => ({ competency, questionCount }),
    ),
    estimatedMinutes,
    estimatedSuccessRate,
    qualityScore,
    totalQuestions: questions.length,
  };
}
