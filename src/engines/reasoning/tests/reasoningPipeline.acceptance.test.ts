import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createDecisionSession,
  processTeacherTurn,
} from "../../decision";
import {
  REASONING_PIPELINE_ORDER,
  runReasoningPipeline,
  verbalizeLockedDecision,
  sealPedagogicalDecision,
} from "../index";
import { createEmptyConversation } from "../../decision/services/conversationAnalyzer";
import { createEmptyBlueprint } from "../../decision/services/blueprintMapper";

describe("AI-001 PRIMA Reasoning Pipeline — acceptance", () => {
  it("runs every canonical stage in fixed order", async () => {
    const output = await runReasoningPipeline({
      teacherMessage:
        "I am designing a Mathematics learning experience about fractions.",
      conversation: createEmptyConversation(),
      blueprint: createEmptyBlueprint(),
      engineState: "waiting_teacher",
    });

    const stages = output.reasoningTrace.map((s) => s.stage);
    assert.deepEqual(stages, [...REASONING_PIPELINE_ORDER]);
  });

  it("detects intent and entities before Decision Engine", async () => {
    const output = await runReasoningPipeline({
      teacherMessage:
        "Mathematics lesson about fractions for Grade III — students will compare unit fractions.",
      conversation: createEmptyConversation(),
      blueprint: createEmptyBlueprint(),
      engineState: "waiting_teacher",
    });

    assert.equal(output.intent.intent, "teaching_goal");
    assert.equal(output.intent.detectedEntities.subject, "Matematică");
    assert.equal(output.intent.detectedEntities.topic, "fractions");
    assert.equal(output.intent.detectedEntities.grade, "Clasa a III-a");

    const intentIdx = output.reasoningTrace.findIndex(
      (s) => s.stage === "intent_detection",
    );
    const decisionIdx = output.reasoningTrace.findIndex(
      (s) => s.stage === "decision_engine",
    );
    assert.ok(intentIdx >= 0 && decisionIdx > intentIdx);
  });

  it("seals the pedagogical decision before verbalization", async () => {
    const output = await runReasoningPipeline({
      teacherMessage: "Mathematics about fractions.",
      conversation: createEmptyConversation(),
      blueprint: createEmptyBlueprint(),
      engineState: "waiting_teacher",
    });

    assert.equal(output.lockedDecision.sealed, true);
    assert.equal(
      output.lockedDecision.plan.question,
      output.conversationPlan.question,
    );
    assert.equal(output.teacherMessage.includes(output.conversationPlan.question), true);

    const planIdx = output.reasoningTrace.findIndex(
      (s) => s.stage === "conversation_planning",
    );
    const llmIdx = output.reasoningTrace.findIndex(
      (s) => s.stage === "llm_response_generation",
    );
    assert.ok(planIdx < llmIdx);
  });

  it("rejects LLM drafts that change the sealed question", () => {
    const locked = sealPedagogicalDecision(
      {
        understanding: "I understand the topic.",
        canvasUpdate: "Canvas updated.",
        explanation: "Grade is needed.",
        question: "Which grade are you teaching?",
      },
      {
        nextAction: {
          objectiveId: "capture_learning_context",
          sectionId: "learning_context",
          question: "Which grade are you teaching?",
          requiresClarification: false,
          reason: "grade missing",
        },
        shouldRecommend: false,
        qualityIntervention: false,
        readyForApproval: false,
        reason: "grade missing",
      },
    );

    assert.throws(
      () =>
        verbalizeLockedDecision(locked, {
          llmDraft: "What is your favorite color for the slides?",
        }),
      /AI-001 violation/,
    );
  });

  it("processTeacherTurn always routes through AI-001", async () => {
    const { session, output } = await processTeacherTurn(
      createDecisionSession(),
      "Students will add fractions with like denominators.",
    );

    assert.ok(session.lastReasoningTrace);
    assert.equal(session.lastReasoningTrace!.length, REASONING_PIPELINE_ORDER.length);
    assert.equal(
      session.lastReasoningTrace![0]!.stage,
      "intent_detection",
    );
    assert.equal(
      session.lastReasoningTrace!.at(-1)!.stage,
      "llm_response_generation",
    );
    assert.ok(output.primaMessage.length > 0);
    assert.ok(output.guidedReply.question.endsWith("?"));
  });

  it("keeps Learning Canvas synchronized with Decision blueprint", async () => {
    const output = await runReasoningPipeline({
      teacherMessage: "Mathematics about fractions for Grade III.",
      conversation: createEmptyConversation(),
      blueprint: createEmptyBlueprint(),
      engineState: "waiting_teacher",
    });

    assert.equal(output.canvas.blueprint, output.decision.blueprint);
    assert.ok(
      output.canvas.blueprint.learningContext.subject ||
        output.canvas.blueprint.learningContext.topic,
    );
  });
});
