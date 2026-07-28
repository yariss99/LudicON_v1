/**
 * AI-001 — PRIMA Reasoning Pipeline
 *
 * Every teacher message passes through this pipeline before any response.
 * The LLM is never allowed to answer immediately or bypass pedagogical logic.
 *
 * Teacher Message
 *   → Intent Detection
 *   → Context Resolution
 *   → Memory Retrieval
 *   → Knowledge Graph Validation
 *   → Canvas Synchronization
 *   → Pedagogical Inference (AI-003)
 *   → Pedagogical State Update
 *   → Decision Engine
 *   → Pedagogical Validation (AI-002.5)
 *   → Conversation Planning
 *   → LLM Response Generation
 *   → Teacher
 */

import { runDecisionPipeline } from "../decision/pipeline";
import type { DecisionBlueprint, DecisionTurnInput } from "../decision/types";
import {
  decidePedagogicalAction,
  type LearningCanvas,
  type PedagogicalState,
} from "../../features/create-learning-experience/decision-engine";
import {
  runPedagogicalInference,
  type InferenceResult,
} from "../inference";
import {
  validateInferredFacts,
  validatePedagogicalDecision,
} from "../validation";
import { resolveConversationContext } from "./stages/contextResolution";
import { detectIntent } from "./stages/intentDetection";
import { validateKnowledgePackage } from "./stages/knowledgeValidation";
import {
  sealPedagogicalDecision,
  verbalizeLockedDecision,
} from "./stages/llmVerbalizer";
import { retrieveRelevantMemory } from "./stages/memoryRetrieval";
import { updatePedagogicalState } from "./stages/pedagogicalState";
import type {
  BestNextPedagogicalDecision,
  ConversationPlan,
  ReasoningPipelineInput,
  ReasoningPipelineOutput,
  ReasoningPipelineStageId,
  ReasoningTraceStep,
  UpdatedLearningCanvas,
} from "./types";
import { REASONING_PIPELINE_ORDER } from "./types";

function blueprintToLearningCanvas(
  blueprint: DecisionBlueprint,
  lessonPhase?: string,
): LearningCanvas {
  return {
    topic: blueprint.learningContext.topic,
    subject: blueprint.learningContext.subject,
    grade: blueprint.learningContext.grade,
    lessonPhase,
    competencies: [...blueprint.competencies],
    objectives: [...blueprint.objectives],
    activities: [...blueprint.activities],
    assessment: [...blueprint.assessment],
    resources: [...blueprint.resources],
  };
}

function applyInferenceToBlueprint(
  blueprint: DecisionBlueprint,
  inference: InferenceResult,
): DecisionBlueprint {
  const ctx = { ...blueprint.learningContext };
  for (const fact of inference.inferredFacts) {
    if (fact.field === "subject" && !ctx.subject) {
      ctx.subject = String(fact.value);
    }
    if (fact.field === "grade" && !ctx.grade) {
      ctx.grade = String(fact.value);
    }
    if (fact.field === "topic" && !ctx.topic) {
      ctx.topic = String(fact.value);
    }
  }
  return { ...blueprint, learningContext: ctx };
}

function blueprintToPedagogicalState(
  canvas: LearningCanvas,
): PedagogicalState {
  return {
    curriculumLoaded: Boolean(canvas.curriculum?.trim()),
    competenciesLoaded: canvas.competencies.length > 0,
    completedSections: {
      grade: Boolean(canvas.grade?.trim()),
      curriculum: Boolean(canvas.curriculum?.trim()),
      competencies: canvas.competencies.length > 0,
      objectives: canvas.objectives.length > 0,
      activities: canvas.activities.length > 0,
      assessment: canvas.assessment.length > 0,
      resources: canvas.resources.length > 0,
    },
  };
}

function trace(
  stage: ReasoningPipelineStageId,
  summary: string,
  evidence?: string,
): ReasoningTraceStep {
  return {
    stage,
    summary,
    evidence,
    timestamp: new Date().toISOString(),
  };
}

function assertPipelineOrder(steps: ReasoningTraceStep[]): void {
  const seen = steps.map((s) => s.stage);
  for (let i = 0; i < REASONING_PIPELINE_ORDER.length; i++) {
    if (seen[i] !== REASONING_PIPELINE_ORDER[i]) {
      throw new Error(
        `AI-001 violation: expected stage ${REASONING_PIPELINE_ORDER[i]} at position ${i}, got ${seen[i]}`,
      );
    }
  }
}

