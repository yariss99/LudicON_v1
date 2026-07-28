/**
 * PrimaCoreKernel — single entry point for starting PRIMA Core.
 *
 * Bootstraps configuration, DI, engine discovery/lifecycle, health,
 * diagnostics, and the Runtime Orchestrator. No educational business logic.
 *
 * Relationship:
 * - @prima/eos — PAS ENG-00 constitutional Engine supervisor (separate)
 * - @prima/runtime-orchestrator — execution pipelines (started by this kernel)
 * - @prima/core-kernel — this package: platform bootstrap entry
 */

import { Bootstrapper } from '../bootstrap/bootstrapper.js';
import { loadConfiguration } from '../configuration/loader.js';
import { DependencyContainer, token } from '../di/container.js';
import { Diagnostics } from '../diagnostics/diagnostics.js';
import { CoreKernelError } from '../errors.js';
import { PlatformEventBus } from '../events/platform-event-bus.js';
import { HealthMonitor } from '../health/health-monitor.js';
import { newId } from '../ids.js';
import { EngineLifecycleManager } from '../lifecycle/engine-lifecycle.js';
import { ServiceRegistry } from '../registry/service-registry.js';
import { CORE_KERNEL_VERSION } from '../version.js';
import type {
  CoreEngineModule,
  CoreKernelOptions,
  DiagnosticsBundle,
  PlatformConfiguration,
  PlatformEvent,
  PlatformEventListener,
  PlatformHealthReport,
  PlatformState,
  RuntimeStarter,
  StartupReport,
} from '../types.js';

export const TOKENS = {
  config: token<PlatformConfiguration>('platform.config'),
  runtime: token<RuntimeStarter>('platform.runtime'),
  events: token<PlatformEventBus>('platform.events'),
  services: token<ServiceRegistry>('platform.services'),
} as const;

export class PrimaCoreKernel {
  readonly platformId: string;
  readonly version = CORE_KERNEL_VERSION;

  private state: PlatformState = 'created';
  private correlationId: string;
  private config: PlatformConfiguration;
  private startupReport: StartupReport;
  private startupTimeMs?: number;
  private runtime?: RuntimeStarter;
  private readonly errors: string[] = [];
  private readonly warnings: string[] = [];
  private readonly clock: () => Date;
  private readonly options: CoreKernelOptions;

  private readonly container: DependencyContainer;
  private readonly services: ServiceRegistry;
  private readonly events: PlatformEventBus;
  private readonly lifecycle: EngineLifecycleManager;
  private readonly health: HealthMonitor;
  private readonly diagnostics: Diagnostics;
  private readonly bootstrapper: Bootstrapper;

  constructor(options: CoreKernelOptions = {}) {
    this.options = options;
    this.platformId = options.platformId ?? newId('prima');
    this.clock = options.clock ?? (() => new Date());
    this.correlationId = newId('corr');
    this.config = loadConfiguration({
      env: options.env ?? (typeof process !== 'undefined' ? process.env : {}),
      overrides: options.configuration,
    });
    this.runtime = options.runtime;
    this.container = new DependencyContainer();
    this.services = new ServiceRegistry();
    this.events = new PlatformEventBus(
      this.platformId,
      () => this.correlationId,
      this.clock,
    );
    this.lifecycle = new EngineLifecycleManager(this.services, this.events);
    this.health = new HealthMonitor(
      this.services,
      this.lifecycle,
      this.events,
      () => this.state,
      () => this.startupTimeMs,
      () => this.runtime,
      () => this.errors,
      () => this.warnings,
      () => this.providerAvailability(),
    );
    this.diagnostics = new Diagnostics(
      this.services,
      this.lifecycle,
      () => this.config,
      () => this.startupReport,
      () => this.health.probe(),
      () => this.runtime,
    );
    this.startupReport = {
      platformId: this.platformId,
      version: this.config.platform.version,
      environment: this.config.environment,
      startedAt: this.clock().toISOString(),
      steps: [],
      errors: [],
      warnings: [],
    };
    this.bootstrapper = new Bootstrapper({
      platformId: this.platformId,
      correlationId: this.correlationId,
      container: this.container,
      services: this.services,
      events: this.events,
      lifecycle: this.lifecycle,
      clock: this.clock,
      getState: () => this.state,
      setState: (s) => {
        this.state = s;
      },
      options: this.options,
      pushError: (m) => this.errors.push(m),
      pushWarning: (m) => this.warnings.push(m),
      setConfig: (c) => {
        this.config = c;
      },
      getConfig: () => this.config,
      setStartupReport: (r) => {
        this.startupReport = r;
      },
      getRuntime: () => this.runtime,
      setRuntime: (r) => {
        this.runtime = r;
      },
      setStartupTimeMs: (ms) => {
        this.startupTimeMs = ms;
      },
      health: this.health,
      diagnostics: this.diagnostics,
      kernelVersion: CORE_KERNEL_VERSION,
    });
  }

