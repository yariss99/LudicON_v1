/**
 * FEATURE-008 — Student Learning Intelligence (SLI) contracts.
 * Instructional evidence support. Never ranking. Never predictive grading.
 * Pseudonymous learner aliases — minimize PII.
 */

export const PRIMA_SLI_SCHEMA_VERSION = '1.0.0';

export type EvidenceSourceKind =
  | 'assessment'
  | 'worksheet'
  | 'interactive'
  | 'observation'
  | 'reflection'
  | 'portfolio'
  | 'project'
  | 'presentation'
  | 'peer_activity'
  | 'homework'
  | (string & {});

export type SupportNeedLevel = 'none' | 'watch' | 'support' | 'enrichment';

export type EarlySupportSignalKind =
  | 'repeated_misconception'
  | 'low_participation'
  | 'incomplete_work'
  | 'irregular_progress';

export type DifferentiationSuggestionKind =
  | 'support_group'
  | 'extension'
  | 'alternative_explanation'
  | 'additional_practice'
  | 'flexible_assessment'
  | 'personalized_homework';

export type SuggestionApproval = 'pending' | 'approved' | 'dismissed';

/** Teacher-controlled alias — not a legal identity document. */
export interface LearnerAlias {
  readonly id: string;
  readonly displayName: string;
  readonly classId: string;
  /** Optional opaque school id — never required for MVP */
  readonly externalRef?: string;
}

export interface LearningEvidence {
  readonly id: string;
  readonly learnerId: string;
  readonly source: EvidenceSourceKind;
  readonly title: string;
  readonly summary: string;
  readonly objectiveIds: readonly string[];
  readonly competencyIds: readonly string[];
  readonly recordedAt: string;
  readonly lessonProjectId?: string;
  readonly strengthSignal?: boolean;
  readonly needSignal?: boolean;
  readonly misconceptionTag?: string;
}

export interface TeacherObservation {
  readonly id: string;
  readonly learnerId: string;
  readonly note: string;
  readonly recordedAt: string;
  readonly tags: readonly string[];
  readonly editable: true;
}

export interface LearnerProfile {
  readonly learnerId: string;
  readonly alias: LearnerAlias;
  readonly strengths: readonly string[];
  readonly needs: readonly string[];
  readonly preferredActivityTypes: readonly string[];
  readonly participationNotes: readonly string[];
  readonly misconceptionTags: readonly string[];
  readonly supportStrategies: readonly string[];
  readonly supportNeed: SupportNeedLevel;
  readonly updatedAt: string;
  /** Explicit: never used for ranking or HR */
  readonly evaluationForbidden: true;
}

export interface MisconceptionPattern {
  readonly id: string;
  readonly tag: string;
  readonly titleRo: string;
  readonly descriptionRo: string;
  readonly learnerCount: number;
  readonly suggestedActions: readonly string[];
}

export interface DifferentiationSuggestion {
  readonly id: string;
  readonly kind: DifferentiationSuggestionKind;
  readonly titleRo: string;
  readonly rationaleRo: string;
  readonly learnerIds: readonly string[];
  readonly status: SuggestionApproval;
  readonly relatedMisconceptionId?: string;
}

export interface ClassInsightCard {
  readonly id: string;
  readonly titleRo: string;
  readonly detailRo: string;
  readonly evidenceCount: number;
  readonly descriptiveOnly: true;
}

export interface CompetencyProgress {
  readonly competencyId: string;
  readonly labelRo: string;
  readonly evidenceCount: number;
  readonly learnersWithEvidence: number;
  readonly needsReinforcement: boolean;
}

export interface ObjectiveProgress {
  readonly objectiveId: string;
  readonly labelRo: string;
  readonly achievedApproxShare: number;
  readonly evidenceCount: number;
}

export interface ClassDashboardSnapshot {
  readonly classId: string;
  readonly lessonProjectId?: string;
  readonly lessonTitle?: string;
  readonly objectives: readonly ObjectiveProgress[];
  readonly competencies: readonly CompetencyProgress[];
  readonly misconceptions: readonly MisconceptionPattern[];
  readonly needingSupport: readonly string[];
  readonly readyForEnrichment: readonly string[];
  readonly insights: readonly ClassInsightCard[];
  /** Hard invariant marker for UI/QA */
  readonly rankingForbidden: true;
}

export interface ProgressTimelinePoint {
  readonly id: string;
  readonly phase: 'beginning' | 'middle' | 'end' | 'between_lessons';
  readonly labelRo: string;
  readonly at: string;
  readonly note: string;
}

export interface EarlySupportIndicator {
  readonly id: string;
  readonly kind: EarlySupportSignalKind;
  readonly learnerId: string;
  readonly titleRo: string;
  readonly instructionalSuggestionRo: string;
  /** Never a label of the person */
  readonly nonLabeling: true;
}

export interface LearnerPortfolioItem {
  readonly id: string;
  readonly learnerId: string;
  readonly title: string;
  readonly kind: string;
  readonly includedByTeacher: true;
  readonly createdAt: string;
  readonly notes: string;
}

export interface PieInstructionalHandoff {
  readonly focusSection: string;
  readonly noteRo: string;
  readonly relatedObjectiveIds: readonly string[];
  readonly misconceptionTags: readonly string[];
}

export const SLI_PRIVACY_PRINCIPLES = [
  'privacy_by_design',
  'data_minimization',
  'no_ranking',
  'no_predictive_grading',
  'teacher_approval_required',
  'pseudonymous_aliases_preferred',
] as const;
