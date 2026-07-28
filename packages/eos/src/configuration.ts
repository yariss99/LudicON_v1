import type { ConfigurationProvider } from '@prima/contracts';

export class MapConfigurationProvider implements ConfigurationProvider {
  constructor(private readonly values: Record<string, unknown> = {}) {}

  get<T = unknown>(key: string, fallback?: T): T | undefined {
    if (Object.prototype.hasOwnProperty.call(this.values, key)) {
      return this.values[key] as T;
    }
    return fallback;
  }

  getEngineConfig(engineId: string): Readonly<Record<string, unknown>> {
    const scoped = this.values[`engine.${engineId}`];
    if (scoped && typeof scoped === 'object' && !Array.isArray(scoped)) {
      return scoped as Record<string, unknown>;
    }
    return {};
  }

  getAll(): Readonly<Record<string, unknown>> {
    return { ...this.values };
  }

  merge(overrides: Readonly<Record<string, unknown>>): void {
    Object.assign(this.values, overrides);
  }
}
