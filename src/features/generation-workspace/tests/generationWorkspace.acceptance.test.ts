import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createDecisionSession,
  processTeacherTurn,
  type DecisionSession,
} from "../../../engines/decision";
import { reviewOrchestrator } from "../../blueprint-review/services/reviewOrchestrator";
import type { BlueprintReviewDocument } from "../../blueprint-review/types";
import { generationOrchestrator } from "../services/generationOrchestrator";
import { dependencyTracker } from "../services/dependencyTracker";
import { assetRegistry } from "../services/assetRegistry";
import { ASSET_CATALOG } from "../constants";

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
  while (session.engineState !== "ready_for_approval" && guard < 12) {
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

async function approvedBlueprint(): Promise<BlueprintReviewDocument> {
  const session = await buildReadySession();
  let doc = await reviewOrchestrator.createFromDecisionSession(session);
  doc = await reviewOrchestrator.runValidation(doc);
  const approved = reviewOrchestrator.approve(doc, "Approve for generation");
  assert.ok(!("error" in approved));
  return approved;
}

describe("IT-005 Generation Workspace — acceptance", () => {
  it("rejects generation when Blueprint is not approved", async () => {
    const session = createDecisionSession();
    const partial = await processTeacherTurn(
      session,
      "Mathematics for Grade III about fractions",
    );
    const draft = await reviewOrchestrator.createFromDecisionSession(
      partial.session,
    );
    const gate = generationOrchestrator.assertApproved(draft);
    assert.ok(gate);
    const opened = generationOrchestrator.openFromApprovedBlueprint(draft);
    assert.ok("error" in opened);
  });

  it("opens workspace only from approved Blueprint and links version", async () => {
    const review = await approvedBlueprint();
    const workspace = generationOrchestrator.openFromApprovedBlueprint(review);
    assert.ok(!("error" in workspace));
    assert.equal(workspace.blueprintId, review.id);
    assert.equal(
      workspace.approvedBlueprintVersionId,
      review.approvalEvent?.versionId,
    );
    assert.ok(workspace.blueprintSnapshot.learningContext.topic);
  });

  it("catalog lists all asset types for automatic future expansion", () => {
    const list = assetRegistry.list();
    assert.equal(list.length, ASSET_CATALOG.length);
    assert.ok(list.some((a) => a.id === "lesson_plan"));
    assert.ok(list.some((a) => a.id === "parent_communication"));
  });

  it("generates an asset from Blueprint with live pipeline and version", async () => {
    const review = await approvedBlueprint();
    let workspace = generationOrchestrator.openFromApprovedBlueprint(review);
    assert.ok(!("error" in workspace));

    const stages: string[] = [];
    workspace = await generationOrchestrator.generate(
      workspace,
      "lesson_plan",
      "entire_asset",
      undefined,
      {
        stageDelayMs: 0,
        onProgress: (event) => stages.push(event.stage),
      },
    );

    const asset = workspace.assets.lesson_plan;
    assert.equal(asset.status, "completed");
    assert.equal(asset.pipelineStage, "available");
    assert.ok(asset.currentVersionId);
    assert.ok(asset.versions.length >= 1);
    assert.equal(
      asset.sourceBlueprintVersionId,
      workspace.approvedBlueprintVersionId,
    );
    assert.ok(stages.includes("preparing"));
    assert.ok(stages.includes("generating"));
    assert.ok(stages.includes("available"));
    assert.ok(asset.versions[0].quality.metrics.length >= 5);
  });

  it("supports multi-asset queue independently", async () => {
    const review = await approvedBlueprint();
    let workspace = generationOrchestrator.openFromApprovedBlueprint(review);
    assert.ok(!("error" in workspace));

    workspace = generationOrchestrator.enqueue(workspace, "worksheet");
    workspace = generationOrchestrator.enqueue(workspace, "assessment");
    assert.equal(
      workspace.queue.filter((q) => q.status === "queued").length,
      2,
    );

    workspace = await generationOrchestrator.processQueue(workspace, {
      stageDelayMs: 0,
    });

    assert.equal(workspace.assets.worksheet.status, "completed");
    assert.equal(workspace.assets.assessment.status, "completed");
  });

  it("supports scoped regeneration without wiping prior version history", async () => {
    const review = await approvedBlueprint();
    let workspace = generationOrchestrator.openFromApprovedBlueprint(review);
    assert.ok(!("error" in workspace));

    workspace = await generationOrchestrator.generate(
      workspace,
      "classroom_activities",
      "entire_asset",
      undefined,
      { stageDelayMs: 0 },
    );
    const firstVersionId = workspace.assets.classroom_activities.currentVersionId;

    workspace = await generationOrchestrator.generate(
      workspace,
      "classroom_activities",
      "selected_activity",
      "activity",
      { stageDelayMs: 0 },
    );

    const asset = workspace.assets.classroom_activities;
    assert.ok(asset.versions.length >= 2);
    assert.notEqual(asset.currentVersionId, firstVersionId);
    assert.ok(asset.versions.some((v) => v.id === firstVersionId));
  });

  it("detects outdated assets when Blueprint version changes", async () => {
    const review = await approvedBlueprint();
    let workspace = generationOrchestrator.openFromApprovedBlueprint(review);
    assert.ok(!("error" in workspace));

    workspace = await generationOrchestrator.generate(
      workspace,
      "teacher_notes",
      "entire_asset",
      undefined,
      { stageDelayMs: 0 },
    );

    workspace = dependencyTracker.markOutdatedForBlueprintVersion(
      workspace,
      "bpv_new_version",
    );

    assert.equal(workspace.assets.teacher_notes.status, "needs_update");
    assert.equal(workspace.assets.teacher_notes.outdated, true);

    workspace = generationOrchestrator.keepOutdated(workspace, "teacher_notes");
    assert.equal(workspace.assets.teacher_notes.outdated, false);
    assert.equal(workspace.assets.teacher_notes.status, "completed");
  });

  it("preserves previous successful version when a stage fails", async () => {
    const review = await approvedBlueprint();
    let workspace = generationOrchestrator.openFromApprovedBlueprint(review);
    assert.ok(!("error" in workspace));

    workspace = await generationOrchestrator.generate(
      workspace,
      "story",
      "entire_asset",
      undefined,
      { stageDelayMs: 0 },
    );
    const goodId = workspace.assets.story.currentVersionId;
    assert.ok(goodId);

    workspace = generationOrchestrator.enqueue(workspace, "story");
    workspace = await generationOrchestrator.processNext(workspace, {
      stageDelayMs: 0,
      failAtStage: "generating",
    });

    const asset = workspace.assets.story;
    assert.ok(asset.errorMessage);
    assert.equal(asset.currentVersionId, goodId);
    assert.ok(asset.versions.some((v) => v.id === goodId && v.preserved));
  });

  it("exposes quality indicators with explanations", async () => {
    const review = await approvedBlueprint();
    let workspace = generationOrchestrator.openFromApprovedBlueprint(review);
    assert.ok(!("error" in workspace));
    workspace = await generationOrchestrator.generate(
      workspace,
      "rubric",
      "entire_asset",
      undefined,
      { stageDelayMs: 0 },
    );
    const quality = workspace.assets.rubric.versions[0]?.quality;
    assert.ok(quality);
    for (const metric of quality.metrics) {
      assert.ok(metric.label);
      assert.ok(metric.explanation);
      assert.ok(metric.score >= 0 && metric.score <= 1);
    }
  });
});
