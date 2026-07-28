import { DEFAULT_QUALITY_POLICIES } from './policies/default-policies.js';
import type {
  QualityDimension,
  QualityPolicy,
  QualityTrigger,
} from './types.js';

/**
 * QualityPolicyEngine — loads/caches external quality policies.
 */
export class QualityPolicyEngine {
  private readonly cache = new Map<string, QualityPolicy>();

  constructor(policies: QualityPolicy[] = DEFAULT_QUALITY_POLICIES) {
    this.load(policies);
  }

  load(policies: QualityPolicy[]): void {
    this.cache.clear();
    for (const policy of policies) {
      if (policy.enabled === false) continue;
      this.cache.set(policy.policyId, structuredClone(policy));
    }
  }

  register(policy: QualityPolicy): void {
    this.cache.set(policy.policyId, structuredClone(policy));
  }

  list(): QualityPolicy[] {
    return [...this.cache.values()].map((p) => structuredClone(p));
  }

  get(policyId: string): QualityPolicy | undefined {
    const p = this.cache.get(policyId);
    return p ? structuredClone(p) : undefined;
  }

  forTrigger(trigger: QualityTrigger): QualityPolicy[] {
    return this.list().filter((policy) => {
      if (trigger === 'FullEvaluation') return true;
      const triggers = Array.isArray(policy.trigger)
        ? policy.trigger
        : [policy.trigger];
      return triggers.includes(trigger);
    });
  }

  forDimensions(dimensions: QualityDimension[]): QualityPolicy[] {
    const set = new Set(dimensions);
    return this.list().filter((p) => set.has(p.category));
  }

  cacheSize(): number {
    return this.cache.size;
  }
}
