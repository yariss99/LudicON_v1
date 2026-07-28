import type { EngineConfigSchema, EngineConfiguration } from '@prima/contracts';

export class MapEngineConfiguration implements EngineConfiguration {
  constructor(readonly values: Readonly<Record<string, unknown>>) {}

  get<T = unknown>(key: string, fallback?: T): T | undefined {
    if (Object.prototype.hasOwnProperty.call(this.values, key)) {
      return this.values[key] as T;
    }
    return fallback;
  }
}

export function applyConfigDefaults(
  schema: EngineConfigSchema,
  overrides: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const values: Record<string, unknown> = { ...overrides };
  for (const key of schema.keys) {
    if (!(key.key in values) && key.defaultValue !== undefined) {
      values[key.key] = key.defaultValue;
    }
  }
  return values;
}

export function validateConfiguration(
  schema: EngineConfigSchema,
  values: Readonly<Record<string, unknown>>,
): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  for (const key of schema.keys) {
    if (key.required && (values[key.key] === undefined || values[key.key] === null)) {
      issues.push(`Missing required configuration: ${key.key}`);
    }
  }
  return { ok: issues.length === 0, issues };
}
