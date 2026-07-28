/**
 * ProviderRegistry — register / resolve AIProvider implementations.
 */

import { AIOrchestratorError } from './errors.js';
import type { AIProvider, AIProviderId } from './types.js';

export class ProviderRegistry {
  private readonly providers = new Map<AIProviderId, AIProvider>();

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregister(id: AIProviderId): boolean {
    return this.providers.delete(id);
  }

  get(id: AIProviderId): AIProvider {
    const p = this.providers.get(id);
    if (!p) {
      throw new AIOrchestratorError(
        'PROVIDER_NOT_FOUND',
        `Provider "${id}" is not registered.`,
      );
    }
    return p;
  }

  tryGet(id: AIProviderId): AIProvider | undefined {
    return this.providers.get(id);
  }

  list(): readonly AIProvider[] {
    return [...this.providers.values()];
  }

  has(id: AIProviderId): boolean {
    return this.providers.has(id);
  }
}
