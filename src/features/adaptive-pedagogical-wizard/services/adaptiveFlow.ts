import { STEP_DEFS } from "../constants";
import type {
  AdaptiveStepDef,
  InterviewAnswers,
  InterviewStepId,
} from "../types";

/**
 * Conditional branching — only relevant pedagogical questions appear.
 *
 * Rules:
 * - Topic, purpose, duration, summary → always
 * - Class profile → skip for pure assessment checks (profile less critical)
 * - Organization → skip for assessment (typically individual) and for
 *   30-minute reviews (short whole-class recap)
 * - Resources → skip for demonstration lessons (setup assumed) and for
 *   30-minute oral reviews without materials
 */
export function resolveVisibleSteps(
  answers: InterviewAnswers,
): InterviewStepId[] {
  const steps: InterviewStepId[] = ["topic", "purpose"];

  const skipClassProfile = answers.purpose === "assessment";
  if (!skipClassProfile) steps.push("class_profile");

  steps.push("duration");

  const skipOrganization =
    answers.purpose === "assessment" ||
    (answers.purpose === "review" && answers.duration === 30);
  if (!skipOrganization) steps.push("organization");

  const skipResources =
    answers.classProfile === "demonstration" ||
    (answers.purpose === "review" && answers.duration === 30);
  if (!skipResources) steps.push("resources");

  steps.push("summary");
  return steps;
}

export function visibleStepDefs(
  answers: InterviewAnswers,
): AdaptiveStepDef[] {
  return resolveVisibleSteps(answers).map((id) => STEP_DEFS[id]);
}

export function canAdvance(
  stepId: InterviewStepId,
  answers: InterviewAnswers,
): boolean {
  switch (stepId) {
    case "topic":
      return answers.topic.trim().length >= 2;
    case "purpose":
      return answers.purpose != null;
    case "class_profile":
      return answers.classProfile != null;
    case "duration":
      return answers.duration != null;
    case "organization":
      return answers.organization != null;
    case "resources":
      return (
        answers.resources.length > 0 &&
        (answers.resources.includes("other")
          ? answers.resourcesOther.trim().length > 0
          : true)
      );
    case "summary":
      return Boolean(answers.projectId && answers.purpose && answers.duration);
    default:
      return false;
  }
}

/** Apply smart defaults when a branch skips a step. */
export function applyBranchDefaults(
  answers: InterviewAnswers,
): InterviewAnswers {
  let next = { ...answers };

  if (next.purpose === "assessment" && !next.organization) {
    next = { ...next, organization: "individual" };
  }
  if (next.purpose === "review" && next.duration === 30 && !next.organization) {
    next = { ...next, organization: "mixed" };
  }
  if (next.purpose === "remedial" && !next.classProfile) {
    next = { ...next, classProfile: "support_needed" };
  }
  if (next.purpose === "enrichment" && !next.classProfile) {
    next = { ...next, classProfile: "high_performing" };
  }
  if (
    (next.classProfile === "demonstration" ||
      (next.purpose === "review" && next.duration === 30)) &&
    next.resources.length === 0
  ) {
    next = { ...next, resources: ["manual", "projector"] };
  }

  return next;
}
