/**
 * IT-003 — Pedagogical Decision Engine types.
 * Blueprint section names follow INSTRUCTIONAL_BLUEPRINT_SPECIFICATION (CS-005).
 * Does not redefine Blueprint concepts; owns pedagogical decisions only.
 */

/** CS-aligned discovery sections used by the Decision Engine */
export type BlueprintSectionId =
  | "learning_context"
  | "competencies"
  | "objectives"
  | "learning_flow"
  | "activities"
  | "assessment"
  | "resources"
  | "differentiation"
  | "reflection"
  | "validation";

/** IT-003 confidence levels */
export type ConfidenceLevel = "high" | "medium" | "low" | "unknown";

/** Missing-information classification */
export type InformationKind = "known" | "assumed" | "missing" | "contradictory";

/** Engine lifecycle states */
export type DecisionEngineState =
  | "idle"
  | "listening"
  | "reasoning"
  | "clarifying"
  | "updating_blueprint"
  | "waiting_teacher"
  | "ready_for_approval"
  | "approved";

/** Single pedagogical objective for Question Planner */
export type PedagogicalObjectiveId =
  | "capture_learning_context"
  | "capture_competencies"
  | "capture_objectives"
  | "capture_learning_flow"
  | "capture_activities"
  | "capture_assessment"
  | "capture_resources"
  | "capture_differentiation"
  | "capture_reflection"
  | "clarify_contradiction"
  | "clarify_low_confidence"
  | "confirm_ready";

export type EvidenceSource =
  | "teacher_explicit"
  | "teacher_correction"
  | "inference"
  | "knowledge"
  | "memory"
  | "platform_rule";

export type LearningContextFacts = {
  grade?: string;
  subject?: string;
  topic?: string;
  durationMinutes?: number;
  language?: string;
  summary?: string;
};

export type BlueprintSectionFacts = {
  learningContext: LearningContextFacts;
  competencies: string[];
  objectives: string[];
  learningFlow: string[];
  activities: string[];
  assessment: string[];
  resources: string[];
  differentiation: string[];
  reflection: string[];
};

export type FieldConfidence = {
  sectionId: BlueprintSectionId;
  level: ConfidenceLevel;
  /** 0–1 numeric for aggregation */
  score: number;
  rationale: string;
};

export type ConfidenceMap = Record<BlueprintSectionId, FieldConfidence>;

export type MissingInformationItem = {
  id: string;
  sectionId: BlueprintSectionId;
  kind: InformationKind;
  description: string;
  /** Field key within section when applicable */
  field?: string;
};

export type DecisionTraceStep = {
  stage: DecisionPipelineStage;
  summary: string;
  evidence?: string;
  timestamp: string;
};

export type DecisionPipelineStage =
  | "update_conversation_context"
  | "extract_pedagogical_information"
  | "map_to_blueprint"
  | "validate_consistency"
  | "detect_missing_information"
  | "calculate_confidence"
  | "determine_next_objective"
  | "plan_question"
  | "update_blueprint_live";

export type NextPedagogicalAction = {
  objectiveId: PedagogicalObjectiveId;
  sectionId: BlueprintSectionId;
  question: string;
  /** True when clarification is required before progression */
  requiresClarification: boolean;
  reason: string;
};

export type ApprovalRecommendation = {
  readyForApproval: boolean;
  generationReadiness: boolean;
  blockingSections: BlueprintSectionId[];
  rationale: string;
};

export type ReflectionSummary = {
  whatIsKnown: string[];
  whatIsAssumed: string[];
  whatIsMissing: string[];
  contradictions: string[];
  narrative: string;
};

export type ConversationUtterance = {
  role: "teacher" | "prima" | "system";
  content: string;
  at: string;
  objectiveId?: PedagogicalObjectiveId;
};

export type ConversationState = {
  utterances: ConversationUtterance[];
  /** Objectives already asked — never repeat */
  askedObjectives: PedagogicalObjectiveId[];
  /** Exact question strings already asked */
  askedQuestions: string[];
  currentObjectiveId: PedagogicalObjectiveId | null;
};

export type KnowledgeEngineResults = {
  competencyCandidates?: string[];
  curriculumNotes?: string[];
};

export type MemoryEnginePreferences = {
  preferredDurationMinutes?: number;
  preferredLanguage?: string;
  strategyHints?: string[];
};

export type TeacherCorrection = {
  sectionId: BlueprintSectionId;
  field?: string;
  previousValue?: string;
  newValue: string;
  rawText: string;
};

export type CurriculumConstraints = {
  allowedGrades?: string[];
  allowedSubjects?: string[];
};

export type PlatformRules = {
  oneQuestionPerTurn: true;
  teacherAuthority: true;
  preferInference: boolean;
  approvalRequires: BlueprintSectionId[];
};

export type DecisionBlueprint = BlueprintSectionFacts & {
  /** Provenance / assumption tracking per section */
  assumptions: Partial<Record<BlueprintSectionId, string[]>>;
  correctionsApplied: TeacherCorrection[];
};

export type DecisionTurnInput = {
  teacherMessage: string;
  conversation: ConversationState;
  blueprint: DecisionBlueprint;
  knowledge?: KnowledgeEngineResults;
  memory?: MemoryEnginePreferences;
  curriculum?: CurriculumConstraints;
  platformRules?: Partial<PlatformRules>;
};

export type DecisionTurnOutput = {
  engineState: DecisionEngineState;
  conversation: ConversationState;
  blueprint: DecisionBlueprint;
  confidenceMap: ConfidenceMap;
  missingInformation: MissingInformationItem[];
  nextAction: NextPedagogicalAction;
  reflectionSummary: ReflectionSummary;
  approvalRecommendation: ApprovalRecommendation;
  generationReadiness: boolean;
  /** Prima-facing single question / message for this turn */
  primaMessage: string;
  /** CE-004 structured reply (Understand → Canvas → Why → Question) */
  guidedReply: {
    understanding: string;
    canvasUpdate: string | null;
    whyNeeded: string;
    question: string;
  };
  trace: DecisionTraceStep[];
  /** Sections whose facts changed this turn (Blueprint Live) */
  updatedSections: BlueprintSectionId[];
  latencyMs: number;
};

export type ExtractedPedagogicalInfo = {
  facts: Partial<BlueprintSectionFacts>;
  corrections: TeacherCorrection[];
  /** Soft signals for lost / unclear answers */
  unclear: boolean;
  lost: boolean;
  rawEvidence: string;
};
