import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createDecisionSession,
  processTeacherTurn,
  type DecisionSession,
} from "../../../engines/decision";
import { reviewOrchestrator } from "../services/reviewOrchestrator";
import { approvalManager } from "../services/approvalManager";
import { validateBlueprint } from "../services/blueprintValidator";
import { versionManager } from "../services/versionManager";

async function buildReadySession(): Promise<DecisionSession> {
  let session = createDecisionSession();
  const script = [
    "I want a Mathematics lesson for Grade III about fractions.",
    "Apply number sense with unit fractions",
    "Students can identify unit fractions of a whole",
    "warm-up → explore → practise → close",
    "Pair work with fraction tiles",
    "Exit ticket: shade one third",
    "Fraction tiles and mini whiteboards",
    "Support with visuals; extend with mixed numbers",
    "I will notice if students can explain their shading",
  ];

  for (const line of script) {
    const result = await processTeacherTurn(session, line);
    session = result.session;
  }

  let guard = 0;
  while (
    session.engineState !== "ready_for_approval" &&
    guard < 12
  ) {
    const objective = session.lastOutput?.nextAction.objectiveId;
    const answer =
      objective === "capture_assessment"
        ? "Quick oral check during practise"
        : objective === "capture_resources"
          ? "Paper circles and crayons"
          : objective === "capture_learning_flow"
            ? "hook → explore → practise → reflect"
            : objective === "capture_objectives"
              ? "Name and show unit fractions"
              : "Students work in pairs with concrete materials";
    const result = await processTeacherTurn(session, answer);
    session = result.session;
    guard += 1;
  }

  return session;
}

