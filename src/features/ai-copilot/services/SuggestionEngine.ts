import {
  SuggestionRegistry,
  materializeSuggestion,
  type SuggestionRule,
} from "./SuggestionRegistry";
import type {
  ArtifactInventory,
  PedagogicalSuggestion,
  SuggestionProvider,
} from "../suggestionTypes";

/**
 * SuggestionEngine — rule-based pedagogical opportunities.
 *
 * Architecture note: UI depends only on PedagogicalSuggestion[].
 * Swap `evaluate` implementation (or inject another SuggestionProvider)
 * when an AI API is ready — SuggestionPanel / SuggestionCard stay unchanged.
 */
export class SuggestionEngine implements SuggestionProvider {
  private readonly registry: readonly SuggestionRule[];
  private readonly dismissedIds: ReadonlySet<string>;

  constructor(
    registry: readonly SuggestionRule[] = SuggestionRegistry,
    dismissedIds: ReadonlySet<string> = new Set(),
  ) {
    this.registry = registry;
    this.dismissedIds = dismissedIds;
  }

  withDismissed(ids: Iterable<string>): SuggestionEngine {
    return new SuggestionEngine(this.registry, new Set(ids));
  }

  evaluate(inventory: ArtifactInventory | null): PedagogicalSuggestion[] {
    if (!inventory) return [];

    return this.registry
      .filter((rule) => rule.matches(inventory))
      .map((rule) => materializeSuggestion(rule, inventory))
      .filter((s) => !this.dismissedIds.has(s.id))
      .sort((a, b) => b.priority - a.priority);
  }
}

/** Default singleton factory for the rule-based provider. */
export function createSuggestionEngine(
  dismissedIds: Iterable<string> = [],
): SuggestionEngine {
  return new SuggestionEngine(SuggestionRegistry, new Set(dismissedIds));
}
