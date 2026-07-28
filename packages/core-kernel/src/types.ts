/**
 * PRIMA Core Kernel types — platform bootstrap only, no educational logic.
 */

export type PlatformState =
  | 'created'
  | 'bootstrapping'
  | 'ready'
  | 'degraded'
  | 'stopping'
  | 'stopped'
  | 'failed';

/**
 * Core engine module lifecycle (distinct from EOS ENG-00 Engine states).
 */
export type CoreEngineState =
  | 'discovered'
  | 'registered'
  | 'configured'
  | 'initialized'
  | 'ready'
  | 'running'
  | 'paused'
  | 'stopping'
  | 'stopped'
  | 'failed';

export type PlatformEventType =
  | 'PlatformStarting'
  | 'PlatformReady'
  | 'PlatformStopping'
  | 'PlatformStopped'
  | 'EngineDiscovered'
  | 'EngineRegistered'
  | 'EngineInitialized'
  | 'EngineFailed'
  | 'HealthChanged'
  | 'ConfigurationReloaded'
  | 'DiagnosticsGenerated'
  | (string & {});

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export type CoreEngineHealth = {
  readonly status: HealthStatus;
  readonly message?: string;
  readonly details?: Readonly<Record<string, unknown>>;
};

/**
 * Port every Core engine / module adapts to for Kernel lifecycle.
 */
export type CoreEngineModule = {
  readonly id: string;
  readonly displayName: string;
  readonly version: string;
  readonly dependencies?: readonly string[];
  configure?(config: Readonly<Record<string, unknown>>): Promise<void> | void;
  initialize?(ctx: CoreKernelContext): Promise<void> | void;
  start?(): Promise<void> | void;
  pause?(): Promise<void> | void;
  resume?(): Promise<void> | void;
  stop?(): Promise<void> | void;
  health?(): CoreEngineHealth | Promise<CoreEngineHealth>;
};

export type CoreKernelContext = {
  readonly platformId: string;
  readonly correlationId: string;
  readonly version: string;
  readonly startedAt: string;
  readonly config: PlatformConfiguration;
  readonly container: import('./di/container.js').DependencyContainer;
  readonly services: import('./registry/service-registry.js').ServiceRegistry;
  readonly clock: () => Date;
};

export type FeatureFlags = Readonly<Record<string, boolean>>;

export type PlatformConfiguration = {
  readonly environment: string;
  readonly platform: {
    readonly name: string;
    readonly version: string;
    readonly locale: string;
  };
  readonly featureFlags: FeatureFlags;
  readonly experimental: FeatureFlags;
  readonly engines: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  readonly providers: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  readonly localization: {
    readonly defaultLocale: string;
    readonly supportedLocales: readonly string[];
  };
  readonly logging: {
    readonly level: 'debug' | 'info' | 'warn' | 'error';
    readonly structured: boolean;
  };
  readonly security: {
    readonly requireEducationalContext: boolean;
    readonly allowExperimental: boolean;
  };
  readonly raw: Readonly<Record<string, unknown>>;
};

export type PlatformEvent = {
  readonly eventId: string;
  readonly type: PlatformEventType;
  readonly timestamp: string;
  readonly platformId: string;
  readonly correlationId: string;
  readonly engineId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export type PlatformEventListener = (event: PlatformEvent) => void;

export type EngineHealthSnapshot = {
  readonly engineId: string;
  readonly state: CoreEngineState;
  readonly status: HealthStatus;
  readonly message?: string;
  readonly dependencies: readonly string[];
  readonly checkedAt: string;
};

export type PlatformHealthReport = {
  readonly status: HealthStatus;
  readonly platformState: PlatformState;
  readonly startupTimeMs?: number;
  readonly memoryUsage?: {
    readonly heapUsedMb: number;
    readonly heapTotalMb: number;
    readonly rssMb: number;
  };
  readonly engines: readonly EngineHealthSnapshot[];
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly providerAvailability: Readonly<Record<string, boolean>>;
  readonly checkedAt: string;
};

export type StartupReport = {
  readonly platformId: string;
  readonly version: string;
  readonly environment: string;
  readonly startedAt: string;
  readonly readyAt?: string;
  readonly durationMs?: number;
  readonly steps: readonly { readonly name: string; readonly ok: boolean; readonly ms: number; readonly detail?: string }[];
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
};

export type DependencyGraphReport = {
  readonly nodes: readonly { readonly id: string; readonly version: string }[];
  readonly edges: readonly { readonly from: string; readonly to: string }[];
  readonly startupOrder: readonly string[];
  readonly cycles: readonly (readonly string[])[];
};

export type ConfigurationReport = {
  readonly environment: string;
  readonly featureFlags: FeatureFlags;
  readonly experimental: FeatureFlags;
  readonly engineIds: readonly string[];
  readonly providerIds: readonly string[];
  readonly locale: string;
  readonly loggingLevel: string;
  readonly security: PlatformConfiguration['security'];
};

export type EngineReport = {
  readonly engines: readonly {
    readonly id: string;
    readonly displayName: string;
    readonly version: string;
    readonly state: CoreEngineState;
    readonly dependencies: readonly string[];
  }[];
};

export type VersionReport = {
  readonly platformVersion: string;
  readonly kernelVersion: string;
  readonly runtimeOrchestratorVersion?: string;
  readonly nodeVersion: string;
  readonly engines: Readonly<Record<string, string>>;
};

export type DiagnosticsBundle = {
  readonly generatedAt: string;
  readonly startup: StartupReport;
  readonly dependencyGraph: DependencyGraphReport;
  readonly configuration: ConfigurationReport;
  readonly engines: EngineReport;
  readonly health: PlatformHealthReport;
  readonly version: VersionReport;
};

/** Optional runtime starter — typically wraps @prima/runtime-orchestrator. */
export type RuntimeStarter = {
  readonly start: () => Promise<void> | void;
  readonly stop?: () => Promise<void> | void;
  readonly health?: () => HealthStatus | Promise<HealthStatus>;
  readonly version?: string;
};

export type CoreKernelOptions = {
  readonly platformId?: string;
  readonly configuration?: Partial<PlatformConfiguration> | Readonly<Record<string, unknown>>;
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly runtime?: RuntimeStarter;
  readonly clock?: () => Date;
  /** Lazy discovery providers — called during bootstrap Discover Engines. */
  readonly discoverers?: readonly EngineDiscoverer[];
};

export type EngineDiscoverer = () =>
  | readonly CoreEngineModule[]
  | Promise<readonly CoreEngineModule[]>;
