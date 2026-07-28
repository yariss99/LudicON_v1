import type {
  BlueprintSectionId,
  PedagogicalObjectiveId,
  PlatformRules,
} from "./types";

/** Mandatory discovery order — never skip ahead */
export const SECTION_ORDER: BlueprintSectionId[] = [
  "learning_context",
  "competencies",
  "objectives",
  "learning_flow",
  "activities",
  "assessment",
  "resources",
  "differentiation",
  "reflection",
  "validation",
];

/** Sections required for Ready For Approval (IT-003) */
export const APPROVAL_REQUIRED_SECTIONS: BlueprintSectionId[] = [
  "learning_context",
  "objectives",
  "learning_flow",
  "assessment",
  "resources",
  "validation",
];

export const DEFAULT_PLATFORM_RULES: PlatformRules = {
  oneQuestionPerTurn: true,
  teacherAuthority: true,
  preferInference: true,
  approvalRequires: APPROVAL_REQUIRED_SECTIONS,
};

export const OBJECTIVE_FOR_SECTION: Record<
  Exclude<BlueprintSectionId, "validation">,
  PedagogicalObjectiveId
> = {
  learning_context: "capture_learning_context",
  competencies: "capture_competencies",
  objectives: "capture_objectives",
  learning_flow: "capture_learning_flow",
  activities: "capture_activities",
  assessment: "capture_assessment",
  resources: "capture_resources",
  differentiation: "capture_differentiation",
  reflection: "capture_reflection",
};

export const SECTION_FOR_OBJECTIVE: Partial<
  Record<PedagogicalObjectiveId, BlueprintSectionId>
> = {
  capture_learning_context: "learning_context",
  capture_competencies: "competencies",
  capture_objectives: "objectives",
  capture_learning_flow: "learning_flow",
  capture_activities: "activities",
  capture_assessment: "assessment",
  capture_resources: "resources",
  capture_differentiation: "differentiation",
  capture_reflection: "reflection",
  clarify_contradiction: "validation",
  clarify_low_confidence: "validation",
  confirm_ready: "validation",
};

/** Minimum confidence to progress past a section without clarification */
export const PROGRESS_CONFIDENCE: Array<"high" | "medium"> = ["high", "medium"];
