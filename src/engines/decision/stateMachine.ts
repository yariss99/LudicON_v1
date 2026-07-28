import type { DecisionEngineState } from "./types";

const TRANSITIONS: Record<DecisionEngineState, DecisionEngineState[]> = {
  idle: ["listening", "reasoning"],
  listening: ["reasoning"],
  reasoning: [
    "clarifying",
    "updating_blueprint",
    "ready_for_approval",
    "waiting_teacher",
  ],
  clarifying: ["updating_blueprint", "waiting_teacher"],
  updating_blueprint: ["waiting_teacher", "ready_for_approval", "clarifying"],
  waiting_teacher: ["listening", "reasoning"],
  ready_for_approval: ["approved", "listening", "reasoning"],
  approved: ["idle", "listening"],
};

export function canTransition(
  from: DecisionEngineState,
  to: DecisionEngineState,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transition(
  from: DecisionEngineState,
  to: DecisionEngineState,
): DecisionEngineState {
  if (!canTransition(from, to)) {
    // Fail closed to a safe listening wait — never hide illegal jumps
    if (to === "waiting_teacher" || from === "waiting_teacher") {
      return "waiting_teacher";
    }
    return from;
  }
  return to;
}

export function createInitialEngineState(): DecisionEngineState {
  return "idle";
}
