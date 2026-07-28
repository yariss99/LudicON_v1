import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  addObservation,
  getClassDashboard,
  getProfile,
  pieHandoffForClass,
  resolveSuggestion,
  sliStore,
  studentLearningEngine,
} from "../index";

describe("FEATURE-008 Student Learning Intelligence", () => {
  beforeEach(() => {
    sliStore.resetSeed();
  });

  it("builds a class dashboard without ranking fields", () => {
    const { dashboard } = getClassDashboard();
    assert.equal(dashboard.rankingForbidden, true);
    assert.equal("rankings" in dashboard, false);
    assert.ok(dashboard.objectives.length >= 1);
    assert.ok(dashboard.competencies.length >= 1);
    assert.ok(dashboard.insights.every((i) => i.descriptiveOnly));
  });

  it("creates privacy-safe learner profiles that forbid evaluation", () => {
    const profile = getProfile("lrn_02");
    assert.ok(profile);
    assert.equal(profile?.evaluationForbidden, true);
    assert.equal(profile?.alias.displayName.startsWith("Elev"), true);
    assert.ok(profile?.misconceptionTags.includes("perimeter_vs_area"));
  });

  it("detects misconceptions with instructional actions", () => {
    const { dashboard } = getClassDashboard();
    const misc = dashboard.misconceptions.find(
      (m) => m.tag === "perimeter_vs_area",
    );
    assert.ok(misc);
    assert.ok((misc?.learnerCount ?? 0) >= 2);
    assert.ok((misc?.suggestedActions.length ?? 0) >= 3);
  });

  it("requires teacher approval for differentiation suggestions", () => {
    const { suggestions } = getClassDashboard();
    assert.ok(suggestions.length > 0);
    assert.ok(suggestions.every((s) => s.status === "pending"));
    const resolved = resolveSuggestion(suggestions[0]!.id, "approved");
    assert.equal(resolved?.status, "approved");
  });

  it("integrates editable teacher observations", () => {
    addObservation({
      learnerId: "lrn_03",
      note: "Fluency reading improving.",
      tags: ["citire"],
    });
    const notes = studentLearningEngine.listObservations();
    assert.ok(notes.some((n) => n.note.includes("Fluency")));
    assert.ok(notes.every((n) => n.editable));
  });

  it("offers a PIE instructional handoff without auto-deciding", () => {
    const handoff = pieHandoffForClass();
    assert.ok(handoff);
    assert.ok(handoff?.focusSection);
    assert.ok(handoff?.noteRo.length);
  });

  it("writes audit entries when viewing profiles", () => {
    getProfile("lrn_01");
    const audit = studentLearningEngine.listAudit();
    assert.ok(audit.some((a) => a.action === "profile_view"));
  });
});
