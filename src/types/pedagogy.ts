import type { Project, ProjectResource } from "./project";

/** Educational stages the engine looks for in a learning experience */
export type PedagogicalStage =
  | "attention"
  | "discovery"
  | "practice"
  | "reflection"
  | "assessment";

export type PedagogicalCheckId =
  | "stages"
  | "time"
  | "balance"
  | "differentiation"
  | "assessment";

export type PedagogicalFindingKind =
  | "strength"
  | "suggestion"
  | "improvement";

export type PedagogicalFinding = {
  id: string;
  checkId: PedagogicalCheckId;
  kind: PedagogicalFindingKind;
  title: string;
  detail: string;
  /** Optional stage this finding relates to */
  stage?: PedagogicalStage;
};

export type StagePresence = {
  stage: PedagogicalStage;
  present: boolean;
  evidence: string[];
};

export type TimeEstimate = {
  availableMinutes: number;
  estimatedMinutes: number;
  exceedsAvailable: boolean;
  breakdown: Array<{ resourceId: string; label: string; minutes: number }>;
};

export type BalanceSignals = {
  lectureHeavy: boolean;
  worksheetHeavy: boolean;
  individualHeavy: boolean;
  digitalHeavy: boolean;
  fewActiveMoments: boolean;
  scores: {
    lecture: number;
    worksheet: number;
    individual: number;
    digital: number;
    active: number;
  };
};

export type DifferentiationSignals = {
  hasAdvancedPath: boolean;
  hasSupportPath: boolean;
  hasGroupWork: boolean;
  hasIndividualWork: boolean;
};

export type AssessmentSignals = {
  hasFormative: boolean;
  hasSummative: boolean;
  hasReflection: boolean;
  hasFeedbackMoment: boolean;
};

export type PedagogicalReviewInput = {
  project: Pick<Project, "id" | "title" | "subject" | "grade" | "description">;
  resources: ProjectResource[];
  /** Teacher-declared available lesson time; default 45 */
  availableMinutes?: number;
  /** Free-text intention / prompt for soft keyword signals */
  intention?: string;
};

export type PedagogicalReview = {
  analyzedAt: string;
  stages: StagePresence[];
  time: TimeEstimate;
  balance: BalanceSignals;
  differentiation: DifferentiationSignals;
  assessment: AssessmentSignals;
  strengths: PedagogicalFinding[];
  suggestions: PedagogicalFinding[];
  improvements: PedagogicalFinding[];
  /** Short supportive summary — never critical */
  summary: string;
};
