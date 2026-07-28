import type {
  RecommendationCard,
  RecommendationPriority,
} from './types.js';
import { PRIORITY_ORDER, PRIORITY_WEIGHTS } from './types.js';

/**
 * PriorityCalculator — ordering, visibility, frequency caps.
 */
export class PriorityCalculator {
  weight(priority: RecommendationPriority): number {
    return PRIORITY_WEIGHTS[priority].weight;
  }

  compare(a: RecommendationCard, b: RecommendationCard): number {
    const wa = this.weight(a.priority);
    const wb = this.weight(b.priority);
    if (wa !== wb) return wb - wa;
    return b.timestamp.localeCompare(a.timestamp);
  }

  sort(cards: RecommendationCard[]): RecommendationCard[] {
    return [...cards].sort((a, b) => this.compare(a, b));
  }

  /** Group by priority (critical → idea), newest first within group */
  groupByPriority(
    cards: RecommendationCard[],
  ): Record<RecommendationPriority, RecommendationCard[]> {
    const groups = {
      critical: [] as RecommendationCard[],
      important: [] as RecommendationCard[],
      suggested: [] as RecommendationCard[],
      idea: [] as RecommendationCard[],
    };
    for (const priority of PRIORITY_ORDER) {
      groups[priority] = this.sort(
        cards.filter((c) => c.priority === priority),
      );
    }
    return groups;
  }

  applyFrequencyCap(
    cards: RecommendationCard[],
    sessionCounts: Map<string, number>,
  ): RecommendationCard[] {
    return cards.filter((card) => {
      const max = PRIORITY_WEIGHTS[card.priority].maxFrequencyPerSession;
      const key = `${card.sessionId}:${card.priority}`;
      const count = sessionCounts.get(key) ?? 0;
      if (count >= max) return false;
      sessionCounts.set(key, count + 1);
      return true;
    });
  }

  visibility(priority: RecommendationPriority) {
    return PRIORITY_WEIGHTS[priority].visibility;
  }
}
