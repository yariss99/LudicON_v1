/**
 * AI-002 — Pedagogical Decision Engine (MVP) types.
 * Deterministic decisions only — no text generation, no LLM.
 */

/** Lesson phase — may be inferred (AI-003) */
export type LessonPhase =
  | "Introduction"
  | "Development"
  | "Consolidation"
  | "Assessment";

/** Learning Canvas facts used for rule evaluation */
export type LearningCanvas = {
  topic?: string;
  subject?: string;
  grade?: string;
  /** Present when curriculum has been loaded for grade/subject */
  curriculum?: string;
  /** Optional lesson phase (AI-003 inference) */
  lessonPhase?: LessonPhase | string;
  competencies: string[];
  objectives: string[];
  activities: string[];
  assessment: string[];
  resources: string[];
};

/** Pedagogical completeness / readiness signals */
export type PedagogicalState = {
  curriculumLoaded: boolean;
  competenciesLoaded: boolean;
  /** Explicit completion markers used by AI-002.5 Validation Rule 6 */
  completedSections?: Partial<
    Record<
      | "grade"
      | "curriculum"
      | "competencies"
      | "objectives"
      | "activities"
      | "assessment"
      | "resources",
      boolean
    >
  >;
};

/** Lightweight conversation frame for the Decision Engine */
export type ConversationContext = {
  lastTeacherMessage?: string;
  turnCount: number;
};

export type DecisionContext = {
  canvas: LearningCanvas;
  pedagogicalState: PedagogicalState;
  conversationContext: ConversationContext;
};

/**
 * Single highest-value pedagogical action.
 * Exactly one action is returned per evaluation.
 */
export type PedagogicalAction =
  | "ASK_GRADE"
  | "LOAD_CURRICULUM"
  | "LOAD_COMPETENCIES"
  | "ASK_OBJECTIVES"
  | "ASK_ACTIVITIES"
  | "ASK_ASSESSMENT"
  | "ASK_RESOURCES"
  | "GENERATE_BLUEPRINT"
  | "NONE";

export type PedagogicalDecision = {
  action: PedagogicalAction;
  reason: string;
};

export type DecisionRuleId =
  | "R1_ASK_GRADE"
  | "R2_LOAD_CURRICULUM"
  | "R3_LOAD_COMPETENCIES"
  | "R4_ASK_OBJECTIVES"
  | "R5_ASK_ACTIVITIES"
  | "R6_ASK_ASSESSMENT"
  | "R7_ASK_RESOURCES"
  | "R8_GENERATE_BLUEPRINT";

export type DecisionRule = {
  id: DecisionRuleId;
  /** First matching rule wins */
  matches: (ctx: DecisionContext) => boolean;
  action: PedagogicalAction;
  reason: string;
};
