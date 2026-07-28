import type { DecisionSession } from "../../../engines/decision";

const HANDOFF_KEY = "prima.blueprint.review.handoff";

/** Same handoff key as blueprint-review — conversation → Lesson Blueprint. */
export function readHandoffForStudio(): DecisionSession | null {
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(HANDOFF_KEY);
    return JSON.parse(raw) as DecisionSession;
  } catch {
    return null;
  }
}
