/**
 * Engine SDK contracts (ES-006) — constitutional contract for every PRIMA Engine.
 * Extends ES-002 Engine without breaking Kernel compatibility.
 */

import type { Engine, EngineCapability, EngineId, EngineMetadata, SemanticVersion } from './engine.js';
import type { EngineLifecycleState } from './lifecycle.js';
import type { HealthStatus } from './health.js';
import type { UserContext } from './event-envelope.js';
import type { KernelContext, ExecutionContext } from './context.js';

/** Operational health as required by Engine SDK (maps onto HealthStatus). */
export type EngineOperationalState =
  | 'ready'
  | 'busy'
  | 'degraded'
  | 'offline'
  | 'recovering'
  | 'failed';

export function operationalStateToHealthStatus(state: EngineOperationalState): HealthStatus {
  switch (state) {
    case 'ready':
    case 'busy':
      return 'healthy';
    case 'degraded':
      return 'degraded';
    case 'recovering':
      return 'degraded';
    case 'failed':
      return 'unhealthy';
    case 'offline':
      return 'unavailable';
    default:
      return 'unknown';
  }
}

export interface EngineFeatureFlag {
  readonly id: string;
  readonly enabled: boolean;
  readonly description?: string;
}

/**
 * Full capability declaration — every Engine must provide this.
 */
export interface EngineCapabilityManifest {
  readonly engineId: EngineId;
  readonly constitutionalCode?: string;
  readonly name: string;
  readonly version: SemanticVersion;
  /** Minimum Kernel / platform version this Engine supports */
  readonly compatibleKernelVersions: readonly string[];
  readonly capabilities: readonly EngineCapability[];
  readonly features: readonly EngineFeatureFlag[];
  /** Command types this Engine handles (via Command Bus handlers it owns) */
  readonly supportedCommands: readonly string[];
  /** Domain/system events this Engine may publish */
  readonly publishedEvents: readonly string[];
  /** Events this Engine consumes (via Event Bus subscriptions it owns) */
  readonly consumedEvents: readonly string[];
  /** Alias of consumed for clarity in docs */
  readonly supportedEvents?: readonly string[];
  /** EngineIds that must be running first (same as metadata.dependencies) */
  readonly dependencies: readonly EngineId[];
  readonly configurationKeys: readonly string[];
}

export interface EngineConfigSchema {
  readonly keys: readonly EngineConfigKey[];
}

export interface EngineConfigKey {
  readonly key: string;
  readonly required?: boolean;
  readonly defaultValue?: unknown;
  readonly description?: string;
  readonly secret?: boolean;
}

export interface EngineConfiguration {
  readonly values: Readonly<Record<string, unknown>>;
  get<T = unknown>(key: string, fallback?: T): T | undefined;
}

export interface SecurityContext {
  readonly tenantId?: string;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
}

export interface ProjectContext {
  readonly projectId?: string;
  readonly learningExperienceId?: string;
}

export interface EducationalContext {
  readonly subject?: string;
  readonly gradeBand?: string;
  readonly locale?: string;
}

export interface CorrelationContext {
  readonly correlationId: string;
  readonly causationId?: string;
  readonly commandId?: string;
}

/**
 * Rich execution context available to Engines (platform-provided).
 * Engines must not invent peer Engine clients from this context.
 */
export interface EngineExecutionEnvironment {
  readonly kernel: KernelContext;
  readonly execution: ExecutionContext;
  readonly user?: UserContext;
  readonly security?: SecurityContext;
  readonly project?: ProjectContext;
  readonly educational?: EducationalContext;
  readonly correlation: CorrelationContext;
}

export interface EngineLogger {
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}

export interface EngineMetrics {
  increment(name: string, tags?: Record<string, string>): void;
  gauge(name: string, value: number, tags?: Record<string, string>): void;
  timing(name: string, durationMs: number, tags?: Record<string, string>): void;
}

export interface EngineTracer {
  startSpan(name: string, fields?: Record<string, unknown>): { end(): void };
}

export interface EngineObservability {
  readonly logger: EngineLogger;
  readonly metrics: EngineMetrics;
  readonly tracer: EngineTracer;
}

export interface EngineDiagnostics {
  readonly lifecycleState: EngineLifecycleState;
  readonly operationalState: EngineOperationalState;
  readonly configKeysLoaded: readonly string[];
  readonly lastError?: string;
  readonly uptimeMs?: number;
}

/**
 * Full Engine SDK contract. Every PRIMA Engine MUST implement this.
 * Remains a subtype of ES-002 `Engine` so EOS Kernel can host it unchanged.
 */
export interface EngineContract extends Engine {
  /** Canonical capability declaration */
  readonly manifest: EngineCapabilityManifest;

  /** Configuration schema (static) */
  getConfigurationSchema(): EngineConfigSchema;

  /** Current operational health state */
  getOperationalState(): EngineOperationalState;

  /** Diagnostics snapshot for observability */
  diagnostics(): EngineDiagnostics;

  /**
   * Optional rich start hook — Kernel still calls `start(ExecutionContext)`.
   * SDK BaseEngine maps Kernel start → onStart(env).
   */
  onPlatformStart?(env: EngineExecutionEnvironment): Promise<void>;
}

export interface EngineCompatibilityResult {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

export function validateEngineManifest(
  manifest: EngineCapabilityManifest,
  metadata: EngineMetadata,
): EngineCompatibilityResult {
  const issues: string[] = [];
  if (manifest.engineId !== metadata.id) {
    issues.push(`manifest.engineId (${manifest.engineId}) != metadata.id (${metadata.id})`);
  }
  if (manifest.version !== metadata.version) {
    issues.push(`manifest.version (${manifest.version}) != metadata.version (${metadata.version})`);
  }
  if (!manifest.name) issues.push('manifest.name required');
  if (!manifest.version) issues.push('manifest.version required');
  for (const dep of manifest.dependencies) {
    if (!metadata.dependencies.includes(dep)) {
      issues.push(`manifest dependency ${dep} missing from metadata.dependencies`);
    }
  }
  for (const dep of metadata.dependencies) {
    if (!manifest.dependencies.includes(dep)) {
      issues.push(`metadata dependency ${dep} missing from manifest.dependencies`);
    }
  }
  return { ok: issues.length === 0, issues };
}

export function assertEngineIsolationRules(manifest: EngineCapabilityManifest): EngineCompatibilityResult {
  const issues: string[] = [];
  // Engines must not declare peer invocation capabilities
  const forbiddenCaps = ['invoke-peer-engine', 'direct-engine-call'];
  for (const cap of manifest.capabilities) {
    if (forbiddenCaps.includes(cap)) {
      issues.push(`Forbidden capability: ${cap}`);
    }
  }
  return { ok: issues.length === 0, issues };
}
