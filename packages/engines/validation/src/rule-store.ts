/**
 * Rule store — loads externalized rules from providers (JSON / TS).
 */

import type { RuleProvider, ValidationRule } from './types.js';

export class RuleEngine {
  private readonly providers: RuleProvider[] = [];
  private cache: readonly ValidationRule[] | null = null;

  registerProvider(provider: RuleProvider): void {
    this.providers.push(provider);
    this.cache = null;
  }

  async loadAll(): Promise<readonly ValidationRule[]> {
    if (this.cache) return this.cache;
    const all: ValidationRule[] = [];
    for (const provider of this.providers) {
      const rules = await provider.loadRules();
      all.push(...rules);
    }
    this.cache = Object.freeze(all.filter((r) => r.enabled));
    return this.cache;
  }

  invalidate(): void {
    this.cache = null;
  }

  async rulesFor(input: {
    validatorId: string;
    artifactType: string;
    profileId: string;
  }): Promise<readonly ValidationRule[]> {
    const all = await this.loadAll();
    return all.filter(
      (r) =>
        r.validatorId === input.validatorId &&
        (r.artifactTypes.includes(input.artifactType) ||
          r.artifactTypes.includes('*' as never)) &&
        (r.profiles.includes(input.profileId as never) ||
          r.profiles.includes('*' as never)),
    );
  }
}

export function createStaticRuleProvider(
  id: string,
  rules: readonly ValidationRule[],
): RuleProvider {
  return {
    id,
    loadRules: () => rules,
  };
}
