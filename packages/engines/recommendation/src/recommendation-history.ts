import type { RecommendationCard, RecommendationStatus } from './types.js';

/**
 * RecommendationHistory — preserved audit of recommendation lifecycle.
 */
export class RecommendationHistory {
  private readonly entries: Array<{
    at: string;
    recommendationId: string;
    policyId: string;
    teacherId: string;
    from: RecommendationStatus;
    to: RecommendationStatus;
    note?: string;
  }> = [];

  record(
    card: RecommendationCard,
    from: RecommendationStatus,
    to: RecommendationStatus,
    note?: string,
  ): void {
    this.entries.push({
      at: new Date().toISOString(),
      recommendationId: card.recommendationId,
      policyId: card.policyId,
      teacherId: card.teacherId,
      from,
      to,
      note,
    });
  }

  list(filter?: {
    teacherId?: string;
    recommendationId?: string;
    policyId?: string;
  }) {
    return this.entries.filter((e) => {
      if (filter?.teacherId && e.teacherId !== filter.teacherId) return false;
      if (
        filter?.recommendationId &&
        e.recommendationId !== filter.recommendationId
      ) {
        return false;
      }
      if (filter?.policyId && e.policyId !== filter.policyId) return false;
      return true;
    });
  }

  size(): number {
    return this.entries.length;
  }
}