  get platformState(): PlatformState {
    return this.state;
  }

  getContainer(): DependencyContainer {
    return this.container;
  }

  getServiceRegistry(): ServiceRegistry {
    return this.services;
  }

  getConfiguration(): PlatformConfiguration {
    return this.config;
  }

  /** Register a Core engine module before or during discovery. */
  register(module: CoreEngineModule): void {
    this.services.register(module);
    this.lifecycle.markDiscovered(module.id);
    this.lifecycle.markRegistered(module.id);
  }

  /** Lazy registration — materialized during bootstrap. */
  registerLazy(
    id: string,
    factory: () => CoreEngineModule | Promise<CoreEngineModule>,
  ): void {
    this.services.registerLazy(id, factory);
    this.lifecycle.markDiscovered(id);
  }

  /**
   * Single entry: run full boot process to Platform Ready.
   */
  async start(): Promise<StartupReport> {
    if (this.state === 'ready') return this.startupReport;
    if (this.state === 'bootstrapping') {
      throw new CoreKernelError('BOOT_IN_PROGRESS', 'Platform boot already in progress');
    }
    this.correlationId = newId('corr');
    this.errors.length = 0;
    this.warnings.length = 0;
    return this.bootstrapper.boot();
  }

  async stop(): Promise<void> {
    if (this.state === 'stopped' || this.state === 'created') {
      this.state = 'stopped';
      return;
    }
    this.state = 'stopping';
    this.events.publish({ type: 'PlatformStopping', payload: {} });

    try {
      await this.runtime?.stop?.();
    } catch (err) {
      this.errors.push(`runtime.stop: ${String(err)}`);
    }

    const ids = [...this.services.listIds()].reverse();
    for (const id of ids) {
      try {
        await this.lifecycle.stop(id);
      } catch (err) {
        this.errors.push(`engine.stop ${id}: ${String(err)}`);
      }
    }

    this.state = 'stopped';
    this.events.publish({ type: 'PlatformStopped', payload: {} });
  }

  async reloadConfiguration(
    patch: Partial<PlatformConfiguration> | Readonly<Record<string, unknown>>,
  ): Promise<void> {
    await this.bootstrapper.reloadConfiguration(patch);
  }

  async healthCheck(): Promise<PlatformHealthReport> {
    return this.health.probe();
  }

  async diagnosticsReport(): Promise<DiagnosticsBundle> {
    const bundle = await this.diagnostics.generate();
    this.events.publish({
      type: 'DiagnosticsGenerated',
      payload: { generatedAt: bundle.generatedAt },
    });
    return bundle;
  }

  getStartupReport(): StartupReport {
    return this.startupReport;
  }

  on(listener: PlatformEventListener): () => void {
    return this.events.subscribe(listener);
  }

  getEvents(): readonly PlatformEvent[] {
    return this.events.list();
  }

  isFeatureEnabled(flag: string): boolean {
    return Boolean(this.config.featureFlags[flag]);
  }

  isExperimentalEnabled(flag: string): boolean {
    if (!this.config.security.allowExperimental) return false;
    return Boolean(this.config.experimental[flag]);
  }

  private providerAvailability(): Record<string, boolean> {
    const out: Record<string, boolean> = {};
    for (const id of Object.keys(this.config.providers)) {
      const cfg = this.config.providers[id] ?? {};
      out[id] = cfg.enabled !== false;
    }
    if (this.runtime) out['runtime'] = true;
    return out;
  }
}

export function createPrimaCoreKernel(
  options?: CoreKernelOptions,
): PrimaCoreKernel {
  return new PrimaCoreKernel(options);
}