describe("IT-004 Blueprint Review & Approval — acceptance", () => {
  it("shows validation explaining detected issues", async () => {
    const session = createDecisionSession();
    const partial = await processTeacherTurn(
      session,
      "Mathematics for Grade III about fractions",
    );
    const doc = await reviewOrchestrator.createFromDecisionSession(
      partial.session,
    );

    assert.ok(doc.validation);
    assert.equal(doc.validation.readyForApproval, false);
    assert.ok(doc.validation.blockingReasons.length > 0);
    assert.ok(
      doc.validation.issues.length > 0 ||
        doc.validation.missingInformation.some((m) => m.kind === "missing"),
    );
    assert.ok(
      ["incomplete", "needs_review", "good", "excellent"].includes(
        doc.validation.status,
      ),
    );
  });

  it("improves a section through Decision Engine conversation (not forms)", async () => {
    const session = await buildReadySession();
    let doc = await reviewOrchestrator.createFromDecisionSession(session);
    const before = doc.blueprint.objectives[0];

    doc = await reviewOrchestrator.requestImprovement(
      doc,
      "Improve the objectives.",
    );

    assert.ok(doc.blueprint.objectives[0]);
    assert.notEqual(doc.blueprint.objectives[0], before);
    assert.ok(
      doc.revisionLog.some((r) => r.sectionId === "objectives"),
    );
    assert.ok(doc.versions.length >= 2);
    assert.ok(doc.validation);
  });

  it("blocks approval while mandatory issues exist", async () => {
    const session = createDecisionSession();
    const partial = await processTeacherTurn(
      session,
      "Mathematics for Grade III about fractions",
    );
    const doc = await reviewOrchestrator.createFromDecisionSession(
      partial.session,
    );

    const gate = approvalManager.canApprove(doc);
    assert.equal(gate.ok, false);
    assert.ok(gate.reasons.length > 0);

    const result = reviewOrchestrator.approve(doc);
    assert.ok("error" in result);
  });

  it("approves only when validation is Ready and freezes version", async () => {
    const session = await buildReadySession();
    let doc = await reviewOrchestrator.createFromDecisionSession(session);
    doc = await reviewOrchestrator.runValidation(doc);

    assert.equal(doc.validation?.readyForApproval, true);

    const result = reviewOrchestrator.approve(doc, "Looks coherent");
    assert.ok(!("error" in result));
    assert.equal(result.lifecycleState, "approved");
    assert.equal(result.approvalState, "frozen");
    assert.equal(result.generationUnlocked, true);
    assert.ok(result.approvalEvent);
    assert.ok(result.versions.some((v) => v.frozen && v.lifecycleState === "approved"));
  });

  it("preserves version history and restores previous versions", async () => {
    const session = await buildReadySession();
    let doc = await reviewOrchestrator.createFromDecisionSession(session);
    const originalObjective = doc.blueprint.objectives[0];

    doc = await reviewOrchestrator.requestImprovement(
      doc,
      "Improve the objectives.",
    );
    const previousId = doc.previousVersionId;
    assert.ok(previousId);

    const restored = await reviewOrchestrator.restoreAndValidate(
      doc,
      previousId!,
    );
    assert.ok(!("error" in restored));
    assert.equal(restored.blueprint.objectives[0], originalObjective);
    assert.equal(restored.lifecycleState, "needs_revision");
    assert.equal(restored.generationUnlocked, false);
  });

  it("comparison view reports added/removed/modified", async () => {
    const session = await buildReadySession();
    let doc = await reviewOrchestrator.createFromDecisionSession(session);
    const leftId = doc.currentVersionId;

    doc = await reviewOrchestrator.requestImprovement(
      doc,
      "Make activities more collaborative.",
    );
    const rightId = doc.currentVersionId;

    const comparison = reviewOrchestrator.compare(doc, leftId, rightId);
    assert.ok(comparison);
    assert.ok(
      comparison!.diffs.some(
        (d) =>
          d.sectionId === "activities" &&
          (d.kind === "modified" || d.kind === "added"),
      ),
    );
  });

  it("Blueprint is frozen after approval — generation unlocked only then", async () => {
    const session = await buildReadySession();
    let doc = await reviewOrchestrator.createFromDecisionSession(session);
    assert.equal(doc.generationUnlocked, false);

    const approved = reviewOrchestrator.approve(doc);
    assert.ok(!("error" in approved));
    assert.equal(approved.generationUnlocked, true);
    assert.equal(approved.approvalState, "frozen");

    // Further improvement re-opens revision and locks generation again
    const revised = await reviewOrchestrator.requestImprovement(
      approved,
      "Assessment should be formative.",
    );
    assert.equal(revised.lifecycleState, "needs_revision");
    assert.equal(revised.generationUnlocked, false);
  });

  it("section views cover entire Blueprint without form fields", async () => {
    const session = await buildReadySession();
    const doc = await reviewOrchestrator.createFromDecisionSession(session);
    const views = reviewOrchestrator.getSectionViews(doc);

    assert.equal(views.length, 9);
    for (const view of views) {
      assert.ok(view.title);
      assert.ok(view.pedagogicalSummary);
      assert.ok(view.confidenceLevel);
      assert.ok(
        ["completed", "needs_review", "incomplete"].includes(view.navStatus),
      );
    }
  });

  it("validator refreshes immediately after modification", async () => {
    const session = await buildReadySession();
    let doc = await reviewOrchestrator.createFromDecisionSession(session);
    const beforeAssessment = doc.blueprint.assessment[0];
    const beforeLogCount = doc.revisionLog.length;

    await new Promise((resolve) => setTimeout(resolve, 5));

    doc = await reviewOrchestrator.requestImprovement(
      doc,
      "Assessment should be formative.",
    );

    assert.ok(doc.validation?.validatedAt);
    assert.ok(doc.revisionLog.length > beforeLogCount);
    assert.ok(doc.blueprint.assessment[0]);
    assert.notEqual(doc.blueprint.assessment[0], beforeAssessment);

    const report = await validateBlueprint({
      blueprint: doc.blueprint,
      confidenceMap: doc.confidenceMap,
    });
    assert.ok(report.validatedAt);
  });

  it("version manager never loses lineage on create", () => {
    const session = createDecisionSession();
    session.blueprint.learningContext = {
      subject: "Matematică",
      grade: "Clasa a III-a",
      topic: "fractions",
    };
    const seed = versionManager.seedInitial({
      author: "Test Teacher",
      blueprint: session.blueprint,
      confidenceMap: {
        learning_context: {
          sectionId: "learning_context",
          level: "high",
          score: 0.9,
          rationale: "test",
        },
      } as never,
    });
    assert.equal(seed.versionLabel, "v0.1");
    assert.equal(seed.frozen, false);
  });
});
