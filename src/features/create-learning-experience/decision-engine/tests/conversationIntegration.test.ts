import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createExperienceSession,
  processTeacherMessage,
} from "../../../create-experience/services/conversationEngine";

describe("AI-002 × Conversation Engine integration", () => {
  it("Conversation Engine verbalizes Decision Engine ASK_GRADE", async () => {
    const session = createExperienceSession();
    const result = await processTeacherMessage({
      text: "I am designing a Mathematics learning experience about fractions.",
      session,
    });

    assert.equal(result.pedagogicalDecision.action, "ASK_GRADE");
    assert.equal(
      result.pedagogicalDecision.reason,
      "Curriculum selection depends on grade.",
    );
    assert.equal(result.validation.approved, true);
    assert.equal(result.replySuppressed, false);
    assert.ok(result.guided);
    assert.equal(result.guided!.question, "La ce clasă predai?");
    assert.equal(
      result.guided!.whyNeeded,
      "Alegerea curriculumului depinde de clasă.",
    );
    assert.match(result.primaReply, /La ce clasă predai\?/);
  });

  it("does not invent a different action than PedagogicalDecision", async () => {
    const session = createExperienceSession();
    const result = await processTeacherMessage({
      text: "Mathematics about fractions for Grade III.",
      session,
    });

    // LOAD_* applied internally; teacher-facing decision should be ask/generate/none
    assert.ok(
      ["ASK_OBJECTIVES", "ASK_ACTIVITIES", "ASK_ASSESSMENT", "ASK_RESOURCES", "GENERATE_BLUEPRINT", "NONE", "ASK_GRADE"].includes(
        result.pedagogicalDecision.action,
      ),
    );
    assert.equal(result.validation.approved, true);
    assert.ok(result.guided);
    assert.ok(result.guided!.question.endsWith("?"));
    assert.ok(result.guided!.whyNeeded.length > 0);
  });
});
