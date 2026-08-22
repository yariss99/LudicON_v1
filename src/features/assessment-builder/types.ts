/**
 * Assessment Builder domain model.
 * Assessments always belong to a Lesson and a Project.
 */

export type AssessmentKind =
  | "initial"
  | "formative"
  | "summative"
  | "diagnostic"
  | "competency"
  | "practical"
  | "observation_grid"
  | "rubric"
  | "portfolio"
  | "self"
  | "peer";

export type QuestionType =
  | "multiple_choice"
  | "short_answer"
  | "long_answer"
  | "fill_blank"
  | "matching"
  | "ordering"
  | "classification"
  | "calculation"
  | "creative_writing"
  | "drawing"
  | "observation"
  | "project_task";

export type BloomLevel =
  | "remember"
  | "understand"
  | "apply"
  | "analyze"
  | "evaluate"
  | "create";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type ScoringMode =
  | "automatic"
  | "manual"
  | "rubric"
  | "weighted"
  | "competency"
  | "custom";

export type AssessmentStatus =
  | "draft"
  | "validated"
  | "published"
  | "archived";

export type AssessmentActor = "teacher" | "ai" | "system";

export type AssessmentSectionId =
  | "general"
  | "objectives"
  | "competencies"
  | "criteria"
  | "questions"
  | "scoring"
  | "rubrics"
  | "answer_key"
  | "notes"
  | "metadata"
  | "analytics"
  | "export";

/** The four high-level stages a teacher moves through. Presentation only. */
export type AssessmentStageId = "about" | "content" | "grading" | "finish";

export type AssessmentStageStatus = "done" | "started" | "todo";

export type AssessmentChoice = {
  readonly id: string;
  readonly label: string;
  readonly isCorrect?: boolean;
};

export type AssessmentQuestion = {
  readonly id: string;
  readonly type: QuestionType;
  readonly prompt: string;
  readonly choices?: readonly AssessmentChoice[];
  readonly answerKey?: string;
  readonly points: number;
  readonly difficulty: DifficultyLevel;
  readonly bloom: BloomLevel;
  readonly competencyIds: readonly string[];
  readonly feedbackCorrect?: string;
  readonly feedbackIncorrect?: string;
  readonly estimatedSeconds: number;
  readonly order: number;
};

export type QuestionGroup = {
  readonly id: string;
  readonly title: string;
  readonly instructions: string;
  readonly questions: readonly AssessmentQuestion[];
  readonly order: number;
};

export type RubricLevel = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly points: number;
};

export type RubricCriterion = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly weight: number;
  readonly levels: readonly RubricLevel[];
};

export type AssessmentRubric = {
  readonly id: string;
  readonly title: string;
  readonly criteria: readonly RubricCriterion[];
};

export type AssessmentScoring = {
  readonly mode: ScoringMode;
  readonly totalPoints: number;
  readonly passingScore: number;
  readonly weights: Readonly<Record<string, number>>;
  readonly customModelNote?: string;
};

export type AssessmentValidationIssue = {
  readonly id: string;
  readonly severity: "error" | "warning" | "info";
  readonly code: string;
  readonly message: string;
  readonly sectionId?: AssessmentSectionId;
  readonly repairSuggestion?: string;
};

export type AssessmentValidationReport = {
  readonly score: number;
  readonly passed: boolean;
  readonly issues: readonly AssessmentValidationIssue[];
  readonly validatedAt: string;
};

export type AssessmentAnalytics = {
  readonly difficultyDistribution: Readonly<Record<DifficultyLevel, number>>;
  readonly bloomDistribution: Readonly<Record<BloomLevel, number>>;
  readonly competencyCoverage: readonly {
    competency: string;
    questionCount: number;
  }[];
  readonly estimatedMinutes: number;
  readonly estimatedSuccessRate: number;
  readonly qualityScore: number;
  readonly totalQuestions: number;
};

export type AssessmentExportFormat =
  | "pdf"
  | "docx"
  | "html"
  | "printable"
  | "lms";

export type AssessmentDocument = {
  readonly id: string;
  readonly projectId: string;
  readonly lessonId: string;
  readonly workspaceArtifactId?: string;
  readonly kind: AssessmentKind;
  readonly status: AssessmentStatus;
  readonly version: number;
  readonly title: string;
  readonly subject: string;
  readonly grade: string;
  readonly durationMinutes: number;
  readonly objectives: readonly string[];
  readonly competencies: readonly string[];
  readonly criteria: readonly string[];
  readonly groups: readonly QuestionGroup[];
  readonly scoring: AssessmentScoring;
  readonly rubrics: readonly AssessmentRubric[];
  readonly teacherNotes: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly bank: readonly AssessmentQuestion[];
  readonly validation?: AssessmentValidationReport;
  readonly analytics?: AssessmentAnalytics;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt?: string;
  readonly createdBy: AssessmentActor;
};

export type AssessmentVersion = {
  readonly id: string;
  readonly assessmentId: string;
  readonly projectId: string;
  readonly lessonId: string;
  readonly version: number;
  readonly snapshot: AssessmentDocument;
  readonly createdAt: string;
  readonly actor: AssessmentActor;
  readonly note?: string;
};

export type AssessmentAiActionId =
  | "generate_complete"
  | "generate_bank"
  | "generate_variants"
  | "adjust_difficulty"
  | "generate_rubrics"
  | "generate_answer_keys"
  | "generate_feedback"
  | "competency_mapping"
  | "detect_duplicates"
  | "suggest_improvements";

export type AssessmentBuilderPanel =
  | "editor"
  | "bank"
  | "validation"
  | "analytics"
  | "versions"
  | "export"
  | "ai";
