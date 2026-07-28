/**
 * ProviderSelector — strategy-based selection (never hardcoded in app code).
 */

import { AIOrchestratorError } from './errors.js';
import type { ProviderRegistry } from './provider-registry.js';
import type {
  AIProvider,
  AIProviderId,
  SelectionCriteria,
} from './types.js';

export type ProviderScore = {
  readonly provider: AIProvider;
  readonly score: number;
  readonly reasons: readonly string[];
};

export class ProviderSelector {
  constructor(private readonly registry: ProviderRegistry) {}

  async select(criteria: SelectionCriteria): Promise<AIProvider> {
    const ranked = await this.rank(criteria);
    if (ranked.length === 0) {
      throw new AIOrchestratorError(
        'NO_PROVIDER',
        `No healthy provider supports request type "${criteria.requestType}".`,
      );
    }
    return ranked[0]!.provider;
  }

  async rank(criteria: SelectionCriteria): Promise<readonly ProviderScore[]> {
    const allow = new Set(criteria.teacherPreferences?.allowProviders ?? []);
    const deny = new Set(criteria.teacherPreferences?.denyProviders ?? []);
    const preferLowCost = criteria.teacherPreferences?.preferLowCost ?? false;
    const preferLowLatency =
      criteria.teacherPreferences?.preferLowLatency ??
      criteria.priority === 'high';

    const scored: ProviderScore[] = [];

    for (const provider of this.registry.list()) {
      if (deny.has(provider.id)) continue;
      if (allow.size > 0 && !allow.has(provider.id)) continue;
      if (!provider.supports(criteria.requestType)) continue;

      const health = await provider.healthCheck();
      if (!health.healthy) continue;

      let score = 10;
      const reasons: string[] = ['supports-request-type', 'healthy'];

      if (
        criteria.preferredProviderId &&
        provider.id === criteria.preferredProviderId
      ) {
        score += 20;
        reasons.push('preferred');
      }

      const estimate = provider.estimateCost({
        promptTokens: 800,
        completionTokens: 800,
      });
      if (preferLowCost) {
        score += Math.max(0, 10 - estimate.estimatedUsd * 100);
        reasons.push('cost-weight');
      }

      if (preferLowLatency && typeof health.latencyMs === 'number') {
        score += Math.max(0, 10 - health.latencyMs / 100);
        reasons.push('latency-weight');
      }

      if (criteria.priority === 'high') {
        score += 2;
      }

      scored.push({ provider, score, reasons });
    }

    return scored.sort((a, b) => b.score - a.score);
  }

  /** Resolve a concrete id when orchestration policy pins one (tests / admin). */
  require(id: AIProviderId): AIProvider {
    return this.registry.get(id);
  }
}
