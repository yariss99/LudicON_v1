import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  buildInsightsBundle,
  compareLessons,
  completeReflection,
  personalAnalytics,
  promptsForMode,
  rptiStore,
  startReflection,
} from "../index";

describe("FEATURE-006 Reflective Practice & Teaching Insights", () => {
  beforeEach(() => {
    rptiStore.clear();
  });

  it("starts a private quick reflection with focused prompts", () => {
    const prompts = promptsForMode("quick");
    assert.ok(prompts.length <= 3);
    const reflection = startReflection({
      lessonProjectId: "lesson_1",
      lessonTitle: "Fracții echivalente",
      mode: "quick",
    });
    assert.equal(reflection.private, true);
    assert.equal(reflection.shareDecision, "private");
    assert.equal(reflection.status, "in_progress");
  });

  it("completes reflection, updates growth profile and portfolio", () => {
    const reflection = startReflection({
      lessonProjectId: "lesson_2",
      lessonTitle: "Text narativ",
      mode: "guided",
    });
    const completed = completeReflection(reflection.id, {
      answers: [
        {
          promptId: "timing",
          value: "Timpul a fost depășit la exersare",
          rating: 3,
        },
        {
          promptId: "engagement_peak",
          value: "Lucrul în perechi",
          rating: 5,
        },
        {
          promptId: "change_next",
          value: "Scurtez introducerea",
        },
      ],
      strengths: ["colaborare bun"],
      improvements: ["gestionarea timpului"],
      personalNotes: "Elevii au avut nevoie de mai mult scaffolding",
      followUpActions: ["Adaug modelare pe pași"],
    });
    assert.ok(completed);
    assert.equal(completed?.status, "completed");

    const profile = rptiStore.getProfile("teacher_local");
    assert.equal(profile.evaluationForbidden, true);
    assert.ok(profile.reflectionCount >= 1);

    const portfolio = rptiStore.listPortfolio();
    assert.ok(portfolio.some((e) => e.kind === "reflection_note"));
    assert.ok(portfolio.every((e) => e.shareDecision === "private" || e.editable));
  });

  it("derives insights and recommendations from reflection evidence", () => {
    const r = startReflection({
      lessonProjectId: "lesson_3",
      lessonTitle: "Probleme în pași",
      mode: "evidence",
    });
    completeReflection(r.id, {
      answers: [
        {
          promptId: "difficulties",
          value: "Elevii s-au blocat la probleme multi-pas",
        },
        {
          promptId: "timing",
          value: "Nu a fost realist — am depășit ora",
        },
      ],
      strengths: [],
      improvements: ["scaffolding"],
    });
    const { insights, recommendations } = buildInsightsBundle();
    assert.ok(insights.length > 0);
    assert.ok(recommendations.every((rec) => rec.applyToFutureLesson));
  });

  it("compares two reflected lessons", () => {
    const a = startReflection({
      lessonProjectId: "A",
      lessonTitle: "Lecția A",
      mode: "quick",
    });
    completeReflection(a.id, {
      answers: [{ promptId: "timing", value: "OK" }],
      strengths: ["claritate"],
    });
    const b = startReflection({
      lessonProjectId: "B",
      lessonTitle: "Lecția B",
      mode: "quick",
    });
    completeReflection(b.id, {
      answers: [{ promptId: "timing", value: "Prea lung" }],
      strengths: ["joc"],
    });
    const cmp = compareLessons("A", "B");
    assert.ok(cmp);
    assert.equal(cmp?.dimensions.length, 5);
  });

  it("exposes personal analytics without rankings", () => {
    const analytics = personalAnalytics();
    assert.ok(Array.isArray(analytics.monthlyReflectionCounts));
    assert.equal("rank" in analytics, false);
    assert.equal("publicScore" in analytics, false);
  });
});
