import type { RecommendationPolicy, RecommendationTrigger } from './types.js';
import { DEFAULT_RECOMMENDATION_POLICIES } from './policies/default-policies.js';

/**
 * RecommendationPolicyEngine — loads and caches external policies.
 * Rules are configuration, not component code.
 */
export class RecommendationPolicyEngine {
  private readonly cache = new Map<string, RecommendationPolicy>();

  constructor(policies: RecommendationPolicy[] = DEFAULT_RECOMMENDATION_POLICIES) {
    this.load(policies);
  }

  load(policies: RecommendationPolicy[]): void {
    this.cache.clear();
    for (const policy of policies) {
      if (policy.enabled === false) continue;
      this.cache.set(policy.policyId, structuredClone(policy));
    }
  }

  register(policy: RecommendationPolicy): void {
    this.cache.set(policy.policyId, structuredClone(policy));
  }

  get(policyId: string): RecommendationPolicy | undefined {
    const p = this.cache.get(policyId);
    return p ? structuredClone(p) : undefined;
  }

  list(): RecommendationPolicy[] {
    return [...this.cache.values()].map((p) => structuredClone(p));
  }

  forTrigger(trigger: RecommendationTrigger): RecommendationPolicy[] {
    return this.list().filter((policy) => {
      const triggers = Array.isArray(policy.trigger)
        ? policy.trigger
        : [policy.trigger];
      return triggers.includes(trigger);
    });
  }

  /** Expose cache snapshot for diagnostics */
  cacheSize(): number {
    return this.cache.size;
  }
}
