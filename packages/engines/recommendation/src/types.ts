/**
 * PS-004 — Recommendation Engine types.
 * Observes and recommends. Never decides. Never mutates Blueprints.
 */

export type RecommendationCategory =
  | 'pedagogical'
  | 'quality'
  | 'resource'
  | 'workflow'
  | 'personalization'
  | 'digital_integration'
  | 'accessibility'
  | 'differentiation'
  | 'assessment'
  | 'future_learning';

export type RecommendationPriority =
  | 'critical'
  | 'important'
  | 'suggested'
  | 'idea';

export type RecommendationStatus =
  | 'new'
  | 'displayed'
  | 'accepted'
  | 'dismissed'
  | 'ignored'
  | 'expired'
  | 'archived'
  | 'saved_for_later';

export type RecommendationTrigger =
  | 'BlueprintUpdated'
  | 'ConversationAdvanced'
  | 'QualityScoreChanged'
  | 'GenerationCompleted'
  | 'AssetModified'
  | 'TeacherPreferenceUpdated'
  | 'MemoryUpdated'
  | 'KnowledgeUpdated'
  | 'WorkflowChanged'
  | 'NewBlueprintCreated';

export type PolicyConditionType =
  | 'objective_without_assessment'
  | 'quality_below'
  | 'similar_blueprint_exists'
  | 'section_incomplete'
  | 'open_clarifications'
  | 'missing_differentiation'
  | 'accessibility_gap'
  | 'preference_match';

export type PolicyCondition = {
  type: PolicyConditionType;
  /** e.g. quality field name */
  field?: string;
  threshold?: number;
  section?: string;
  minRating?: number;
};

export type LearningStrategy =
  | 'suppress_on_dismiss'
  | 'suppress_on_ignore'
  | 'reinforce_on_accept';

/** Externalized recommendation policy — never hardcoded in UI */
export type RecommendationPolicy = {
  policyId: string;
  trigger: RecommendationTrigger | RecommendationTrigger[];
  conditions: PolicyCondition[];
  priority: RecommendationPriority;
  category: RecommendationCategory;
  recommendation: {
    titleTemplate: string;
    descriptionTemplate: string;
    suggestedAction: string;
    alternativeActions?: string[];
  };
  explanation: {
    whyTemplate: string;
    improvesTemplate: string;
    impactTemplate: string;
    relatedSection?: string;
  };
  learningStrategy: LearningStrategy;
  expirationMs?: number;
  confidenceBase: number;
  /** Template vars resolved at evaluation, e.g. {{objectiveId}} */
  enabled?: boolean;
};

export type RecommendationExplanation = {
  why: string;
  improves: string;
  expectedImpact: string;
  relatedBlueprintSection?: string;
};

export type RecommendationCard = {
  recommendationId: string;
  policyId: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  description: string;
  explanation: RecommendationExplanation;
  suggestedAction: string;
  alternativeActions: string[];
  confidenceScore: number;
  triggerSource: RecommendationTrigger;
  timestamp: string;
  status: RecommendationStatus;
  sessionId: string;
  teacherId: string;
  /** Structured facts used for templates — never a Blueprint mutation */
  contextRefs: Record<string, string>;
  expiresAt?: string;
};

export type BlueprintObjectiveView = {
  id: string;
  title: string;
  hasAssessment: boolean;
};

export type EvaluationContext = {
  sessionId: string;
  teacherId: string;
  trigger: RecommendationTrigger;
  blueprint?: {
    blueprintId?: string;
    subject?: string;
    grade?: string;
    topic?: string;
    objectives?: BlueprintObjectiveView[];
    incompleteSections?: string[];
    hasDifferentiation?: boolean;
    hasAccessibilitySupports?: boolean;
  };
  quality?: {
    overall?: number;
    differentiation?: number;
    accessibility?: number;
    assessment?: number;
  };
  memory?: {
    similarBlueprints?: Array<{
      id: string;
      title: string;
      rating?: number;
      topic?: string;
    }>;
    assessmentPreferences?: string[];
    instructionalModels?: string[];
  };
  conversation?: {
    openClarifications?: string[];
    state?: string;
  };
  generation?: {
    stage?: string;
    completedAssetIds?: string[];
  };
  workflow?: string;
  teacherFeedback?: {
    rating?: number;
    notes?: string;
  };
};

export type PolicyMatch = {
  policy: RecommendationPolicy;
  bindings: Record<string, string>;
  confidence: number;
};

export type LearningRecord = {
  teacherId: string;
  policyId: string;
  accepted: number;
  dismissed: number;
  ignored: number;
  displayed: number;
  lastOutcome?: RecommendationStatus;
  lastUpdated: string;
};

export type PriorityWeight = {
  priority: RecommendationPriority;
  weight: number;
  visibility: 'always' | 'panel' | 'subtle' | 'idea_tray';
  maxFrequencyPerSession: number;
  persistenceHours: number;
};

export const PRIORITY_ORDER: RecommendationPriority[] = [
  'critical',
  'important',
  'suggested',
  'idea',
];

export const PRIORITY_WEIGHTS: Record<RecommendationPriority, PriorityWeight> = {
  critical: {
    priority: 'critical',
    weight: 100,
    visibility: 'always',
    maxFrequencyPerSession: 10,
    persistenceHours: 48,
  },
  important: {
    priority: 'important',
    weight: 75,
    visibility: 'panel',
    maxFrequencyPerSession: 8,
    persistenceHours: 24,
  },
  suggested: {
    priority: 'suggested',
    weight: 50,
    visibility: 'panel',
    maxFrequencyPerSession: 6,
    persistenceHours: 12,
  },
  idea: {
    priority: 'idea',
    weight: 25,
    visibility: 'idea_tray',
    maxFrequencyPerSession: 4,
    persistenceHours: 6,
  },
};

export const ALL_RECOMMENDATION_CATEGORIES: RecommendationCategory[] = [
  'pedagogical',
  'quality',
  'resource',
  'workflow',
  'personalization',
  'digital_integration',
  'accessibility',
  'differentiation',
  'assessment',
  'future_learning',
];
