import type {
  RecommendationCard,
  RecommendationCategory,
  RecommendationPriority,
  RecommendationStatus,
} from './types.js';

/**
 * RecommendationRegistry — active + historical recommendation cards.
 * Never stores Blueprint mutations.
 */
export class RecommendationRegistry {
  private readonly items = new Map<string, RecommendationCard>();

  upsert(card: RecommendationCard): RecommendationCard {
    this.items.set(card.recommendationId, structuredClone(card));
    return structuredClone(card);
  }

  get(id: string): RecommendationCard | undefined {
    const item = this.items.get(id);
    return item ? structuredClone(item) : undefined;
  }

  list(filter?: {
    sessionId?: string;
    teacherId?: string;
    status?: RecommendationStatus | RecommendationStatus[];
    category?: RecommendationCategory;
    priority?: RecommendationPriority;
  }): RecommendationCard[] {
    const statuses = filter?.status
      ? Array.isArray(filter.status)
        ? filter.status
        : [filter.status]
      : undefined;

    return [...this.items.values()]
      .filter((item) => {
        if (filter?.sessionId && item.sessionId !== filter.sessionId) return false;
        if (filter?.teacherId && item.teacherId !== filter.teacherId) return false;
        if (filter?.category && item.category !== filter.category) return false;
        if (filter?.priority && item.priority !== filter.priority) return false;
        if (statuses && !statuses.includes(item.status)) return false;
        return true;
      })
      .map((i) => structuredClone(i));
  }

  updateStatus(
    id: string,
    status: RecommendationStatus,
  ): RecommendationCard | { error: string } {
    const item = this.items.get(id);
    if (!item) return { error: 'Recommendation not found' };
    item.status = status;
    this.items.set(id, item);
    return structuredClone(item);
  }

  /** Active panel set — excludes terminal states */
  active(sessionId: string): RecommendationCard[] {
    return this.list({
      sessionId,
      status: ['new', 'displayed', 'saved_for_later'],
    });
  }
}
