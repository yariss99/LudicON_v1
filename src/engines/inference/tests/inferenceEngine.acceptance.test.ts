import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  runPedagogicalInference,
  type InferenceContext,
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
  message: string,
  partialCanvas: Partial<LearningCanvas> = {},
): InferenceContext {
  return {
    teacherMessage: message,
    canvas: canvas(partialCanvas),
    pedagogicalState: {
      curriculumLoaded: false,
      competenciesLoaded: false,
    },
    conversationContext: { turnCount: 1 },
  };
}

describe("AI-003 Pedagogical Inference Engine — acceptance", () => {
  it("Rule 1: Fractions → Subject = Mathematics (HIGH)", () => {
    const result = runPedagogicalInference(ctx("Fractions"));
    const subject = result.inferredFacts.find((f) => f.field === "subject");
    assert.ok(subject);
    assert.equal(subject!.value, "Mathematics");
    assert.equal(subject!.confidence, "HIGH");
    assert.equal(subject!.source, "RULE");
    assert.equal(result.updatedCanvas.subject, "Mathematics");
  });

  it("Rule 2: Class III → Grade = III", () => {
    const result = runPedagogicalInference(ctx("Class III fractions"));
    const grade = result.inferredFacts.find((f) => f.field === "grade");
    assert.ok(grade);
    assert.equal(grade!.value, "III");
    assert.equal(result.updatedCanvas.grade, "III");
  });

  it("Rule 3: Revision → Lesson Phase = Consolidation", () => {
    const result = runPedagogicalInference(ctx("This is a revision lesson"));
    const phase = result.inferredFacts.find((f) => f.field === "lessonPhase");
    assert.ok(phase);
    assert.equal(phase!.value, "Consolidation");
  });

  it("Rule 4: Evaluation → Lesson Phase = Assessment", () => {
    const result = runPedagogicalInference(ctx("Evaluation at the end"));
    const phase = result.inferredFacts.find((f) => f.field === "lessonPhase");
    assert.ok(phase);
    assert.equal(phase!.value, "Assessment");
  });

  it("Rule 5: never overwrites teacher-provided subject", () => {
    const result = runPedagogicalInference(
      ctx("Fractions", { subject: "Science" }),
    );
    assert.equal(
      result.inferredFacts.some((f) => f.field === "subject"),
      false,
    );
    assert.equal(result.updatedCanvas.subject, "Science");
  });

  it("Rule 6: never infers grade when canvas already has grade", () => {
    const result = runPedagogicalInference(
      ctx("Class III", { grade: "IV" }),
    );
    assert.equal(result.inferredFacts.some((f) => f.field === "grade"), false);
    assert.equal(result.updatedCanvas.grade, "IV");
  });

  it("does not invent facts without keyword evidence", () => {
    const result = runPedagogicalInference(ctx("Hello there"));
    assert.equal(result.inferredFacts.length, 0);
    assert.equal(result.confidence, "LOW");
  });

  it("enriches canvas so Decision Engine can skip subject gaps", () => {
    const result = runPedagogicalInference(
      ctx("Fractions", { topic: "Fractions" }),
    );
    assert.equal(result.updatedCanvas.topic, "Fractions");
    assert.equal(result.updatedCanvas.subject, "Mathematics");
    assert.equal(result.updatedCanvas.grade, undefined);
  });
});
