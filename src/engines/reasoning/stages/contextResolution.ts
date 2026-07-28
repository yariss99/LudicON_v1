/**
 * AI-001 Step 2 — Context Resolution
 * Assemble current Learning Experience, Blueprint, conversation, prior decisions.
 */

import type {
  ConversationState,
  DecisionBlueprint,
  DecisionEngineState,
  MemoryEnginePreferences,
  NextPedagogicalAction,
} from "../../decision/types";
import type { ConversationContextPackage } from "../types";

export function resolveConversationContext(input: {
  blueprint: DecisionBlueprint;
  conversation: ConversationState;
  previousEngineState: DecisionEngineState;
  previousDecision?: NextPedagogicalAction | null;
  learningExperienceId?: string | null;
  memory?: MemoryEnginePreferences;
}): ConversationContextPackage {
  return {
    learningExperienceId: input.learningExperienceId ?? null,
    blueprint: input.blueprint,
    teacherProfile: {
      preferredLanguage: input.memory?.preferredLanguage,
      preferredDurationMinutes: input.memory?.preferredDurationMinutes,
    },
    conversation: input.conversation,
    previousDecision: input.previousDecision ?? null,
    previousEngineState: input.previousEngineState,
  };
}
