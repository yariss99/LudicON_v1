import type {
  EngineCapabilityManifest,
  EngineConfigSchema,
  EngineContract,
  EngineDiagnostics,
  EngineExecutionEnvironment,
  EngineHealthSnapshot,
  EngineLifecycleState,
  EngineMetadata,
  EngineObservability,
  EngineOperationalState,
  ExecutionContext,
  KernelContext,
} from '@prima/contracts';
import {
  assertEngineIsolationRules,
  operationalStateToHealthStatus,
  validateEngineManifest,
} from '@prima/contracts';
import { metadataFromManifest } from './compatibility.js';
import {
  MapEngineConfiguration,
  applyConfigDefaults,
  validateConfiguration,
} from './configuration.js';
import { noopObservability } from './observability.js';

export type BasePrimaEngineOptions = {
  readonly observability?: EngineObservability;
};

/**
 * Abstract base for all PRIMA Engines.
 * Implements ES-002 `Engine` + ES-006 `EngineContract`.
 * Subclasses implement hooks — never call peer Engines.
 */
export abstract class BasePrimaEngine implements EngineContract {
  readonly manifest: EngineCapabilityManifest;
  readonly metadata: EngineMetadata;
  protected observability: EngineObservability;
  protected config = new MapEngineConfiguration({});
  protected kernelContext?: KernelContext;
  protected operationalState: EngineOperationalState = 'offline';
  protected lifecycleHint: EngineLifecycleState = 'registered';
  protected lastError?: string;
  protected startedAtMs?: number;

  constructor(manifest: EngineCapabilityManifest, options: BasePrimaEngineOptions = {}) {
    this.manifest = Object.freeze({
      ...manifest,
      capabilities: Object.freeze([...manifest.capabilities]),
      features: Object.freeze([...manifest.features]),
      supportedCommands: Object.freeze([...manifest.supportedCommands]),
      publishedEvents: Object.freeze([...manifest.publishedEvents]),
      consumedEvents: Object.freeze([...manifest.consumedEvents]),
      dependencies: Object.freeze([...manifest.dependencies]),
      configurationKeys: Object.freeze([...manifest.configurationKeys]),
      compatibleKernelVersions: Object.freeze([...manifest.compatibleKernelVersions]),
    });
    this.metadata = metadataFromManifest(this.manifest);
    this.observability = options.observability ?? noopObservability(manifest.engineId);

    const manifestCheck = validateEngineManifest(this.manifest, this.metadata);
    if (!manifestCheck.ok) {
      throw new Error(`Invalid Engine manifest: ${manifestCheck.issues.join('; ')}`);
    }
    const isolation = assertEngineIsolationRules(this.manifest);
    if (!isolation.ok) {
      throw new Error(`Engine isolation violation: ${isolation.issues.join('; ')}`);
    }
  }

  abstract getConfigurationSchema(): EngineConfigSchema;

  /** Subclass hooks */
  protected abstract onInitialize(context: KernelContext): Promise<void>;
  protected abstract onConfigure(config: MapEngineConfiguration): Promise<void>;
  protected abstract onStart(execution: ExecutionContext): Promise<void>;
  protected onPause(): Promise<void> {
    return Promise.resolve();
  }
  protected onResume(): Promise<void> {
    return Promise.resolve();
  }
  protected onStop(): Promise<void> {
    return Promise.resolve();
  }
  protected onShutdown(): Promise<void> {
    return Promise.resolve();
  }
  protected onRecover(_reason: string): Promise<void> {
    return Promise.resolve();
  }
  protected onDestroy(): Promise<void> {
    return Promise.resolve();
  }

  /** Optional rich start — override in subclasses when needed. */
  async onPlatformStart(_env: EngineExecutionEnvironment): Promise<void> {
    return;
  }

  getOperationalState(): EngineOperationalState {
    return this.operationalState;
  }

  diagnostics(): EngineDiagnostics {
    return {
      lifecycleState: this.lifecycleHint,
      operationalState: this.operationalState,
      configKeysLoaded: Object.keys(this.config.values),
      lastError: this.lastError,
      uptimeMs: this.startedAtMs ? Date.now() - this.startedAtMs : undefined,
    };
  }

