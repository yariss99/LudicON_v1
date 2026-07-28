/**
 * FEATURE-003 — Pedagogical Intelligence Engine (PIE) contracts.
 * Analysis & recommendations only. Never mutates lesson authority.
 */

export const PRIMA_PIE_SCHEMA_VERSION = '1.0.0';

export type PieDimensionId =
  | 'curriculum_alignment'
  | 'pedagogical_coherence'
  | 'cognitive_load'
  | 'lesson_flow'
  | 'student_engagement'
  | 'differentiation'
  | 'assessment_quality'
  | 'inclusion_accessibility'
  | 'time_validation'
  | 'resource_optimization';

export const PIE_DIMENSION_IDS: readonly PieDimensionId[] = [
  'curriculum_alignment',
  'pedagogical_coherence',
  'cognitive_load',
  'lesson_flow',
  'student_engagement',
  'differentiation',
  'assessment_quality',
  'inclusion_accessibility',
  'time_validation',
  'resource_optimization',
] as const;

export type CognitiveLoadBand = 'balanced' | 'needs_simplification' | 'needs_extension';

export type PieRecommendationPriority =
  | 'critical'
  | 'important'
  | 'optional'
  | 'inspirational';

export type PieLessonComponent =
  | 'competencies'
  | 'objectives'
  | 'learning_flow'
  | 'activities'
  | 'assessment'
  | 'resources'
  | 'differentiation'
  | 'reflection'
  | 'timing'
  | 'strategy'
  | 'pedagogical_object';

export type PieChangeKind =
  | 'objective_removed'
  | 'objective_added'
  | 'duration_changed'
  | 'activity_changed'
  | 'assessment_changed'
  | 'resource_changed'
  | 'differentiation_changed'
  | 'strategy_changed'
  | 'generic_edit';

export interface PieActivityView {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly durationMinutes?: number;
  readonly phase?: string;
  readonly collaborative?: boolean;
  readonly practical?: boolean;
}

export interface PieResourceRef {
  readonly id: string;
  readonly label: string;
  readonly objectType?: string;
  readonly linkedObjectiveIds?: readonly string[];
}

export interface PieAnalysisInput {
  readonly lessonProjectId: string;
  readonly title: string;
  readonly subject: string;
  readonly grade: string;
  readonly availableMinutes: number;
  readonly teachingStrategy?: string;
  readonly competencies: readonly string[];
  readonly learningObjectives: readonly string[];
  readonly learningFlow: readonly string[];
  readonly activities: readonly PieActivityView[];
  readonly assessment: readonly string[];
  readonly successCriteria?: readonly string[];
  readonly resources: readonly PieResourceRef[];
  readonly differentiation: readonly string[];
  readonly reflection: readonly string[];
  readonly curriculumVersion?: string;
  readonly language?: string;
  /** Optional teacher preference signals for Learning Mode */
  readonly teacherPreferences?: Record<string, unknown>;
}

export interface PieDimensionScore {
  readonly dimension: PieDimensionId;
  readonly score: number;
  readonly summary: string;
  readonly evidence: readonly string[];
}

export interface PieCognitiveLoadDetail {
  readonly band: CognitiveLoadBand;
  readonly intrinsic: number;
  readonly extraneous: number;
  readonly germane: number;
}

export interface PieTimeDetail {
  readonly availableMinutes: number;
  readonly estimatedLessonDuration: number;
  readonly varianceMinutes: number;
  readonly transitionMinutes: number;
  readonly assessmentMinutes: number;
  readonly reflectionMinutes: number;
  readonly suggestedAdjustments: readonly string[];
}

export interface PieRecommendationExplanation {
  readonly why: string;
  readonly ifAccept: string;
  readonly ifIgnore: string;
  readonly affectedParts: string;
}

export interface PieRecommendation {
  readonly id: string;
  readonly priority: PieRecommendationPriority;
  readonly dimension: PieDimensionId;
  readonly title: string;
  readonly explanation: string;
  readonly pedagogicalRationale: string;
  readonly affectedComponents: readonly PieLessonComponent[];
  readonly estimatedImprovement: string;
  readonly learnMore: string;
  readonly explainable: PieRecommendationExplanation;
  /** Opaque structured proposal for Universal Editor / Studio apply */
  readonly acceptProposal?: Record<string, unknown>;
}

export interface PieScorecard {
  readonly overall: number;
  readonly dimensions: readonly PieDimensionScore[];
  readonly estimatedTeachingMinutes: number;
  /** Soft band for UI — never a teacher grade */
  readonly improvementFocus: readonly PieDimensionId[];
}

export interface PieAnalysisReport {
  readonly schemaVersion: string;
  readonly analyzedAt: string;
  readonly lessonProjectId: string;
  readonly inputFingerprint: string;
  readonly scorecard: PieScorecard;
  readonly cognitiveLoad: PieCognitiveLoadDetail;
  readonly time: PieTimeDetail;
  readonly recommendations: readonly PieRecommendation[];
  readonly knowledgePackVersions: readonly string[];
  /** Internal codes for QA — UI maps to UX-002 copy when needed */
  readonly notes: readonly string[];
}

export interface PieChangeEvent {
  readonly kind: PieChangeKind;
  readonly component?: PieLessonComponent;
  readonly detail?: string;
}

export interface PieValidationIssue {
  readonly code: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
}

export function emptyPieAnalysisInput(
  partial: Partial<PieAnalysisInput> &
    Pick<PieAnalysisInput, 'lessonProjectId' | 'title'>,
): PieAnalysisInput {
  return {
    subject: '',
    grade: '',
    availableMinutes: 45,
    competencies: [],
    learningObjectives: [],
    learningFlow: [],
    activities: [],
    assessment: [],
    resources: [],
    differentiation: [],
    reflection: [],
    language: 'ro',
    ...partial,
  };
}

/** Lightweight structural validation of PIE input. */
export function validatePieAnalysisInputMvp(
  input: PieAnalysisInput,
): readonly PieValidationIssue[] {
  const issues: PieValidationIssue[] = [];
  if (!input.lessonProjectId?.trim()) {
    issues.push({
      code: 'PIE-V-001',
      severity: 'error',
      message: 'lessonProjectId is required',
    });
  }
  if (!input.title?.trim()) {
    issues.push({
      code: 'PIE-V-002',
      severity: 'error',
      message: 'title is required',
    });
  }
  if (input.availableMinutes <= 0) {
    issues.push({
      code: 'PIE-V-003',
      severity: 'error',
      message: 'availableMinutes must be positive',
    });
  }
  return issues;
}

export function clampPieScore(score: number): number {
  if (Number.isNaN(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function weightedOverall(
  dimensions: readonly PieDimensionScore[],
  weights: Partial<Record<PieDimensionId, number>> = {},
): number {
  if (dimensions.length === 0) return 0;
  let sum = 0;
  let wSum = 0;
  for (const dim of dimensions) {
    const w = weights[dim.dimension] ?? 1;
    sum += dim.score * w;
    wSum += w;
  }
  return clampPieScore(sum / (wSum || 1));
}
