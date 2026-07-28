/**
 * IT-004 — Blueprint Review & Approval
 * CS-005 section names preserved. Pedagogical changes go through Decision Engine only.
 */

import type {
  ConfidenceLevel,
  ConfidenceMap,
  DecisionBlueprint,
  DecisionSession,
  MissingInformationItem,
} from "../../engines/decision";

/** Review navigation sections (CS labels; Learning Objectives / Learning Activities) */
export type ReviewSectionId =
  | "learning_context"
  | "competencies"
  | "objectives"
  | "learning_flow"
  | "activities"
  | "assessment"
  | "resources"
  | "differentiation"
  | "reflection";

export type ReviewSectionNavStatus =
  | "completed"
  | "needs_review"
  | "incomplete";

/** Overall validation band shown in Validation Panel */
export type ValidationStatus =
  | "excellent"
  | "good"
  | "needs_review"
  | "incomplete";

/** CS Blueprint lifecycle subset used in review */
export type BlueprintLifecycleState =
  | "under_review"
  | "needs_revision"
  | "approved"
  | "superseded";

export type ApprovalState =
  | "blocked"
  | "ready"
  | "approved"
  | "frozen";

export type ReviewUiState =
  | "loading"
  | "empty"
  | "ready"
  | "validating"
  | "improving"
  | "comparing"
  | "error";

export type DiffKind = "added" | "removed" | "modified" | "unchanged";

export type SectionDiff = {
  sectionId: ReviewSectionId;
  kind: DiffKind;
  before: string[];
  after: string[];
};

export type BlueprintVersion = {
  id: string;
  versionLabel: string;
  createdAt: string;
  author: string;
  changesSummary: string;
  /** Snapshot of Blueprint facts at this version */
  blueprint: DecisionBlueprint;
  confidenceMap: ConfidenceMap;
  lifecycleState: BlueprintLifecycleState;
  /** True when this version is frozen for generation */
  frozen: boolean;
};

export type ApprovalEvent = {
  id: string;
  versionId: string;
  versionLabel: string;
  approvedAt: string;
  author: string;
  note?: string;
};

export type ValidationIssue = {
  id: string;
  sectionId: ReviewSectionId | "validation";
  severity: "blocking" | "warning" | "info";
  title: string;
  explanation: string;
};

export type ValidationReport = {
  status: ValidationStatus;
  overallCompleteness: number;
  consistencyOk: boolean;
  confidenceScore: number;
  issues: ValidationIssue[];
  missingInformation: MissingInformationItem[];
  readyForApproval: boolean;
  blockingReasons: string[];
  validatedAt: string;
};

export type SectionReviewView = {
  id: ReviewSectionId;
  title: string;
  pedagogicalSummary: string;
  confidenceLevel: ConfidenceLevel;
  supportingNotes: string[];
  teacherComments: string[];
  revisionHistory: Array<{ at: string; summary: string }>;
  navStatus: ReviewSectionNavStatus;
};

/** Materials the teacher plans to create (FEATURE-001 checklist). */
export type PlannedMaterialId =
  | "worksheet"
  | "presentation"
  | "educational_game"
  | "assessment"
  | "rubric"
  | "differentiated_plan"
  | "remedial_sheet"
  | "homework_sheet";

/** FEATURE-001 — rich activity on the lesson timeline */
export type LessonStudioActivity = {
  id: string;
  title: string;
  description: string;
  durationMinutes?: number;
  resources?: string;
  teacherNotes?: string;
};

/** FEATURE-001 — structured assessment card */
export type LessonAssessmentBlock = {
  method: string;
  tools: string;
  successCriteria: string;
  observationNotes: string;
};

/** FEATURE-001 — teacher edit versions (restore) */
export type LessonEditVersion = {
  id: string;
  at: string;
  summary: string;
  snapshot: {
    blueprint: DecisionBlueprint;
    activities: LessonStudioActivity[];
    assessmentBlock: LessonAssessmentBlock;
    plannedMaterials: PlannedMaterialId[];
    lessonType?: string;
  };
};

export type LessonStudioExtensions = {
  activities: LessonStudioActivity[];
  assessmentBlock: LessonAssessmentBlock;
  lessonType?: string;
  editHistory: LessonEditVersion[];
};

export type BlueprintReviewDocument = {
  id: string;
  title: string;
  author: string;
  lifecycleState: BlueprintLifecycleState;
  approvalState: ApprovalState;
  blueprint: DecisionBlueprint;
  confidenceMap: ConfidenceMap;
  teacherComments: Partial<Record<ReviewSectionId, string[]>>;
  revisionLog: Array<{
    sectionId: ReviewSectionId;
    summary: string;
    at: string;
  }>;
  versions: BlueprintVersion[];
  currentVersionId: string;
  previousVersionId: string | null;
  approvalEvent: ApprovalEvent | null;
  generationUnlocked: boolean;
  projectId: string | null;
  decisionSession: DecisionSession;
  validation: ValidationReport | null;
  /** FEATURE-001 — teacher-selected materials to prepare */
  plannedMaterials?: PlannedMaterialId[];
  /** FEATURE-001 — studio editor state beyond DecisionBlueprint strings */
  studioExtensions?: LessonStudioExtensions;
  createdAt: string;
  updatedAt: string;
};

export type ComparisonResult = {
  leftVersionId: string;
  rightVersionId: string;
  diffs: SectionDiff[];
};
