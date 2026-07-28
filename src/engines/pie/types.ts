/**
 * FEATURE-003 — PIE runtime types.
 * Canonical mirror: @prima/contracts prima-pedagogical-intelligence.
 */

export type PieDimensionId =
  | "curriculum_alignment"
  | "pedagogical_coherence"
  | "cognitive_load"
  | "lesson_flow"
  | "student_engagement"
  | "differentiation"
  | "assessment_quality"
  | "inclusion_accessibility"
  | "time_validation"
  | "resource_optimization";

export const PIE_DIMENSION_IDS: readonly PieDimensionId[] = [
  "curriculum_alignment",
  "pedagogical_coherence",
  "cognitive_load",
  "lesson_flow",
  "student_engagement",
  "differentiation",
  "assessment_quality",
  "inclusion_accessibility",
  "time_validation",
  "resource_optimization",
] as const;

export type CognitiveLoadBand =
  | "balanced"
  | "needs_simplification"
  | "needs_extension";

export type PieRecommendationPriority =
  | "critical"
  | "important"
  | "optional"
  | "inspirational";

export type PieLessonComponent =
  | "competencies"
  | "objectives"
  | "learning_flow"
  | "activities"
  | "assessment"
  | "resources"
  | "differentiation"
  | "reflection"
  | "timing"
  | "strategy"
  | "pedagogical_object";

export type PieChangeKind =
  | "objective_removed"
  | "objective_added"
  | "duration_changed"
  | "activity_changed"
  | "assessment_changed"
  | "resource_changed"
  | "differentiation_changed"
  | "strategy_changed"
  | "generic_edit";

export type PieActivityView = {
  id: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  phase?: string;
  collaborative?: boolean;
  practical?: boolean;
};

export type PieResourceRef = {
  id: string;
  label: string;
  objectType?: string;
  linkedObjectiveIds?: string[];
};

export type PieAnalysisInput = {
  lessonProjectId: string;
  title: string;
  subject: string;
  grade: string;
  availableMinutes: number;
  teachingStrategy?: string;
  competencies: string[];
  learningObjectives: string[];
  learningFlow: string[];
  activities: PieActivityView[];
  assessment: string[];
  successCriteria?: string[];
  resources: PieResourceRef[];
  differentiation: string[];
  reflection: string[];
  curriculumVersion?: string;
  language?: string;
  teacherPreferences?: Record<string, unknown>;
};

export type PieDimensionScore = {
  dimension: PieDimensionId;
  score: number;
  summary: string;
  evidence: string[];
};

export type PieCognitiveLoadDetail = {
  band: CognitiveLoadBand;
  intrinsic: number;
  extraneous: number;
  germane: number;
};

export type PieTimeDetail = {
  availableMinutes: number;
  estimatedLessonDuration: number;
  varianceMinutes: number;
  transitionMinutes: number;
  assessmentMinutes: number;
  reflectionMinutes: number;
  suggestedAdjustments: string[];
};

export type PieRecommendationExplanation = {
  why: string;
  ifAccept: string;
  ifIgnore: string;
  affectedParts: string;
};

export type PieRecommendation = {
  id: string;
  priority: PieRecommendationPriority;
  dimension: PieDimensionId;
  title: string;
  explanation: string;
  pedagogicalRationale: string;
  affectedComponents: PieLessonComponent[];
  estimatedImprovement: string;
  learnMore: string;
  explainable: PieRecommendationExplanation;
  acceptProposal?: Record<string, unknown>;
};

export type PieScorecard = {
  overall: number;
  dimensions: PieDimensionScore[];
  estimatedTeachingMinutes: number;
  improvementFocus: PieDimensionId[];
};

export type PieAnalysisReport = {
  schemaVersion: string;
  analyzedAt: string;
  lessonProjectId: string;
  inputFingerprint: string;
  scorecard: PieScorecard;
  cognitiveLoad: PieCognitiveLoadDetail;
  time: PieTimeDetail;
  recommendations: PieRecommendation[];
  knowledgePackVersions: string[];
  notes: string[];
};

export type PieChangeEvent = {
  kind: PieChangeKind;
  component?: PieLessonComponent;
  detail?: string;
};
