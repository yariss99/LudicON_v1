import type {
  DecisionBlueprint,
  MissingInformationItem,
} from "../types";

export type ConsistencyResult = {
  ok: boolean;
  contradictions: MissingInformationItem[];
  notes: string[];
};

/**
 * Consistency Validator — contradictions stop progression.
 */
export async function validateConsistency(
  blueprint: DecisionBlueprint,
): Promise<ConsistencyResult> {
  const contradictions: MissingInformationItem[] = [];
  const notes: string[] = [];

  const ctx = blueprint.learningContext;

  // Duration vs flow complexity (soft)
  if (
    ctx.durationMinutes !== undefined &&
    ctx.durationMinutes < 20 &&
    blueprint.learningFlow.length > 0 &&
    /warm|explore|practise|practice|close|phase/i.test(
      blueprint.learningFlow.join(" "),
    )
  ) {
    notes.push(
      "Short duration with multi-phase Learning Flow — watch pacing.",
    );
  }

  // Objectives mentioning unrelated subject vs context subject
  if (ctx.subject && blueprint.objectives.length > 0) {
    const objText = blueprint.objectives.join(" ").toLowerCase();
    const subjectClash =
      (ctx.subject === "Matematică" &&
        /photosynth|noun|istorie|geograf/i.test(objText)) ||
      (ctx.subject === "Științe" && /fraction|fracț/i.test(objText));
    if (subjectClash) {
      contradictions.push({
        id: "contradiction_objective_subject",
        sectionId: "validation",
        kind: "contradictory",
        description: `Objective language conflicts with subject “${ctx.subject}”.`,
        field: "objectives",
      });
    }
  }

  // Explicit opposite grades in summary vs grade
  if (ctx.grade && ctx.summary) {
    const summaryGrade =
      /grade\s*iv|clasa\s*a?\s*iv|a\s*iv-a/i.test(ctx.summary) &&
      /iii|a\s*iii/i.test(ctx.grade);
    if (summaryGrade) {
      contradictions.push({
        id: "contradiction_grade",
        sectionId: "learning_context",
        kind: "contradictory",
        description: "Grade signals in the message conflict with captured grade.",
        field: "grade",
      });
    }
  }

  // Teacher correction that still leaves opposing list values
  if (
    blueprint.objectives.length >= 2 &&
    /not |instead|nu /i.test(blueprint.objectives.join(" "))
  ) {
    contradictions.push({
      id: "contradiction_objectives_list",
      sectionId: "objectives",
      kind: "contradictory",
      description: "Objectives list appears to contain opposing statements.",
    });
  }

  // Detect "not X" correction pattern left as contradictory assumption
  for (const [section, assumptions] of Object.entries(blueprint.assumptions)) {
    if ((assumptions?.length ?? 0) > 0 && blueprint.correctionsApplied.length) {
      const corrected = blueprint.correctionsApplied.some(
        (c) => c.sectionId === section,
      );
      if (corrected && (assumptions?.length ?? 0) > 0) {
        notes.push(
          `Assumptions for ${section} should be cleared after correction.`,
        );
      }
    }
  }

  return {
    ok: contradictions.length === 0,
    contradictions,
    notes,
  };
}
