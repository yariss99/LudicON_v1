import { DEFAULT_PLATFORM_RULES } from "./constants";
import { analyzeConversation } from "./services/conversationAnalyzer";
import { mapToBlueprint } from "./services/blueprintMapper";
import { validateConsistency } from "./services/consistencyValidator";
import { calculateConfidence } from "./services/confidenceCalculator";
import { detectMissingInformation } from "./services/missingInformationDetector";
import { planNextQuestion } from "./services/questionPlanner";
import {
  buildReflectionSummary,
  evaluateApproval,
} from "./services/approvalEvaluator";
import { composeGuidedReply, formatGuidedReply } from "./services/guidedReplyComposer";
import type {
  DecisionEngineState,
  DecisionPipelineStage,
  DecisionTraceStep,
  DecisionTurnInput,
  DecisionTurnOutput,
} from "./types";

function trace(
  stage: DecisionPipelineStage,
  summary: string,
  evidence?: string,
): DecisionTraceStep {
  return {
    stage,
    summary,
    evidence,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Decision loop (IT-003) — every teacher message.
 * Deterministic pedagogical reasoning; LLM is not used here.
 */
export async function runDecisionPipeline(
  input: DecisionTurnInput,
  previousState: DecisionEngineState = "waiting_teacher",
): Promise<DecisionTurnOutput> {
  const started = performance.now();
  const steps: DecisionTraceStep[] = [];
  const rules = { ...DEFAULT_PLATFORM_RULES, ...input.platformRules };
  let engineState: DecisionEngineState = "listening";

  // 1. Update Conversation Context + 2. Extract
  engineState = "reasoning";
  const { conversation: analyzedConversation, extracted } =
    await analyzeConversation({
      teacherMessage: input.teacherMessage,
      conversation: input.conversation,
    });
  steps.push(
    trace(
      "update_conversation_context",
      `From “${previousState}”: conversation context updated with teacher utterance.`,
      extracted.rawEvidence.slice(0, 120),
    ),
  );
  steps.push(
    trace(
      "extract_pedagogical_information",
      extracted.lost
        ? "Teacher signaled uncertainty — soft scaffold allowed."
        : "Pedagogical cues extracted.",
    ),
  );

  // 3. Map to Blueprint
  engineState = "updating_blueprint";
  const { blueprint, updatedSections } = await mapToBlueprint({
    blueprint: input.blueprint,
    extracted,
    knowledge: input.knowledge,
    memory: input.memory,
    preferInference: rules.preferInference,
  });
  steps.push(
    trace(
      "map_to_blueprint",
      updatedSections.length
        ? `Mapped into sections: ${updatedSections.join(", ")}.`
        : "No Blueprint section facts changed.",
    ),
  );

  // 4. Validate consistency
  const consistency = await validateConsistency(blueprint);
  steps.push(
    trace(
      "validate_consistency",
      consistency.ok
        ? "No contradictions."
        : `Contradictions: ${consistency.contradictions.map((c) => c.id).join(", ")}`,
    ),
  );

  // 5 + 6. Missing info + confidence
  const confidenceMap = await calculateConfidence({
    blueprint,
    hasContradiction: !consistency.ok,
  });
  steps.push(
    trace(
      "calculate_confidence",
      `Context=${confidenceMap.learning_context.level}, Objectives=${confidenceMap.objectives.level}, Validation=${confidenceMap.validation.level}`,
    ),
  );

  const missingInformation = await detectMissingInformation({
    blueprint,
    confidenceMap,
    consistency,
  });
  steps.push(
    trace(
      "detect_missing_information",
      `Missing=${missingInformation.filter((i) => i.kind === "missing").length}; Contradictory=${missingInformation.filter((i) => i.kind === "contradictory").length}`,
    ),
  );

  const approvalRecommendation = await evaluateApproval({
    blueprint,
    confidenceMap,
    missingInformation,
    hasContradiction: !consistency.ok,
  });

  // 7 + 8. Next objective + one question
  if (!consistency.ok || extracted.unclear) {
    engineState = "clarifying";
  }

  const nextAction = await planNextQuestion({
    blueprint,
    confidenceMap,
    missingInformation,
    conversation: analyzedConversation,
    hasContradiction: !consistency.ok,
    unclearAnswer: extracted.unclear,
    readyForApproval: approvalRecommendation.readyForApproval,
  });
  steps.push(
    trace(
      "determine_next_objective",
      `Objective=${nextAction.objectiveId}; clarification=${nextAction.requiresClarification}`,
      nextAction.reason,
    ),
  );
  steps.push(
    trace(
      "plan_question",
      "Planned exactly one pedagogical question.",
      nextAction.question,
    ),
  );

  const conversation = {
    ...analyzedConversation,
    currentObjectiveId: nextAction.objectiveId,
    askedObjectives: analyzedConversation.askedObjectives.includes(
      nextAction.objectiveId,
    )
      ? analyzedConversation.askedObjectives
      : [...analyzedConversation.askedObjectives, nextAction.objectiveId],
    askedQuestions: analyzedConversation.askedQuestions.includes(
      nextAction.question,
    )
      ? analyzedConversation.askedQuestions
      : [...analyzedConversation.askedQuestions, nextAction.question],
  };

  const reflectionSummary = await buildReflectionSummary({
    missingInformation,
    approval: approvalRecommendation,
  });

  steps.push(
    trace(
      "update_blueprint_live",
      "Blueprint Live consumers should refresh from Decision output.",
      updatedSections.join(","),
    ),
  );

  // CE-002 — Understanding → Canvas update → exactly one pedagogical question
  const guidedReply = composeGuidedReply({
    blueprint,
    teacherMessage: input.teacherMessage,
    updatedSections,
    nextAction,
    lost: extracted.lost,
  });
  const primaMessage = formatGuidedReply(guidedReply);

  engineState = approvalRecommendation.readyForApproval
    ? "ready_for_approval"
    : "waiting_teacher";

  const latencyMs = performance.now() - started;

  return {
    engineState,
    conversation,
    blueprint,
    confidenceMap,
    missingInformation,
    nextAction,
    reflectionSummary,
    approvalRecommendation,
    generationReadiness: approvalRecommendation.generationReadiness,
    primaMessage,
    guidedReply,
    trace: steps,
    updatedSections,
    latencyMs,
  };
}
