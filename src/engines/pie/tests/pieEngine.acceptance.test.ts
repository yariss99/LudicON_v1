import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pieInputFromBlueprint } from "../fromBlueprint";
import {
  analyzeLessonDesign,
  reanalyzeOnChange,
  PIE_SCHEMA_VERSION,
} from "../pieEngine";
import { PIE_DIMENSION_IDS, type PieAnalysisInput } from "../types";
import type { DecisionBlueprint } from "../../decision/types";

function richLesson(): PieAnalysisInput {
  return {
    lessonProjectId: "lesson_demo",
    title: "Fracții echivalente",
    subject: "Matematică",
    grade: "Clasa a IV-a",
    availableMinutes: 50,
    teachingStrategy: "descoperire ghidată",
    competencies: ["Operarea cu fracții ordinare"],
    learningObjectives: [
      "Elevul să identifice fracții echivalente",
      "Elevul să explice echivalența folosind reprezentări",
    ],
    learningFlow: [
      "Captarea atenției",
      "Reactivarea cunoștințelor",
      "Descoperire",
      "Exersare",
      "Reflecție",
    ],
    activities: [
      {
        id: "a1",
        title: "Hook vizual",
        durationMinutes: 5,
        phase: "opening",
      },
      {
        id: "a2",
        title: "Explorare în perechi",
        description: "lucru colaborativ cu fișe",
        durationMinutes: 12,
        collaborative: true,
        practical: true,
        phase: "discovery",
      },
      {
        id: "a3",
        title: "Exerciții ghidate",
        durationMinutes: 15,
        practical: true,
        phase: "practice",
      },
      {
        id: "a4",
        title: "Reflecție pe scurt",
        durationMinutes: 5,
        phase: "reflection",
      },
    ],
    assessment: [
      "Observare formativă pe parcurs",
      "Exit ticket",
      "Feedback verbal",
    ],
    successCriteria: ["Știu că am reușit când pot da două fracții echivalente"],
    resources: [
      { id: "r1", label: "Fișă de lucru" },
      { id: "r2", label: "Reprezentări vizuale" },
    ],
    differentiation: [
      "Traseu de sprijin cu indicii",
      "Extensie pentru elevii avansați",
    ],
    reflection: ["Ce a fost clar? Ce mai exersăm?"],
    language: "ro",
    curriculumVersion: "ro-primary/math/1.0",
  };
}

describe("FEATURE-003 Pedagogical Intelligence Engine", () => {
  it("analyzes all ten dimensions and returns a scorecard", () => {
    const report = analyzeLessonDesign(richLesson());
    assert.equal(report.schemaVersion, PIE_SCHEMA_VERSION);
    assert.equal(report.scorecard.dimensions.length, 10);
    for (const id of PIE_DIMENSION_IDS) {
      assert.ok(
        report.scorecard.dimensions.some((d) => d.dimension === id),
        `missing ${id}`,
      );
    }
    assert.ok(report.scorecard.overall >= 0 && report.scorecard.overall <= 100);
    assert.ok(report.scorecard.estimatedTeachingMinutes > 0);
    assert.equal(report.cognitiveLoad.band, "balanced");
  });

  it("marks scores as improvement support, not teacher grades", () => {
    const report = analyzeLessonDesign(richLesson());
    assert.ok(
      report.notes.some((n) => /never teacher evaluation/i.test(n)),
    );
  });

  it("emits critical time recommendation when plan overruns", () => {
    const input = richLesson();
    input.availableMinutes = 20;
    const report = analyzeLessonDesign(input);
    assert.ok(
      report.recommendations.some(
        (r) => r.id === "rec_time_over" && r.priority === "critical",
      ),
    );
    assert.ok(report.recommendations.every((r) => r.explainable.why));
    assert.ok(report.recommendations.every((r) => r.pedagogicalRationale));
  });

  it("flags weak differentiation", () => {
    const input = richLesson();
    input.differentiation = [];
    const report = analyzeLessonDesign(input);
    assert.ok(
      report.recommendations.some((r) => r.id === "rec_diff_paths"),
    );
  });

  it("reanalyzes on teacher change events", () => {
    const before = analyzeLessonDesign(richLesson());
    const after = reanalyzeOnChange(richLesson(), {
      kind: "duration_changed",
      component: "timing",
    });
    assert.equal(after.inputFingerprint, before.inputFingerprint);
    assert.ok(after.notes.some((n) => /duration_changed/.test(n)));
  });

  it("builds input from DecisionBlueprint (FEATURE-001 bridge)", () => {
    const blueprint: DecisionBlueprint = {
      learningContext: {
        grade: "Clasa a III-a",
        subject: "Limba română",
        topic: "Textul narativ",
        durationMinutes: 45,
        language: "ro",
      },
      competencies: ["Receptarea textului scris"],
      objectives: ["Elevul să identifice personajele"],
      learningFlow: ["Motivare", "Lectură", "Exersare"],
      activities: ["Lectură ghidată", "Lucru în grup"],
      assessment: ["Observare formativă"],
      resources: ["Text suport"],
      differentiation: ["Sprijin pentru citire"],
      reflection: ["Ce am aflat despre personaje?"],
      assumptions: {},
      correctionsApplied: [],
    };

    const input = pieInputFromBlueprint({
      lessonProjectId: "bp_1",
      blueprint,
      plannedMaterialLabels: ["Fișă de lucru"],
    });
    const report = analyzeLessonDesign(input);
    assert.equal(report.lessonProjectId, "bp_1");
    assert.ok(report.scorecard.dimensions.length === 10);
  });

  it("every recommendation is explainable", () => {
    const thin: PieAnalysisInput = {
      lessonProjectId: "thin",
      title: "Lecție incompletă",
      subject: "",
      grade: "",
      availableMinutes: 45,
      competencies: [],
      learningObjectives: [],
      learningFlow: [],
      activities: [],
      assessment: [],
      resources: [],
      differentiation: [],
      reflection: [],
    };
    const report = analyzeLessonDesign(thin);
    assert.ok(report.recommendations.length > 0);
    for (const rec of report.recommendations) {
      assert.ok(rec.explainable.why);
      assert.ok(rec.explainable.ifAccept);
      assert.ok(rec.explainable.ifIgnore);
      assert.ok(rec.explainable.affectedParts);
      assert.ok(rec.affectedComponents.length > 0);
    }
  });
});
