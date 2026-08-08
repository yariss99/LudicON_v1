import { SuggestionRegistry } from "./SuggestionRegistry";
import type {
  ActiveSuggestion,
  CopilotEngineContract,
  CopilotEvaluationContext,
  SuggestionRule,
} from "../types";

/**
 * CopilotEngine — evaluates every registered rule.
 * Returns active suggestions sorted by priority (desc).
 *
 * Replace this class (or inject another CopilotEngineContract)
 * when wiring an AI API — UI stays unchanged.
 */
export class CopilotEngine implements CopilotEngineContract {
  private readonly rules: readonly SuggestionRule[];

  constructor(rules: readonly SuggestionRule[] = SuggestionRegistry) {
    this.rules = rules;
  }

  evaluate(
    ctx: CopilotEvaluationContext,
    dismissedIds: ReadonlySet<string>,
  ): ActiveSuggestion[] {
    if (!ctx.snapshot) return [];

    const projectId = ctx.snapshot.projectId;
    const active: ActiveSuggestion[] = [];

    for (const rule of this.rules) {
      if (!rule.condition(ctx)) continue;

      const suggestionId = `${rule.id}:${projectId}`;
      if (dismissedIds.has(suggestionId)) continue;

      const payload = rule.action(ctx);
      active.push({
        id: suggestionId,
        ruleId: rule.id,
        name: rule.name,
        priority: rule.priority,
        dismissable: rule.dismissable,
        title: payload.title,
        explanation: payload.explanation,
        actionLabel: payload.actionLabel,
        href: payload.href,
        icon: payload.icon,
        projectId,
      });
    }

    return active.sort((a, b) => b.priority - a.priority);
  }
}

export const defaultCopilotEngine = new CopilotEngine();
