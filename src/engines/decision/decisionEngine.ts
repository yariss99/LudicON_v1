import { createEmptyConversation } from "./services/conversationAnalyzer";
import { createEmptyBlueprint } from "./services/blueprintMapper";
import { runReasoningPipeline } from "../reasoning/reasoningPipeline";
import { createInitialEngineState, transition } from "./stateMachine";
import type {
  DecisionBlueprint,
  DecisionEngineState,
  DecisionTurnInput,
  DecisionTurnOutput,
  ConversationState,
  KnowledgeEngineResults,
  MemoryEnginePreferences,
} from "./types";

export type DecisionSession = {
  engineState: DecisionEngineState;
  conversation: ConversationState;
  blueprint: DecisionBlueprint;
  lastOutput: DecisionTurnOutput | null;
  /** AI-001 reasoning trace from the last turn */
  lastReasoningTrace?: import("../reasoning/types").ReasoningTraceStep[];
  /** AI-003 inference from the last AI-001 turn */
  lastInference?: import("../inference").InferenceResult;
};

/**
 * Pedagogical Decision Engine — owns pedagogical decisions.
 * Every teacher turn runs the AI-001 Reasoning Pipeline first.
 * LLM is never called to decide; it may only verbalize a sealed plan.
 */
export function createDecisionSession(): DecisionSession {
  return {
    engineState: createInitialEngineState(),
    conversation: createEmptyConversation(),
    blueprint: createEmptyBlueprint(),
    lastOutput: null,
  };
}

export async function processTeacherTurn(
  session: DecisionSession,
  teacherMessage: string,
  options?: {
    knowledge?: KnowledgeEngineResults;
    memory?: MemoryEnginePreferences;
    learningExperienceId?: string | null;
  },
): Promise<{ session: DecisionSession; output: DecisionTurnOutput }> {
  const reasoning = await runReasoningPipeline({
    teacherMessage,
    conversation: session.conversation,
    blueprint: session.blueprint,
    engineState: session.engineState,
    previousDecision: session.lastOutput?.nextAction ?? null,
    learningExperienceId: options?.learningExperienceId,
    knowledge: options?.knowledge,
    memory: options?.memory,
  });

  const output = reasoning.decision;

  const nextSession: DecisionSession = {
    engineState: output.engineState,
    conversation: output.conversation,
    blueprint: output.blueprint,
    lastOutput: output,
    lastReasoningTrace: reasoning.reasoningTrace,
    lastInference: reasoning.inference,
  };

  return { session: nextSession, output };
}

export function approveBlueprint(session: DecisionSession): DecisionSession {
  if (session.engineState !== "ready_for_approval") {
    return session;
  }
  return {
    ...session,
    engineState: transition(session.engineState, "approved"),
  };
}

/** Convenience single-shot API for adapters — still AI-001 gated */
export async function decidePedagogicalTurn(
  input: DecisionTurnInput,
): Promise<DecisionTurnOutput> {
  const reasoning = await runReasoningPipeline({
    teacherMessage: input.teacherMessage,
    conversation: input.conversation,
    blueprint: input.blueprint,
    engineState: "waiting_teacher",
    knowledge: input.knowledge,
    memory: input.memory,
  });
  return reasoning.decision;
}
