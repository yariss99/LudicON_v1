import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createExperienceSession,
  processTeacherMessage,
} from "../../../features/create-experience/services/conversationEngine";

describe("AI-003 × Decision Engine integration", () => {
  it("infers Mathematics from Fractions before deciding", async () => {
    const result = await processTeacherMessage({
      text: "Fractions",
      session: createExperienceSession(),
    });

    assert.equal(result.draft.learningContext.subject, "Mathematics");
    assert.ok(
      result.inference.inferredFacts.some(
        (f) => f.field === "subject" && f.value === "Mathematics",
      ),
    );
    assert.ok(result.inferredCanvasIds.includes("subject"));
    // Topic present + subject inferred → ask grade (subject gap closed)
    assert.equal(result.pedagogicalDecision.action, "ASK_GRADE");
    assert.equal(result.validation.approved, true);
  });
});
