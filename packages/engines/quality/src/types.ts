/**
 * PS-005 — Quality Engine types.
 * Pedagogical review authority: evaluate, explain, never rewrite Blueprints.
 */

export type QualityDimension =
  | 'pedagogical_alignment'
  | 'curriculum_alignment'
  | 'learning_objectives'
  | 'competency_coverage'
  | 'activity_quality'
  | 'assessment_alignment'
  | 'differentiation'
  | 'accessibility'
  | 'digital_integration'
  | 'student_engagement'
  | 'cognitive_load'
  | 'instructional_coherence'
  | 'resource_quality'
  | 'assessment_diversity'
  | 'reflection_quality'
  | 'time_feasibility'
  | 'innovation'
  | 'classroom_practicality';

export type ScoreConfidence = 'high' | 'medium' | 'low';

export type QualityBand =
  | 'excellent'
  | 'very_good'
  | 'good'
  | 'needs_improvement'
  | 'critical';

export type PolicySeverity = 'critical' | 'important' | 'suggested' | 'idea';

export type QualityTrigger =
  | 'BlueprintUpdated'
  | 'AssetChanged'
  | 'AssessmentChanged'
  | 'ObjectivesChanged'
  | 'TeacherFeedbackUpdated'
  | 'FullEvaluation';

export type EvaluationLogicType =
  | 'objectives_supported_by_activities'
  | 'objectives_have_assessment'
  | 'has_differentiation'
  | 'cognitive_load_vs_duration'
  | 'has_accessibility'
  | 'curriculum_refs_present'
  | 'competencies_covered'
  | 'assessment_diversity'
  | 'digital_tools_present'
  | 'engagement_signals'
  | 'coherence_objective_activity_assessment'
  | 'resource_present'
  | 'reflection_present'
  | 'time_feasibility'
  | 'innovation_signal'
  | 'classroom_practicality'
  | 'activity_quality_signal';

export type QualityPolicy = {
  policyId: string;
  category: QualityDimension;
  description: string;
  trigger: QualityTrigger | QualityTrigger[];
  evaluationLogic: EvaluationLogicType;
  thresholds: {
    passScore: number;
    warnScore: number;
  };
  weight: number;
  evidenceRules: {
    strengthWhenPass: string;
    weaknessWhenFail: string;
  };
  improvementSuggestions: string[];
  severity: PolicySeverity;
  enabled?: boolean;
};

/** Configurable scoring — never hardcode band cutoffs in UI */
export type ScoringModelConfig = {
  dimensionWeights: Partial<Record<QualityDimension, number>>;
  bandThresholds: {
    excellent: number;
    veryGood: number;
    good: number;
    needsImprovement: number;
  };
};

export type EvidenceItem = {
  id: string;
  policyId: string;
  dimension: QualityDimension;
  statement: string;
  kind: 'strength' | 'weakness' | 'neutral';
  refs: string[];
};

export type DimensionScore = {
  dimension: QualityDimension;
  score: number;
  confidence: ScoreConfidence;
  evidence: EvidenceItem[];
  strengths: string[];
  weaknesses: string[];
  suggestedImprovements: string[];
  policyIds: string[];
  explanation: {
    why: string;
    supportingEvidence: string[];
    policies: string[];
    howToImprove: string[];
  };
};

export type DetectedRisk = {
  id: string;
  severity: PolicySeverity;
  dimension: QualityDimension;
  message: string;
  policyId: string;
};

export type QualityReport = {
  reportId: string;
  subjectType: 'blueprint' | 'asset' | 'lesson';
  subjectId: string;
  sessionId?: string;
  teacherId?: string;
  overallScore: number;
  overallBand: QualityBand;
  dimensionScores: DimensionScore[];
  evidence: EvidenceItem[];
  detectedRisks: DetectedRisk[];
  suggestedImprovements: string[];
  warnings: string[];
  recommendations: string[];
  version: number;
  timestamp: string;
  scoringModelVersion: string;
  evaluatedDimensions: QualityDimension[];
};

export type BlueprintQualityInput = {
  blueprintId: string;
  sessionId?: string;
  teacherId?: string;
  subject?: string;
  grade?: string;
  durationMinutes?: number;
  objectives?: Array<{ id: string; title: string; activityIds?: string[]; assessmentIds?: string[] }>;
  activities?: Array<{ id: string; title: string; durationMinutes?: number; differentiated?: boolean }>;
  assessments?: Array<{ id: string; title: string; strategy?: string }>;
  competencies?: string[];
  curriculumRefs?: string[];
  hasDifferentiation?: boolean;
  hasAccessibility?: boolean;
  digitalToolIds?: string[];
  resourceIds?: string[];
  hasReflection?: boolean;
  engagementSignals?: string[];
  innovationSignals?: string[];
  practicalityNotes?: string[];
  teacherFeedback?: { rating?: number; notes?: string };
};

export type AssetQualityInput = {
  assetId: string;
  blueprintId?: string;
  sessionId?: string;
  teacherId?: string;
  kind?: string;
  alignedObjectiveIds?: string[];
  hasAccessibility?: boolean;
  resourceQualityHints?: string[];
  digitalIntegration?: boolean;
  teacherFeedback?: { rating?: number; notes?: string };
};

export type LessonQualityInput = BlueprintQualityInput & {
  lessonId: string;
  assetIds?: string[];
};

export type PolicyEvaluationResult = {
  policyId: string;
  dimension: QualityDimension;
  passed: boolean;
  score: number;
  confidence: ScoreConfidence;
  evidence: EvidenceItem[];
  improvements: string[];
  risk?: DetectedRisk;
};

export type TrendSnapshot = {
  teacherId: string;
  averageQuality: number;
  mostImprovedDimension?: QualityDimension;
  recurringWeaknesses: QualityDimension[];
  teacherGrowth: number;
  historyCount: number;
  lastReportId?: string;
  comparedToPrevious?: {
    overallDelta: number;
    improved: QualityDimension[];
    declined: QualityDimension[];
  };
};

export const ALL_QUALITY_DIMENSIONS: QualityDimension[] = [
  'pedagogical_alignment',
  'curriculum_alignment',
  'learning_objectives',
  'competency_coverage',
  'activity_quality',
  'assessment_alignment',
  'differentiation',
  'accessibility',
  'digital_integration',
  'student_engagement',
  'cognitive_load',
  'instructional_coherence',
  'resource_quality',
  'assessment_diversity',
  'reflection_quality',
  'time_feasibility',
  'innovation',
  'classroom_practicality',
];

export const TRIGGER_AFFECTED_DIMENSIONS: Record<QualityTrigger, QualityDimension[]> = {
  BlueprintUpdated: [...ALL_QUALITY_DIMENSIONS],
  AssetChanged: [
    'resource_quality',
    'digital_integration',
    'accessibility',
    'activity_quality',
    'pedagogical_alignment',
  ],
  AssessmentChanged: [
    'assessment_alignment',
    'assessment_diversity',
    'instructional_coherence',
    'learning_objectives',
  ],
  ObjectivesChanged: [
    'learning_objectives',
    'assessment_alignment',
    'activity_quality',
    'instructional_coherence',
    'competency_coverage',
    'pedagogical_alignment',
  ],
  TeacherFeedbackUpdated: [
    'classroom_practicality',
    'student_engagement',
    'innovation',
    'reflection_quality',
  ],
  FullEvaluation: [...ALL_QUALITY_DIMENSIONS],
};
