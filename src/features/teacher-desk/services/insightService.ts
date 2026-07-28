import { TEACHING_INSIGHTS } from "./mockData";
import { isInsightDismissedForToday } from "./insightDismissStore";
import type { TeachingInsight } from "../types";

/**
 * One insight for the active experience.
 * Positive, collegial voice — never critical.
 */
export function pickTeachingInsight(
  experienceId?: string | null,
): TeachingInsight | null {
  if (!experienceId) return TEACHING_INSIGHTS[0] ?? null;

  let hash = 0;
  for (let i = 0; i < experienceId.length; i += 1) {
    hash += experienceId.charCodeAt(i) * (i + 1);
  }

  // Occasional “excellent work” lane — no insight needed
  if (hash % 7 === 0) return null;

  const index = hash % TEACHING_INSIGHTS.length;
  return TEACHING_INSIGHTS[index] ?? null;
}

export function resolveInitialTeachingInsight(
  experienceId?: string | null,
): TeachingInsight | null {
  const insight = pickTeachingInsight(experienceId);
  if (!insight) return null;
  if (isInsightDismissedForToday(insight.id)) return null;
  return insight;
}
