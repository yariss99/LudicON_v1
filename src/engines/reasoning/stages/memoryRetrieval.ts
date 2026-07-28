/**
 * AI-001 Step 3 — Memory Retrieval
 * Retrieve relevant teacher memory without overriding explicit teacher input.
 */

import type { MemoryEnginePreferences } from "../../decision/types";
import type {
  ConversationContextPackage,
  IntentDetectionResult,
  RelevantMemoryPackage,
} from "../types";

export function retrieveRelevantMemory(input: {
  memory?: MemoryEnginePreferences;
  context: ConversationContextPackage;
  intent: IntentDetectionResult;
}): RelevantMemoryPackage {
  const raw: MemoryEnginePreferences = input.memory ?? {};
  const strategies = raw.strategyHints ?? [];

  return {
    previousLessons: [],
    preferredStrategies: strategies,
    frequentlyUsedActivities: [],
    templates: [],
    teachingStyle: strategies.slice(0, 2),
    previousRecommendations: [],
    raw: {
      preferredDurationMinutes:
        raw.preferredDurationMinutes ??
        input.context.teacherProfile.preferredDurationMinutes,
      preferredLanguage:
        raw.preferredLanguage ??
        input.context.teacherProfile.preferredLanguage,
      strategyHints: strategies,
    },
  };
}
