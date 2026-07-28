import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DECISION_RULES,
  decidePedagogicalAction,
  evaluateDecisionRules,
  type DecisionContext,
  type LearningCanvas,
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

function ctx(
  partialCanvas: Partial<LearningCanvas>,
  state: Partial<DecisionContext["pedagogicalState"]> = {},
): DecisionContext {
  return {
    canvas: canvas(partialCanvas),
    pedagogicalState: {
      curriculumLoaded: false,
      competenciesLoaded: false,
      ...state,
    },
    conversationContext: { turnCount: 1 },
  };
}

describe("AI-002 Pedagogical Decision Engine — acceptance", () => {
  it("returns exactly one decision", () => {
    const decision = decidePedagogicalAction(
      ctx({ topic: "fractions" }),
    );
    assert.equal(typeof decision.action, "string");
    assert.equal(typeof decision.reason, "string");
    assert.ok(decision.action);
  });

  it("Rule 1: topic without grade → ASK_GRADE", () => {
    const decision = decidePedagogicalAction(
      ctx({ topic: "fractions", subject: "Matematică" }),
    );
    assert.equal(decision.action, "ASK_GRADE");
    assert.equal(decision.reason, "Curriculum selection depends on grade.");
  });

  it("Rule 2: grade without curriculum → LOAD_CURRICULUM", () => {
    const decision = decidePedagogicalAction(
      ctx({ topic: "fractions", grade: "Clasa a III-a" }),
    );
    assert.equal(decision.action, "LOAD_CURRICULUM");
  });

  it("Rule 3: curriculum loaded without competencies → LOAD_COMPETENCIES", () => {
    const decision = decidePedagogicalAction(
      ctx(
        { topic: "fractions", grade: "Clasa a III-a", curriculum: "Math III" },
        { curriculumLoaded: true },
      ),
    );
    assert.equal(decision.action, "LOAD_COMPETENCIES");
  });

  it("Rule 4: competencies without objectives → ASK_OBJECTIVES", () => {
    const decision = decidePedagogicalAction(
      ctx(
        {
          topic: "fractions",
          grade: "Clasa a III-a",
          curriculum: "Math III",
          competencies: ["Number sense"],
        },
        { curriculumLoaded: true, competenciesLoaded: true },
      ),
    );
    assert.equal(decision.action, "ASK_OBJECTIVES");
  });

  it("Rule 5: objectives without activities → ASK_ACTIVITIES", () => {
    const decision = decidePedagogicalAction(
      ctx(
        {
          topic: "fractions",
          grade: "Clasa a III-a",
          curriculum: "Math III",
          competencies: ["Number sense"],
          objectives: ["Compare unit fractions"],
        },
        { curriculumLoaded: true, competenciesLoaded: true },
      ),
    );
    assert.equal(decision.action, "ASK_ACTIVITIES");
  });

  it("Rule 6: activities without assessment → ASK_ASSESSMENT", () => {
    const decision = decidePedagogicalAction(
      ctx(
        {
          topic: "fractions",
          grade: "Clasa a III-a",
          curriculum: "Math III",
          competencies: ["Number sense"],
          objectives: ["Compare unit fractions"],
          activities: ["Fraction cards"],
        },
        { curriculumLoaded: true, competenciesLoaded: true },
      ),
    );
    assert.equal(decision.action, "ASK_ASSESSMENT");
  });

  it("Rule 7: assessment without resources → ASK_RESOURCES", () => {
    const decision = decidePedagogicalAction(
      ctx(
        {
          topic: "fractions",
          grade: "Clasa a III-a",
          curriculum: "Math III",
          competencies: ["Number sense"],
          objectives: ["Compare unit fractions"],
          activities: ["Fraction cards"],
          assessment: ["Exit ticket"],
        },
        { curriculumLoaded: true, competenciesLoaded: true },
      ),
    );
    assert.equal(decision.action, "ASK_RESOURCES");
  });

  it("Rule 8: all mandatory sections complete → GENERATE_BLUEPRINT", () => {
    const decision = decidePedagogicalAction(
      ctx(
        {
          topic: "fractions",
          grade: "Clasa a III-a",
          curriculum: "Math III",
          competencies: ["Number sense"],
          objectives: ["Compare unit fractions"],
          activities: ["Fraction cards"],
          assessment: ["Exit ticket"],
          resources: ["Manipulatives"],
        },
        { curriculumLoaded: true, competenciesLoaded: true },
      ),
    );
    assert.equal(decision.action, "GENERATE_BLUEPRINT");
  });

  it("evaluates rules top to bottom — first match wins", () => {
    const { matchedRule } = evaluateDecisionRules(
      ctx({ topic: "fractions", grade: "Clasa a III-a" }),
    );
    assert.equal(matchedRule?.id, "R2_LOAD_CURRICULUM");
    assert.equal(DECISION_RULES[0]!.id, "R1_ASK_GRADE");
  });

  it("returns NONE when no rule matches", () => {
    const decision = decidePedagogicalAction(ctx({}));
    assert.equal(decision.action, "NONE");
  });
});