/**
 * Canonical AI-001 entry — pedagogical reasoning before any LLM verbalization.
 */
export async function runReasoningPipeline(
  input: ReasoningPipelineInput,
): Promise<ReasoningPipelineOutput> {
  const started = performance.now();
  const steps: ReasoningTraceStep[] = [];

  // ─── Step 1: Intent Detection ───────────────────────────────────────
  const intent = detectIntent(input.teacherMessage);
  steps.push(
    trace(
      "intent_detection",
      `Intent=${intent.intent}; confidence=${intent.confidence.toFixed(2)}`,
      Object.entries(intent.detectedEntities)
        .filter(([, v]) => v != null)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ") || undefined,
    ),
  );

  // ─── Step 2: Context Resolution ─────────────────────────────────────
  const conversationContext = resolveConversationContext({
    blueprint: input.blueprint,
    conversation: input.conversation,
    previousEngineState: input.engineState,
    previousDecision: input.previousDecision,
    learningExperienceId: input.learningExperienceId,
    memory: input.memory,
  });
  steps.push(
    trace(
      "context_resolution",
      `Resolved conversation context (utterances=${conversationContext.conversation.utterances.length}).`,
      conversationContext.previousEngineState,
    ),
  );

  // ─── Step 3: Memory Retrieval ───────────────────────────────────────
  const memory = retrieveRelevantMemory({
    memory: input.memory,
    context: conversationContext,
    intent,
  });
  steps.push(
    trace(
      "memory_retrieval",
      `Memory package ready (strategies=${memory.preferredStrategies.length}).`,
    ),
  );

  // ─── Step 4: Knowledge Graph Validation ─────────────────────────────
  const knowledge = validateKnowledgePackage({
    knowledge: input.knowledge,
    intent,
  });
  steps.push(
    trace(
      "knowledge_validation",
      `Knowledge validated (deps=${knowledge.pedagogicalDependencies.length}).`,
      knowledge.pedagogicalDependencies[0],
    ),
  );

  // ─── Steps 5–8 via Decision Engine (IT-003) then Conversation Plan ──
  // Canvas sync, pedagogical evaluation, decision, and plan composition
  // run inside the Decision Engine; AI-001 records them as distinct stages.
  const decisionInput: DecisionTurnInput = {
    teacherMessage: input.teacherMessage,
    conversation: input.conversation,
    blueprint: input.blueprint,
    knowledge: knowledge.raw,
    memory: memory.raw,
  };

  const decision = await runDecisionPipeline(
    decisionInput,
    input.engineState,
  );

  let workingDecision = decision;

  const canvas: UpdatedLearningCanvas = {
    blueprint: workingDecision.blueprint,
    updatedFields: workingDecision.updatedSections,
  };
  steps.push(
    trace(
      "canvas_synchronization",
      canvas.updatedFields.length
        ? `Learning Canvas updated: ${canvas.updatedFields.join(", ")}.`
        : "Learning Canvas unchanged this turn.",
    ),
  );

  // ─── AI-003 Pedagogical Inference (before Decision Engine AI-002) ───
  const preInferCanvas = blueprintToLearningCanvas(workingDecision.blueprint);
  const preInferState = blueprintToPedagogicalState(preInferCanvas);
  const rawInference = runPedagogicalInference({
    teacherMessage: input.teacherMessage,
    canvas: preInferCanvas,
    pedagogicalState: preInferState,
    conversationContext: {
      lastTeacherMessage: input.teacherMessage,
      turnCount: input.conversation.utterances.length + 1,
    },
  });
  const inferenceCheck = validateInferredFacts(rawInference.inferredFacts);
  const inference: InferenceResult = inferenceCheck.approved
    ? rawInference
    : {
        updatedCanvas: preInferCanvas,
        inferredFacts: [],
        confidence: "LOW",
      };
  if (inference.inferredFacts.length > 0) {
    workingDecision = {
      ...workingDecision,
      blueprint: applyInferenceToBlueprint(
        workingDecision.blueprint,
        inference,
      ),
    };
  }
  steps.push(
    trace(
      "pedagogical_inference",
      inference.inferredFacts.length
        ? `Inferred ${inference.inferredFacts.map((f) => f.field).join(", ")}`
        : "No HIGH-confidence inferences.",
      inference.inferredFacts[0]?.reason,
    ),
  );

  const pedagogicalState = updatePedagogicalState({
    confidenceMap: workingDecision.confidenceMap,
    missingInformation: workingDecision.missingInformation,
  });
  steps.push(
    trace(
      "pedagogical_state_update",
      `State facts=${pedagogicalState.statuses.length}; required=${pedagogicalState.statuses.filter((s) => s.status === "required").length}.`,
    ),
  );

  const pedagogicalDecision: BestNextPedagogicalDecision = Object.freeze({
    nextAction: workingDecision.nextAction,
    shouldRecommend: workingDecision.nextAction.objectiveId === "confirm_ready",
    qualityIntervention: workingDecision.nextAction.requiresClarification,
    readyForApproval: workingDecision.approvalRecommendation.readyForApproval,
    reason: workingDecision.nextAction.reason,
  });
  steps.push(
    trace(
      "decision_engine",
      `Best next decision: ${pedagogicalDecision.nextAction.objectiveId}`,
      pedagogicalDecision.reason,
    ),
  );

  // ─── AI-002 Decision + AI-002.5 Validation (enriched canvas) ─────────
  const lessonPhase = inference.updatedCanvas.lessonPhase;
  const learningCanvas = blueprintToLearningCanvas(
    workingDecision.blueprint,
    typeof lessonPhase === "string" ? lessonPhase : undefined,
  );
  const ai002State = blueprintToPedagogicalState(learningCanvas);
  const ai002Decision = decidePedagogicalAction({
    canvas: learningCanvas,
    pedagogicalState: ai002State,
    conversationContext: {
      lastTeacherMessage: input.teacherMessage,
      turnCount: input.conversation.utterances.length + 1,
    },
  });
  const pedagogicalValidation = validatePedagogicalDecision({
    decision: ai002Decision,
    canvas: learningCanvas,
    pedagogicalState: ai002State,
  });
  steps.push(
    trace(
      "pedagogical_validation",
      pedagogicalValidation.approved
        ? `Approved AI-002 action=${ai002Decision.action}`
        : `Rejected: ${pedagogicalValidation.issues[0]?.message ?? "validation failed"}`,
      ai002Decision.action,
    ),
  );

  const conversationPlan: ConversationPlan = Object.freeze({
    understanding: workingDecision.guidedReply.understanding,
    canvasUpdate: workingDecision.guidedReply.canvasUpdate,
    explanation: workingDecision.guidedReply.whyNeeded,
    question: workingDecision.guidedReply.question,
  });
  steps.push(
    trace(
      "conversation_planning",
      pedagogicalValidation.approved
        ? "Composed Understanding → Canvas → Explanation → One Question."
        : "Conversation planning skipped — pedagogical decision rejected.",
      conversationPlan.question,
    ),
  );

  // ─── LLM Response Generation (verbalize only when validated) ────────
  const lockedDecision = sealPedagogicalDecision(conversationPlan, pedagogicalDecision);

  let teacherMessage = "";
  let guidedReply = workingDecision.guidedReply;

  if (pedagogicalValidation.approved) {
    const verbalized = verbalizeLockedDecision(lockedDecision);
    teacherMessage = verbalized.teacherMessage;
    guidedReply = verbalized.guidedReply;
    steps.push(
      trace(
        "llm_response_generation",
        "Verbalized sealed pedagogical decision (LLM may not alter decision).",
        lockedDecision.sealedAt,
      ),
    );
  } else {
    steps.push(
      trace(
        "llm_response_generation",
        "Suppressed — Pedagogical decision rejected.",
        pedagogicalValidation.issues[0]?.message,
      ),
    );
  }

  assertPipelineOrder(steps);

  const decisionWithSealedMessage = {
    ...workingDecision,
    primaMessage: teacherMessage,
    guidedReply,
  };

  return {
    decision: decisionWithSealedMessage,
    intent,
    conversationContext,
    memory,
    knowledge,
    canvas: {
      blueprint: workingDecision.blueprint,
      updatedFields: workingDecision.updatedSections,
    },
    inference,
    pedagogicalState,
    pedagogicalDecision,
    ai002Decision,
    pedagogicalValidation,
    conversationPlan,
    lockedDecision,
    teacherMessage,
    guidedReply,
    reasoningTrace: steps,
    latencyMs: performance.now() - started,
  };
}
