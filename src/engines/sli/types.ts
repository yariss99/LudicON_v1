/** FEATURE-008 — SLI runtime types */

export type EvidenceSourceKind =
  | "assessment"
  | "worksheet"
  | "interactive"
  | "observation"
  | "reflection"
  | "portfolio"
  | "project"
  | "presentation"
  | "peer_activity"
  | "homework";

export type SupportNeedLevel = "none" | "watch" | "support" | "enrichment";

export type EarlySupportSignalKind =
  | "repeated_misconception"
  | "low_participation"
  | "incomplete_work"
  | "irregular_progress";

export type DifferentiationSuggestionKind =
  | "support_group"
  | "extension"
  | "alternative_explanation"
  | "additional_practice"
  | "flexible_assessment"
  | "personalized_homework";

export type SuggestionApproval = "pending" | "approved" | "dismissed";

export type LearnerAlias = {
  id: string;
  displayName: string;
  classId: string;
  externalRef?: string;
};

export type LearningEvidence = {
  id: string;
  learnerId: string;
  source: EvidenceSourceKind;
  title: string;
  summary: string;
  objectiveIds: string[];
  competencyIds: string[];
  recordedAt: string;
  lessonProjectId?: string;
  strengthSignal?: boolean;
  needSignal?: boolean;
  misconceptionTag?: string;
};

export type TeacherObservation = {
  id: string;
  learnerId: string;
  note: string;
  recordedAt: string;
  tags: string[];
  editable: true;
};

export type LearnerProfile = {
  learnerId: string;
  alias: LearnerAlias;
  strengths: string[];
  needs: string[];
  preferredActivityTypes: string[];
  participationNotes: string[];
  misconceptionTags: string[];
  supportStrategies: string[];
  supportNeed: SupportNeedLevel;
  updatedAt: string;
  evaluationForbidden: true;
};

export type MisconceptionPattern = {
  id: string;
  tag: string;
  titleRo: string;
  descriptionRo: string;
  learnerCount: number;
  suggestedActions: string[];
};

export type DifferentiationSuggestion = {
  id: string;
  kind: DifferentiationSuggestionKind;
  titleRo: string;
  rationaleRo: string;
  learnerIds: string[];
  status: SuggestionApproval;
  relatedMisconceptionId?: string;
};

export type ClassInsightCard = {
  id: string;
  titleRo: string;
  detailRo: string;
  evidenceCount: number;
  descriptiveOnly: true;
};

export type CompetencyProgress = {
  competencyId: string;
  labelRo: string;
  evidenceCount: number;
  learnersWithEvidence: number;
  needsReinforcement: boolean;
};

export type ObjectiveProgress = {
  objectiveId: string;
  labelRo: string;
  achievedApproxShare: number;
  evidenceCount: number;
};

export type ClassDashboardSnapshot = {
  classId: string;
  lessonProjectId?: string;
  lessonTitle?: string;
  objectives: ObjectiveProgress[];
  competencies: CompetencyProgress[];
  misconceptions: MisconceptionPattern[];
  needingSupport: string[];
  readyForEnrichment: string[];
  insights: ClassInsightCard[];
  rankingForbidden: true;
};

export type ProgressTimelinePoint = {
  id: string;
  phase: "beginning" | "middle" | "end" | "between_lessons";
  labelRo: string;
  at: string;
  note: string;
};

export type EarlySupportIndicator = {
  id: string;
  kind: EarlySupportSignalKind;
  learnerId: string;
  titleRo: string;
  instructionalSuggestionRo: string;
  nonLabeling: true;
};

export type LearnerPortfolioItem = {
  id: string;
  learnerId: string;
  title: string;
  kind: string;
  includedByTeacher: true;
  createdAt: string;
  notes: string;
};

export type PieInstructionalHandoff = {
  focusSection: string;
  noteRo: string;
  relatedObjectiveIds: string[];
  misconceptionTags: string[];
};
