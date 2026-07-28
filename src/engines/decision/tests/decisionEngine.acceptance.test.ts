import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createDecisionSession,
  processTeacherTurn,
  approveBlueprint,
  SECTION_ORDER,
  APPROVAL_REQUIRED_SECTIONS,
} from "../index";

async function turn(
  session: ReturnType<typeof createDecisionSession>,
  text: string,
) {
  return processTeacherTurn(session, text);
}

describe("IT-003 Pedagogical Decision Engine — acceptance", () => {
  it("never repeats exact questions across turns", async () => {
    let session = createDecisionSession();
    const r1 = await turn(session, "ok");
    session = r1.session;
    const q1 = r1.output.nextAction.question;

    const r2 = await turn(session, "ok");
    session = r2.session;
    const q2 = r2.output.nextAction.question;

    assert.notEqual(q1, q2);
    assert.equal(new Set(session.conversation.askedQuestions).size, session.conversation.askedQuestions.length);
  });

  it("never skips mandatory Blueprint sections", async () => {
    let session = createDecisionSession();
    const r1 = await turn(
      session,
      "I want a Mathematics lesson for Grade III about fractions.",
    );
    session = r1.session;

    const next = r1.output.nextAction.sectionId;
    const nextIndex = SECTION_ORDER.indexOf(next);
    const assessmentIndex = SECTION_ORDER.indexOf("assessment");

    assert.ok(nextIndex >= 0);
    assert.ok(
      nextIndex < assessmentIndex,
      `Must not jump to assessment; got ${next}`,
    );
    assert.ok(
      next === "competencies" ||
        next === "objectives" ||
        next === "learning_context",
      `Expected early section, got ${next}`,
    );
  });

  it("detects contradictions and stops progression", async () => {
    let session = createDecisionSession();
    let r = await turn(
      session,
      "Mathematics lesson for Grade III about fractions.",
    );
    session = r.session;

    // Advance until objectives if needed
    while (
      r.output.nextAction.objectiveId !== "capture_objectives" &&
      session.conversation.utterances.length < 8
    ) {
      r = await turn(session, "Number sense with fractions");
      session = r.session;
      if (r.output.nextAction.objectiveId === "capture_objectives") break;
    }

    r = await turn(session, "Explain the photosynthesis process clearly");
    session = r.session;

    assert.equal(r.output.nextAction.objectiveId, "clarify_contradiction");
    assert.equal(r.output.nextAction.requiresClarification, true);
    assert.ok(
      r.output.missingInformation.some((item) => item.kind === "contradictory"),
    );
    assert.equal(r.output.approvalRecommendation.readyForApproval, false);
  });

  it("updates Blueprint Live section facts after meaningful answers", async () => {
    let session = createDecisionSession();
    const r = await turn(
      session,
      "I want a Mathematics lesson for Grade III about fractions.",
    );

    assert.ok(r.output.updatedSections.includes("learning_context"));
    assert.equal(r.output.blueprint.learningContext.subject, "Matematică");
    assert.equal(r.output.blueprint.learningContext.grade, "Clasa a III-a");
    assert.equal(r.output.blueprint.learningContext.topic, "fractions");
    assert.ok(r.output.trace.some((t) => t.stage === "update_blueprint_live"));
  });

  it("calculates confidence for every Blueprint section", async () => {
    let session = createDecisionSession();
    const r = await turn(
      session,
      "I want a Mathematics lesson for Grade III about fractions.",
    );

    for (const sectionId of SECTION_ORDER) {
      assert.ok(r.output.confidenceMap[sectionId], `missing ${sectionId}`);
      assert.ok(
        ["high", "medium", "low", "unknown"].includes(
          r.output.confidenceMap[sectionId].level,
        ),
      );
    }
    assert.equal(r.output.confidenceMap.learning_context.level, "high");
  });

  it("produces exactly one pedagogical objective per interaction", async () => {
    let session = createDecisionSession();
    const r = await turn(
      session,
      "I want a Mathematics lesson for Grade III about fractions.",
    );

    assert.ok(r.output.nextAction.objectiveId);
    assert.ok(r.output.nextAction.question.includes("?"));
    const questionMarks = (r.output.nextAction.question.match(/\?/g) ?? [])
      .length;
    assert.equal(questionMarks, 1);
    assert.ok(r.output.latencyMs < 500);
  });

  it("teacher corrections override previous assumptions", async () => {
    let session = createDecisionSession();
    let r = await turn(session, "I have no idea. Help me.");
    session = r.session;
    assert.equal(session.blueprint.learningContext.grade, "Clasa a III-a");
    assert.ok(
      (session.blueprint.assumptions.learning_context?.length ?? 0) > 0,
    );

    r = await turn(session, "Actually Grade IV about decimals");
    session = r.session;

    assert.equal(session.blueprint.learningContext.grade, "Clasa a IV-a");
    assert.equal(session.blueprint.learningContext.topic, "decimals");
    assert.ok(session.blueprint.correctionsApplied.length > 0);
    assert.deepEqual(session.blueprint.assumptions.learning_context, []);
  });

  it("Ready For Approval works only when required sections are confident", async () => {
    let session = createDecisionSession();

    const script = [
      "I want a Mathematics lesson for Grade III about fractions.",
      "Apply number sense with unit fractions",
      "Students can identify unit fractions of a whole",
      "warm-up → explore with tiles → practise → close",
      "Pair work with fraction tiles and sorting cards",
      "Exit ticket: shade one third of a shape",
      "Fraction tiles and mini whiteboards",
      "Support with visuals; extend with mixed numbers",
      "I will notice if students can explain their shading",
    ];

    let last = await turn(session, script[0]);
    session = last.session;

    for (let i = 1; i < script.length; i += 1) {
      last = await turn(session, script[i]);
      session = last.session;
    }

    // Ensure required sections filled — drive remaining asks if planner still needs them
    let guard = 0;
    while (
      !last.output.approvalRecommendation.readyForApproval &&
      guard < 12
    ) {
      const objective = last.output.nextAction.objectiveId;
      const answer =
        objective === "capture_assessment"
          ? "Quick oral check during practise"
          : objective === "capture_resources"
            ? "Paper circles and crayons"
            : objective === "capture_learning_flow"
              ? "hook → explore → practise → reflect"
              : objective === "capture_objectives"
                ? "Name and show unit fractions"
                : objective === "clarify_contradiction"
                  ? "Keep Mathematics fractions focus"
                  : "Students work in pairs with concrete materials";
      last = await turn(session, answer);
      session = last.session;
      guard += 1;
    }

    for (const sectionId of APPROVAL_REQUIRED_SECTIONS) {
      const level = last.output.confidenceMap[sectionId].level;
      assert.ok(
        level === "high" || level === "medium",
        `${sectionId} should be medium/high, got ${level}`,
      );
    }

    assert.equal(last.output.approvalRecommendation.readyForApproval, true);
    assert.equal(last.output.generationReadiness, true);
    assert.equal(last.output.engineState, "ready_for_approval");

    const approved = approveBlueprint(session);
    assert.equal(approved.engineState, "approved");
  });
});