  async initialize(context: KernelContext): Promise<void> {
    this.kernelContext = context;
    this.observability.logger.info('initialize');
    this.observability.metrics.increment('engine.initialize');
    const span = this.observability.tracer.startSpan('engine.initialize');
    try {
      await this.onInitialize(context);
      this.lifecycleHint = 'initialized';
      this.operationalState = 'offline';
    } catch (error) {
      this.lastError = String(error);
      this.operationalState = 'failed';
      this.lifecycleHint = 'failed';
      this.observability.logger.error('initialize failed', { error: String(error) });
      throw error;
    } finally {
      span.end();
    }
  }

  async configure(raw: Readonly<Record<string, unknown>>): Promise<void> {
    const schema = this.getConfigurationSchema();
    const withDefaults = applyConfigDefaults(schema, raw);
    const validation = validateConfiguration(schema, withDefaults);
    if (!validation.ok) {
      this.operationalState = 'failed';
      this.lastError = validation.issues.join('; ');
      throw new Error(`Configuration invalid: ${validation.issues.join('; ')}`);
    }
    this.config = new MapEngineConfiguration(withDefaults);
    this.observability.logger.info('configure', { keys: Object.keys(withDefaults) });
    try {
      await this.onConfigure(this.config);
      this.lifecycleHint = 'configured';
    } catch (error) {
      this.lastError = String(error);
      this.operationalState = 'failed';
      this.lifecycleHint = 'failed';
      throw error;
    }
  }

  async start(execution: ExecutionContext): Promise<void> {
    this.observability.metrics.increment('engine.start');
    const span = this.observability.tracer.startSpan('engine.start');
    try {
      if (this.kernelContext) {
        const env: EngineExecutionEnvironment = {
          kernel: this.kernelContext,
          execution,
          correlation: {
            correlationId: execution.correlationId,
          },
        };
        await this.onPlatformStart(env);
      }
      await this.onStart(execution);
      this.lifecycleHint = 'running';
      this.operationalState = 'ready';
      this.startedAtMs = Date.now();
      this.lastError = undefined;
    } catch (error) {
      this.lastError = String(error);
      this.operationalState = 'failed';
      this.lifecycleHint = 'failed';
      this.observability.logger.error('start failed', { error: String(error) });
      throw error;
    } finally {
      span.end();
    }
  }

  async pause(): Promise<void> {
    await this.onPause();
    this.lifecycleHint = 'paused';
    this.operationalState = 'busy';
  }

  async resume(): Promise<void> {
    await this.onResume();
    this.lifecycleHint = 'running';
    this.operationalState = 'ready';
  }

  async stop(): Promise<void> {
    await this.onStop();
    this.lifecycleHint = 'stopped';
    this.operationalState = 'offline';
    this.startedAtMs = undefined;
  }

  async shutdown(): Promise<void> {
    await this.onShutdown();
    this.lifecycleHint = 'shutdown';
    this.operationalState = 'offline';
  }

  async recover(reason: string): Promise<void> {
    this.operationalState = 'recovering';
    this.lifecycleHint = 'recovering';
    this.observability.logger.warn('recover', { reason });
    try {
      await this.onRecover(reason);
      this.lifecycleHint = 'running';
      this.operationalState = 'ready';
      this.lastError = undefined;
    } catch (error) {
      this.lastError = String(error);
      this.operationalState = 'failed';
      this.lifecycleHint = 'failed';
      throw error;
    }
  }

  async destroy(): Promise<void> {
    await this.onDestroy();
    this.lifecycleHint = 'destroyed';
    this.operationalState = 'offline';
  }

  health(): EngineHealthSnapshot {
    const status = operationalStateToHealthStatus(this.operationalState);
    return {
      engineId: this.metadata.id,
      status,
      availability: this.operationalState !== 'offline' && this.operationalState !== 'failed',
      version: this.metadata.version,
      lifecycleState: this.lifecycleHint,
      initializationComplete: this.lifecycleHint !== 'registered',
      runtimeOk: this.operationalState === 'ready' || this.operationalState === 'busy',
      recoveryInProgress: this.operationalState === 'recovering',
      dependencyStatuses: {},
      checkedAt: new Date().toISOString(),
      detail: this.lastError,
    };
  }

  /** Mark busy during long work — subclasses may call. */
  protected setBusy(): void {
    if (this.operationalState === 'ready') this.operationalState = 'busy';
  }

  protected setReady(): void {
    if (this.lifecycleHint === 'running') this.operationalState = 'ready';
  }

  protected setDegraded(detail?: string): void {
    this.operationalState = 'degraded';
    if (detail) this.lastError = detail;
  }
}
