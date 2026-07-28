/**
 * Configuration loader + validator for PRIMA Core.
 */

import { CoreKernelError } from '../errors.js';
import { PLATFORM_NAME, PLATFORM_VERSION } from '../version.js';
import type { FeatureFlags, PlatformConfiguration } from '../types.js';

export type ConfigurationSource = {
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly overrides?: Partial<PlatformConfiguration> | Readonly<Record<string, unknown>>;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asFlags(value: unknown): FeatureFlags {
  const out: Record<string, boolean> = {};
  const rec = asRecord(value);
  for (const [k, v] of Object.entries(rec)) {
    out[k] = Boolean(v);
  }
  return Object.freeze(out);
}

function parseEnvFlags(
  env: Readonly<Record<string, string | undefined>>,
  prefix: string,
): FeatureFlags {
  const out: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith(prefix) || value === undefined) continue;
    const flag = key.slice(prefix.length).toLowerCase().replace(/_/g, '.');
    out[flag] = value === '1' || value.toLowerCase() === 'true';
  }
  return Object.freeze(out);
}

export function loadConfiguration(source: ConfigurationSource = {}): PlatformConfiguration {
  const env = source.env ?? {};
  const overrides = asRecord(source.overrides);
  const platformOverride = asRecord(overrides.platform);
  const localizationOverride = asRecord(overrides.localization);
  const loggingOverride = asRecord(overrides.logging);
  const securityOverride = asRecord(overrides.security);

  const environment =
    (overrides.environment as string | undefined) ??
    env.PRIMA_ENV ??
    env.NODE_ENV ??
    'development';

  const featureFlags = Object.freeze({
    ...parseEnvFlags(env, 'PRIMA_FEATURE_'),
    ...asFlags(overrides.featureFlags),
  });

  const experimental = Object.freeze({
    ...parseEnvFlags(env, 'PRIMA_EXPERIMENTAL_'),
    ...asFlags(overrides.experimental),
  });

  const engines = Object.freeze({
    ...asRecord(overrides.engines),
  }) as PlatformConfiguration['engines'];

  const providers = Object.freeze({
    ...asRecord(overrides.providers),
  }) as PlatformConfiguration['providers'];

  const config: PlatformConfiguration = {
    environment: String(environment),
    platform: {
      name: String(platformOverride.name ?? PLATFORM_NAME),
      version: String(platformOverride.version ?? PLATFORM_VERSION),
      locale: String(
        platformOverride.locale ??
          localizationOverride.defaultLocale ??
          env.PRIMA_LOCALE ??
          'ro-RO',
      ),
    },
    featureFlags,
    experimental,
    engines,
    providers,
    localization: {
      defaultLocale: String(
        localizationOverride.defaultLocale ?? env.PRIMA_LOCALE ?? 'ro-RO',
      ),
      supportedLocales: Object.freeze(
        Array.isArray(localizationOverride.supportedLocales)
          ? localizationOverride.supportedLocales.map(String)
          : ['ro-RO', 'en-US'],
      ),
    },
    logging: {
      level: (['debug', 'info', 'warn', 'error'] as const).includes(
        loggingOverride.level as 'debug',
      )
        ? (loggingOverride.level as PlatformConfiguration['logging']['level'])
        : ((env.PRIMA_LOG_LEVEL as PlatformConfiguration['logging']['level']) ??
          'info'),
      structured: Boolean(
        loggingOverride.structured ?? env.PRIMA_LOG_STRUCTURED !== '0',
      ),
    },
    security: {
      requireEducationalContext: Boolean(
        securityOverride.requireEducationalContext ?? true,
      ),
      allowExperimental: Boolean(
        securityOverride.allowExperimental ??
          (environment === 'development' || environment === 'test'),
      ),
    },
    raw: Object.freeze({ ...overrides }),
  };

  return config;
}

export function validateConfiguration(config: PlatformConfiguration): void {
  const errors: string[] = [];
  if (!config.environment) errors.push('environment is required');
  if (!config.platform.name) errors.push('platform.name is required');
  if (!config.platform.version) errors.push('platform.version is required');
  if (!config.localization.defaultLocale) {
    errors.push('localization.defaultLocale is required');
  }
  if (
    config.experimental &&
    Object.values(config.experimental).some(Boolean) &&
    !config.security.allowExperimental
  ) {
    errors.push('experimental features enabled but security.allowExperimental is false');
  }
  if (errors.length > 0) {
    throw new CoreKernelError(
      'INVALID_CONFIGURATION',
      `Configuration validation failed: ${errors.join('; ')}`,
    );
  }
}

export function mergeConfiguration(
  base: PlatformConfiguration,
  patch: Partial<PlatformConfiguration> | Readonly<Record<string, unknown>>,
): PlatformConfiguration {
  return loadConfiguration({
    overrides: {
      ...base.raw,
      ...asRecord(patch),
      environment: (patch as PlatformConfiguration).environment ?? base.environment,
      platform: { ...base.platform, ...asRecord((patch as PlatformConfiguration).platform) },
      featureFlags: {
        ...base.featureFlags,
        ...asFlags((patch as PlatformConfiguration).featureFlags),
      },
      experimental: {
        ...base.experimental,
        ...asFlags((patch as PlatformConfiguration).experimental),
      },
      engines: {
        ...base.engines,
        ...asRecord((patch as PlatformConfiguration).engines),
      },
      providers: {
        ...base.providers,
        ...asRecord((patch as PlatformConfiguration).providers),
      },
      localization: {
        ...base.localization,
        ...asRecord((patch as PlatformConfiguration).localization),
      },
      logging: {
        ...base.logging,
        ...asRecord((patch as PlatformConfiguration).logging),
      },
      security: {
        ...base.security,
        ...asRecord((patch as PlatformConfiguration).security),
      },
    },
  });
}
