import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createDecisionSession,
  processTeacherTurn,
  type DecisionSession,
} from "../../../engines/decision";
import { reviewOrchestrator } from "../../blueprint-review/services/reviewOrchestrator";
import { generationOrchestrator } from "../../generation-workspace/services/generationOrchestrator";
import { assetVersionManager } from "../../generation-workspace/services/assetVersionManager";
import { dependencyTracker } from "../../generation-workspace/services/dependencyTracker";
import { studioOrchestrator } from "../services/studioOrchestrator";
import { checkAlignment } from "../services/alignmentService";
import { STRUCTURE_TEMPLATES } from "../constants";
import type { AssetStudioDocument } from "../types";

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
    session = (await processTeacherTurn(session, line)).session;
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
    session = (await processTeacherTurn(session, answer)).session;
    guard += 1;
  }
  return session;
}

async function openStudio(): Promise<AssetStudioDocument> {
  const session = await buildReadySession();
  let review = await reviewOrchestrator.createFromDecisionSession(session);
  review = await reviewOrchestrator.runValidation(review);
  const approved = reviewOrchestrator.approve(review, "Approve");
  assert.ok(!("error" in approved));

  let workspace = generationOrchestrator.openFromApprovedBlueprint(approved);
  assert.ok(!("error" in workspace));
  workspace = await generationOrchestrator.generate(
    workspace,
    "lesson_plan",
    "entire_asset",
    undefined,
    { stageDelayMs: 0 },
  );

  const asset = workspace.assets.lesson_plan;
  return studioOrchestrator.open({
    workspaceId: workspace.id,
    blueprintId: workspace.blueprintId,
    assetTypeId: "lesson_plan",
    title: "Lesson Plan Studio",
    blueprintVersionId: workspace.approvedBlueprintVersionId,
    blueprintVersionLabel: workspace.approvedBlueprintVersionLabel,
    blueprintSnapshot: workspace.blueprintSnapshot,
    blocks: assetVersionManager.currentBlocks(asset),
    relatedAssetTypeIds: dependencyTracker.relatedAssets("lesson_plan"),
    author: "Test Teacher",
  });
}

