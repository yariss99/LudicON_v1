import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validatePedagogicalDecision,
  type LearningCanvas,
  type PedagogicalDecision,
  type PedagogicalState,
} from "../index";

function canvas(partial: Partial<LearningCanvas> = {}): LearningCanvas {
  return {
    competencies: [],
    objectives: [],
    activities: [],
    assessment: [],
    resources: [],
    ...partial,
  };
}

function state(
  partial: Partial<PedagogicalState> = {},
): PedagogicalState {
  return {
    curriculumLoaded: false,
    competenciesLoaded: false,
    ...partial,
  };
}

function validate(
  decision: PedagogicalDecision | null,
  c: Partial<LearningCanvas> = {},
  s: Partial<PedagogicalState> = {},
) {
  return validatePedagogicalDecision({
    decision,
    canvas: canvas(c),
    pedagogicalState: state(s),
  });
}

describe("AI-002.5 Pedagogical Validation Layer — acceptance", () => {
  it("Rule 1: rejects missing decision", () => {
    const result = validate(null);
    assert.equal(result.approved, false);
    assert.ok(result.issues.some((i) => i.code === "DECISION_MISSING"));
  });

  it("Rule 2: rejects multiple actions", () => {
    const decision = {
      action: "ASK_GRADE",
      reason: "Curriculum selection depends on grade.",
      actions: ["ASK_GRADE", "ASK_OBJECTIVES"],
    } as PedagogicalDecision;
    const result = validate(decision, { topic: "fractions" });
    assert.equal(result.approved, false);
    assert.ok(result.issues.some((i) => i.code === "MULTIPLE_ACTIONS"));
  });

  it("Rule 3: rejects empty reason", () => {
    const result = validate(
      { action: "ASK_GRADE", reason: "   " },
      { topic: "fractions" },
    );
    assert.equal(result.approved, false);
    assert.ok(result.issues.some((i) => i.code === "EMPTY_REASON"));
  });

  it("Rule 4: ASK_GRADE invalid when grade already on canvas", () => {
    const result = validate(
      {
        action: "ASK_GRADE",
        reason: "Curriculum selection depends on grade.",
      },
      { topic: "fractions", grade: "Clasa a III-a" },
    );
    assert.equal(result.approved, false);
    assert.ok(result.issues.some((i) => i.code === "INCOMPATIBLE_WITH_CANVAS"));
    assert.match(result.issues[0]!.message, /Grade/i);
  });

  it("Rule 5: GENERATE_BLUEPRINT rejected when mandatory sections incomplete", () => {
    const result = validate(
      {
        action: "GENERATE_BLUEPRINT",
        reason: "All mandatory Learning Canvas sections are complete.",
      },
      { topic: "fractions", grade: "Clasa a III-a" },
    );
    assert.equal(result.approved, false);
    assert.ok(result.issues.some((i) => i.code === "GENERATE_PRECONDITIONS"));
  });

  it("Rule 5: GENERATE_BLUEPRINT approved when mandatory sections complete", () => {
    const result = validate(
      {
        action: "GENERATE_BLUEPRINT",
        reason: "All mandatory Learning Canvas sections are complete.",
      },
      {
        topic: "fractions",
        grade: "Clasa a III-a",
        curriculum: "Math III",
        competencies: ["Number sense"],
        objectives: ["Compare fractions"],
        activities: ["Cards"],
        assessment: ["Exit ticket"],
        resources: ["Manipulatives"],
      },
      { curriculumLoaded: true, competenciesLoaded: true },
    );
    assert.equal(result.approved, true);
    assert.equal(result.issues.length, 0);
  });

  it("Rule 6: rejects ASK_OBJECTIVES when objectives completed", () => {
    const result = validate(
      {
        action: "ASK_OBJECTIVES",
        reason: "Clear objectives guide activities and assessment.",
      },
      {
        topic: "fractions",
        grade: "III",
        curriculum: "Math",
        competencies: ["C1"],
        objectives: ["Already set"],
      },
      {
        curriculumLoaded: true,
        competenciesLoaded: true,
        completedSections: { objectives: true },
      },
    );
    assert.equal(result.approved, false);
    assert.ok(
      result.issues.some((i) => i.code === "CONTRADICTS_PEDAGOGICAL_STATE"),
    );
  });

  it("Rule 7: rejects unknown actions", () => {
    const result = validate(
      {
        action: "ASK_FAVORITE_COLOR" as PedagogicalDecision["action"],
        reason: "Curiosity.",
      },
      { topic: "fractions" },
    );
    assert.equal(result.approved, false);
    assert.ok(result.issues.some((i) => i.code === "UNKNOWN_ACTION"));
  });

  it("approves a compatible ASK_GRADE decision", () => {
    const result = validate(
      {
        action: "ASK_GRADE",
        reason: "Curriculum selection depends on grade.",
      },
      { topic: "fractions", subject: "Matematică" },
    );
    assert.equal(result.approved, true);
    assert.equal(result.validatedDecision.action, "ASK_GRADE");
  });

  it("never throws on unexpected input", () => {
    const result = validatePedagogicalDecision({
      decision: undefined,
      canvas: canvas(),
      pedagogicalState: state(),
    });
    assert.equal(result.approved, false);
  });
});
