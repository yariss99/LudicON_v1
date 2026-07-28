/** Configuration provider contract. */

export interface ConfigurationProvider {
  get<T = unknown>(key: string, fallback?: T): T | undefined;
  getEngineConfig(engineId: string): Readonly<Record<string, unknown>>;
  getAll(): Readonly<Record<string, unknown>>;
}
