/**
 * FEATURE-006 — Reflective Practice & Teaching Insights (RPTI) contracts.
 * Private professional growth. Never an evaluation instrument.
 */

export const PRIMA_RPTI_SCHEMA_VERSION = '1.0.0';

export type ReflectionMode =
  | 'quick'
  | 'guided'
  | 'evidence'
  | 'comprehensive'
  | 'voice';

export type ReflectionStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'archived';

export type InsightKind =
  | 'timing'
  | 'engagement'
  | 'assessment'
  | 'differentiation'
  | 'resources'
  | 'strategy'
  | 'objectives'
  | 'habit';

export type MilestoneId =
  | 'first_lesson_reflected'
  | 'reflections_5'
  | 'reflections_20'
  | 'lessons_designed_10'
  | 'lessons_designed_100'
  | 'differentiation_habit'
  | 'strategy_experiment'
  | (string & {});

export type PortfolioEntryKind =
  | 'lesson_design'
  | 'published_package'
  | 'reflection_note'
  | 'teaching_evidence'
  | 'pd_goal'
  | 'certificate'
  | 'innovation_project'
  | 'inspection_evidence';

export type ShareDecision = 'private' | 'export' | 'share_selected';

export interface ReflectionPrompt {
  readonly id: string;
  readonly mode: ReflectionMode | 'all';
  readonly questionRo: string;
  readonly pedagogicalFocus: InsightKind;
}

export interface ReflectionAnswer {
  readonly promptId: string;
  readonly value: string;
  readonly rating?: number;
}

export interface ReflectionRecord {
  readonly id: string;
  readonly schemaVersion: string;
  readonly lessonProjectId: string;
  readonly lessonTitle: string;
  readonly publicationId?: string;
  readonly mode: ReflectionMode;
  readonly status: ReflectionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt?: string;
  readonly answers: readonly ReflectionAnswer[];
  readonly strengths: readonly string[];
  readonly improvements: readonly string[];
  readonly personalNotes: string;
  readonly followUpActions: readonly string[];
  readonly shareDecision: ShareDecision;
  readonly private: true;
}

export interface PedagogicalInsight {
  readonly id: string;
  readonly kind: InsightKind;
  readonly title: string;
  readonly observation: string;
  readonly pedagogicalExplanation: string;
  readonly evidenceCount: number;
  readonly confidence: 'low' | 'medium' | 'high';
}

export interface ImprovementRecommendation {
  readonly id: string;
  readonly insightId: string;
  readonly observation: string;
  readonly pedagogicalExplanation: string;
  readonly suggestedImprovement: string;
  readonly expectedImpact: string;
  readonly relatedResourceHints: readonly string[];
  /** Optional handoff into next lesson design */
  readonly applyToFutureLesson?: {
    readonly focusSection: string;
    readonly note: string;
  };
}

export interface GrowthProfile {
  readonly teacherId: string;
  readonly updatedAt: string;
  readonly strategiesUsed: readonly string[];
  readonly assessmentMethods: readonly string[];
  readonly differentiationFrequency: number;
  readonly digitalIntegrationFrequency: number;
  readonly reflectionCount: number;
  readonly completedLessonCount: number;
  readonly professionalGoals: readonly string[];
  readonly averageSelfRatedEngagement?: number;
  /** Explicit: never used for evaluation */
  readonly evaluationForbidden: true;
}

export interface PortfolioEntry {
  readonly id: string;
  readonly kind: PortfolioEntryKind;
  readonly title: string;
  readonly createdAt: string;
  readonly lessonProjectId?: string;
  readonly reflectionId?: string;
  readonly publicationId?: string;
  readonly notes: string;
  readonly editable: true;
  readonly shareDecision: ShareDecision;
}

export interface AchievementMilestone {
  readonly id: MilestoneId;
  readonly titleRo: string;
  readonly descriptionRo: string;
  readonly achievedAt?: string;
  readonly celebrated: boolean;
}

export interface LessonComparisonView {
  readonly leftLessonId: string;
  readonly rightLessonId: string;
  readonly dimensions: readonly {
    readonly id: string;
    readonly labelRo: string;
    readonly leftSummary: string;
    readonly rightSummary: string;
  }[];
}

export interface PersonalAnalyticsSnapshot {
  readonly averageLessonDuration?: number;
  readonly strategyDiversity: number;
  readonly assessmentBalance: number;
  readonly reflectionFrequency: number;
  readonly resourceReuse: number;
  readonly monthlyReflectionCounts: readonly number[];
}

export const DEFAULT_REFLECTION_PROMPTS: readonly ReflectionPrompt[] = [
  {
    id: 'obj_achieved',
    mode: 'all',
    questionRo: 'Elevii au atins obiectivele de învățare?',
    pedagogicalFocus: 'objectives',
  },
  {
    id: 'engagement_peak',
    mode: 'all',
    questionRo: 'Care activitate a generat cea mai mare implicare?',
    pedagogicalFocus: 'engagement',
  },
  {
    id: 'difficulties',
    mode: 'guided',
    questionRo: 'Unde au întâmpinat elevii dificultăți?',
    pedagogicalFocus: 'assessment',
  },
  {
    id: 'timing',
    mode: 'quick',
    questionRo: 'Timpul estimat a fost realist?',
    pedagogicalFocus: 'timing',
  },
  {
    id: 'change_next',
    mode: 'all',
    questionRo: 'Ce ai schimba data viitoare?',
    pedagogicalFocus: 'habit',
  },
  {
    id: 'assessment_fit',
    mode: 'guided',
    questionRo: 'Evaluarea a măsurat ceea ce ți-ai propus?',
    pedagogicalFocus: 'assessment',
  },
  {
    id: 'differentiation',
    mode: 'comprehensive',
    questionRo: 'Activitățile diferențiate au fost eficiente?',
    pedagogicalFocus: 'differentiation',
  },
  {
    id: 'digital',
    mode: 'evidence',
    questionRo: 'Resursele digitale au sprijinit învățarea?',
    pedagogicalFocus: 'resources',
  },
] as const;

export function promptsForMode(mode: ReflectionMode): readonly ReflectionPrompt[] {
  if (mode === 'voice') return DEFAULT_REFLECTION_PROMPTS.filter((p) => p.mode === 'all');
  if (mode === 'quick') {
    return DEFAULT_REFLECTION_PROMPTS.filter(
      (p) => p.mode === 'all' || p.mode === 'quick',
    ).slice(0, 3);
  }
  if (mode === 'guided') {
    return DEFAULT_REFLECTION_PROMPTS.filter(
      (p) => p.mode === 'all' || p.mode === 'guided' || p.mode === 'quick',
    );
  }
  if (mode === 'evidence') {
    return DEFAULT_REFLECTION_PROMPTS.filter(
      (p) => p.mode === 'all' || p.mode === 'evidence' || p.mode === 'guided',
    );
  }
  return DEFAULT_REFLECTION_PROMPTS.filter((p) => p.mode !== 'voice');
}
