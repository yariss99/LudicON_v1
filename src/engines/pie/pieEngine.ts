import {
  analyzeCognitiveLoad,
  analyzeTime,
  buildRecommendations,
  scoreAssessment,
  scoreCurriculumAlignment,
  scoreDifferentiation,
  scoreEngagement,
  scoreInclusion,
  scoreLessonFlow,
  scorePedagogicalCoherence,
  scoreResources,
} from "./dimensions";
import { fingerprintPieInput } from "./fingerprint";
import type {
  PieAnalysisInput,
  PieAnalysisReport,
  PieChangeEvent,
  PieDimensionId,
  PieDimensionScore,
} from "./types";
import { PIE_DIMENSION_IDS } from "./types";

export const PIE_SCHEMA_VERSION = "1.0.0";

const DEFAULT_WEIGHTS: Record<PieDimensionId, number> = {
  curriculum_alignment: 1.2,
  pedagogical_coherence: 1.3,
  cognitive_load: 1,
  lesson_flow: 1.1,
  student_engagement: 1,
  differentiation: 1.1,
  assessment_quality: 1.2,
  inclusion_accessibility: 1,
  time_validation: 1.1,
  resource_optimization: 0.8,
};

function clamp(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function overallFrom(dimensions: PieDimensionScore[]): number {
  let sum = 0;
  let w = 0;
  for (const dim of dimensions) {
    const weight = DEFAULT_WEIGHTS[dim.dimension] ?? 1;
    sum += dim.score * weight;
    w += weight;
  }
  return clamp(sum / (w || 1));
}

function improvementFocus(dimensions: PieDimensionScore[]): PieDimensionId[] {
  return [...dimensions]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((d) => d.dimension);
}

/**
 * Analyze a lesson design snapshot.
 * Pure function — does not mutate input, does not call LLMs.
 */
export function analyzeLessonDesign(
  input: PieAnalysisInput,
): PieAnalysisReport {
  const curriculum = scoreCurriculumAlignment(input);
  const coherence = scorePedagogicalCoherence(input);
  const cognitive = analyzeCognitiveLoad(input);
  const flow = scoreLessonFlow(input);
  const engagement = scoreEngagement(input);
  const differentiation = scoreDifferentiation(input);
  const assessment = scoreAssessment(input);
  const inclusion = scoreInclusion(input);
  const time = analyzeTime(input);
  const resources = scoreResources(input);

  const dimensions: PieDimensionScore[] = [
    curriculum,
    coherence,
    cognitive.score,
    flow,
    engagement,
    differentiation,
    assessment,
    inclusion,
    time.score,
    resources,
  ];

  // Ensure all 10 dimensions are present
  const present = new Set(dimensions.map((d) => d.dimension));
  for (const id of PIE_DIMENSION_IDS) {
    if (!present.has(id)) {
      dimensions.push({
        dimension: id,
        score: 50,
        summary: "Dimensiune fără semnale suficiente.",
        evidence: [],
      });
    }
  }

  const recommendations = buildRecommendations(
    input,
    dimensions,
    cognitive.detail,
    time.detail,
  );

  const overall = overallFrom(dimensions);

  return {
    schemaVersion: PIE_SCHEMA_VERSION,
    analyzedAt: new Date().toISOString(),
    lessonProjectId: input.lessonProjectId,
    inputFingerprint: fingerprintPieInput(input),
    scorecard: {
      overall,
      dimensions,
      estimatedTeachingMinutes: time.detail.estimatedLessonDuration,
      improvementFocus: improvementFocus(dimensions),
    },
    cognitiveLoad: cognitive.detail,
    time: time.detail,
    recommendations,
    knowledgePackVersions: input.curriculumVersion
      ? [input.curriculumVersion]
      : ["prima-framework/1.0"],
    notes: [
      "Scores support improvement only — never teacher evaluation.",
      `Cognitive load band: ${cognitive.detail.band}`,
    ],
  };
}

/**
 * Re-analyze after a teacher edit. MVP: full recompute (debouncing belongs to UI).
 */
export function reanalyzeOnChange(
  input: PieAnalysisInput,
  _change: PieChangeEvent,
): PieAnalysisReport {
  const report = analyzeLessonDesign(input);
  return {
    ...report,
    notes: [
      ...report.notes,
      `Triggered by: ${_change.kind}${_change.component ? ` (${_change.component})` : ""}`,
    ],
  };
}

/**
 * Lightweight object-level analysis — uses lesson context when provided.
 * Full POM block analysis is a follow-on sprint.
 */
export function analyzePedagogicalObject(input: {
  objectId: string;
  objectType: string;
  title: string;
  linkedObjectiveIds?: string[];
  lesson?: PieAnalysisInput;
}): PieAnalysisReport {
  if (input.lesson) {
    const base = analyzeLessonDesign(input.lesson);
    return {
      ...base,
      notes: [
        ...base.notes,
        `Object focus: ${input.objectType} (${input.objectId})`,
      ],
    };
  }

  return analyzeLessonDesign({
    lessonProjectId: `object:${input.objectId}`,
    title: input.title,
    subject: "",
    grade: "",
    availableMinutes: 45,
    competencies: [],
    learningObjectives: input.linkedObjectiveIds ?? [],
    learningFlow: [],
    activities: [],
    assessment: [],
    resources: [
      {
        id: input.objectId,
        label: input.title,
        objectType: input.objectType,
        linkedObjectiveIds: input.linkedObjectiveIds,
      },
    ],
    differentiation: [],
    reflection: [],
    language: "ro",
  });
}

export const pedagogicalIntelligenceEngine = {
  analyzeLessonDesign,
  reanalyzeOnChange,
  analyzePedagogicalObject,
};