describe("IT-006 Asset Studio — acceptance", () => {
  it("opens from generated asset and preserves Blueprint linkage", async () => {
    const doc = await openStudio();
    assert.ok(doc.blueprintId);
    assert.ok(doc.blueprintVersionId);
    assert.ok(doc.blueprintSnapshot.learningContext.topic);
    assert.ok(doc.nodes.length > 0);
    assert.equal(doc.assetTypeId, "lesson_plan");
  });

  it("exposes navigable asset structure", async () => {
    const doc = await openStudio();
    const structure = studioOrchestrator.structure(doc);
    assert.ok(structure.length >= 3);
    assert.ok(structure.every((item) => item.title && item.id));
  });

  it("checks alignment live when teacher edits", async () => {
    let doc = await openStudio();
    const objectiveNode =
      doc.nodes.find((n) => n.sourceSections.includes("objectives")) ??
      doc.nodes[1] ??
      doc.nodes[0];
    doc = studioOrchestrator.updateNodeBody(
      doc,
      objectiveNode.id,
      "Students will explain the photosynthesis process clearly.",
    );
    assert.ok(doc.alignment);
    assert.ok(
      doc.alignment.status === "warning" || doc.alignment.status === "conflict",
    );
    assert.ok(doc.alignment.issues.length > 0);
    // Blueprint relationship untouched
    assert.ok(doc.blueprintVersionId);
  });

  it("smart commands propose changes and require teacher approval", async () => {
    let doc = await openStudio();
    doc = studioOrchestrator.selectNode(doc, doc.nodes[1]?.id ?? doc.nodes[0].id);
    const proposed = studioOrchestrator.requestSmartCommand(
      doc,
      "Make this collaborative.",
    );
    assert.ok(!("error" in proposed));
    assert.equal(proposed.pendingProposal?.status, "pending");

    const before = proposed.nodes.find(
      (n) => n.id === proposed.pendingProposal?.nodeId,
    )?.body;
    doc = studioOrchestrator.decideSmartCommand(proposed, true);
    const after = doc.nodes.find(
      (n) => n.id === doc.pendingProposal?.nodeId,
    )?.body;
    assert.equal(doc.pendingProposal?.status, "approved");
    assert.notEqual(after, before);
  });

  it("every save creates a revision that can be restored", async () => {
    let doc = await openStudio();
    const firstRevision = doc.currentRevisionId;
    const nodeId = doc.nodes[0].id;
    const original = doc.nodes[0].body;

    doc = studioOrchestrator.updateNodeBody(doc, nodeId, `${original} (edited)`);
    doc = studioOrchestrator.saveRevision(doc, "Teacher edit");
    assert.notEqual(doc.currentRevisionId, firstRevision);
    assert.ok(doc.revisions.length >= 2);

    const restored = studioOrchestrator.restoreRevision(doc, firstRevision);
    assert.ok(!("error" in restored));
    assert.equal(
      restored.nodes.find((n) => n.id === nodeId)?.body,
      original,
    );
  });

  it("supports duplicate and branch without losing Blueprint origin", async () => {
    let doc = await openStudio();
    const origin = doc.blueprintVersionId;
    doc = studioOrchestrator.duplicate(doc);
    doc = studioOrchestrator.branch(doc, "Experiment A");
    assert.equal(doc.blueprintVersionId, origin);
    assert.ok(doc.revisions.some((r) => r.kind === "duplicate"));
    assert.ok(doc.revisions.some((r) => r.kind === "branch"));
  });

  it("comments can be added and resolved", async () => {
    let doc = await openStudio();
    const nodeId = doc.nodes[0].id;
    doc = studioOrchestrator.addComment(doc, nodeId, "Check pacing here");
    assert.equal(doc.comments[0]?.status, "open");
    doc = studioOrchestrator.resolveComment(doc, doc.comments[0].id);
    assert.equal(doc.comments[0]?.status, "resolved");
  });

  it("export preserves Blueprint reference in payload", async () => {
    const doc = await openStudio();
    const exported = studioOrchestrator.export(doc, "html");
    assert.equal(exported.available, true);
    assert.match(exported.content, /Blueprint/);
    assert.match(exported.content, new RegExp(doc.blueprintVersionLabel));

    const scorm = studioOrchestrator.export(doc, "scorm");
    assert.equal(scorm.available, false);
  });

  it("future asset types register structure templates automatically", () => {
    assert.ok(STRUCTURE_TEMPLATES.lesson_plan?.length);
    assert.ok(STRUCTURE_TEMPLATES.homework?.length);
    // Parent communication may use fallback template — catalog still opens via generation registry
    const report = checkAlignment([], {
      learningContext: {},
      competencies: [],
      objectives: [],
      learningFlow: [],
      activities: [],
      assessment: [],
      resources: [],
      differentiation: [],
      reflection: [],
      assumptions: {},
      correctionsApplied: [],
    });
    assert.equal(report.status, "aligned");
  });

  it("alignment Keep / Revise / Update Blueprint decisions work", async () => {
    let doc = await openStudio();
    const objectiveNode =
      doc.nodes.find((n) => n.sourceSections.includes("objectives")) ??
      doc.nodes[1] ??
      doc.nodes[0];
    doc = studioOrchestrator.updateNodeBody(
      doc,
      objectiveNode.id,
      "Students will explain the photosynthesis process clearly.",
    );
    const issue = doc.alignment?.issues[0];
    assert.ok(issue);

    const kept = studioOrchestrator.resolveAlignment(doc, issue!.id, "keep");
    assert.ok(!("blueprintReview" in kept));
    assert.ok(!kept.alignment?.issues.some((i) => i.id === issue!.id));

    const toBlueprint = studioOrchestrator.resolveAlignment(
      doc,
      issue!.id,
      "update_blueprint",
    );
    assert.ok("blueprintReview" in toBlueprint);
  });
});
