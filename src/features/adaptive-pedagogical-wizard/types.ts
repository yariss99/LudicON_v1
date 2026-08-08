/** Adaptive Pedagogical Wizard — interview domain (Mission 007). */

export type LessonPurpose =
  | "introduction"
  | "consolidation"
  | "review"
  | "assessment"
  | "remedial"
  | "enrichment";

export type ClassProfile =
  | "typical"
  | "mixed_ability"
  | "high_performing"
  | "support_needed"
  | "demonstration";

export type LessonDuration = 30 | 40 | 50 | 90;

export type LearningOrganization =
  | "individual"
  | "pair"
  | "groups"
  | "mixed";

export type AvailableResourceId =
  | "manual"
  | "worksheet"
  | "projector"
  | "interactive_board"
  | "tablets"
  | "manipulatives"
  | "other";

export type InterviewStepId =
  | "topic"
  | "purpose"
  | "class_profile"
  | "duration"
  | "organization"
  | "resources"
  | "summary";

export type InterviewAnswers = {
  topic: string;
  purpose: LessonPurpose | null;
  classProfile: ClassProfile | null;
  duration: LessonDuration | null;
  organization: LearningOrganization | null;
  resources: AvailableResourceId[];
  resourcesOther: string;
  projectId: string;
  subject: string;
  grade: string;
};

export type InterviewDraft = {
  answers: InterviewAnswers;
  /** Index into the adaptive visible-step list. */
  stepIndex: number;
  updatedAt: string;
};

export type AdaptiveStepDef = {
  id: InterviewStepId;
  title: string;
  prompt: string;
};
