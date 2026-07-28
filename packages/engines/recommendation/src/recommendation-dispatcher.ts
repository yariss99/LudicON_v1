import type { RecommendationCard } from './types.js';

export type RecommendationListener = (cards: RecommendationCard[]) => void;

/**
 * RecommendationDispatcher — push cards to consumers (non-intrusive).
 * No modals; consumers render contextual cards.
 */
export class RecommendationDispatcher {
  private readonly listeners = new Set<RecommendationListener>();

  subscribe(listener: RecommendationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  dispatch(cards: RecommendationCard[]): void {
    for (const listener of this.listeners) {
      listener(cards.map((c) => structuredClone(c)));
    }
  }

  listenerCount(): number {
    return this.listeners.size;
  }
}
