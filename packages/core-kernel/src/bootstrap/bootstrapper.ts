/**
 * Bootstrapper — ordered PRIMA Core boot sequence.
 */

import {
  loadConfiguration,
  mergeConfiguration,
  validateConfiguration,
} from '../configuration/loader.js';
import { Diagnostics } from '../diagnostics/diagnostics.js';
import { PlatformEventBus } from '../events/platform-event-bus.js';
import { HealthMonitor } from '../health/health-monitor.js';
import { resolveStartupOrder } from '../lifecycle/dependency-order.js';
import { EngineLifecycleManager } from '../lifecycle/engine-lifecycle.js';
import type { DependencyContainer } from '../di/container.js';
import type { ServiceRegistry } from '../registry/service-registry.js';
import type {
  CoreEngineModule,
  CoreKernelContext,
  CoreKernelOptions,
  EngineDiscoverer,
  PlatformConfiguration,
  PlatformState,
  RuntimeStarter,
  StartupReport,
} from '../types.js';

export type BootstrapperDeps = {
  readonly platformId: string;
  readonly correlationId: string;
  readonly container: DependencyContainer;
  readonly services: ServiceRegistry;
  readonly events: PlatformEventBus;
  readonly lifecycle: EngineLifecycleManager;
  readonly clock: () => Date;
  readonly getState: () => PlatformState;
  readonly setState: (state: PlatformState) => void;
  readonly options: CoreKernelOptions;
  readonly pushError: (msg: string) => void;
  readonly pushWarning: (msg: string) => void;
  readonly setConfig: (config: PlatformConfiguration) => void;
  readonly getConfig: () => PlatformConfiguration;
  readonly setStartupReport: (report: StartupReport) => void;
  readonly getRuntime: () => RuntimeStarter | undefined;
  readonly setRuntime: (runtime: RuntimeStarter | undefined) => void;
  readonly setStartupTimeMs: (ms: number) => void;
  readonly health: HealthMonitor;
  readonly diagnostics: Diagnostics;
  readonly kernelVersion: string;
};

export class Bootstrapper {
  constructor(private readonly deps: BootstrapperDeps) {}

  async boot(): Promise<StartupReport> {
    const steps: StartupReport['steps'][number][] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const startedAt = this.deps.clock().toISOString();
    const bootStarted = Date.now();

    this.deps.setState('bootstrapping');
    this.deps.events.publish({ type: 'PlatformStarting', payload: {} });

    const runStep = async (
      name: string,
      fn: () => Promise<void> | void,
    ): Promise<void> => {
      const t0 = Date.now();
      try {
        await fn();
        steps.push({ name, ok: true, ms: Date.now() - t0 });
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        steps.push({ name, ok: false, ms: Date.now() - t0, detail });
        errors.push(`${name}: ${detail}`);
        throw err;
      }
    };

    try {
      await runStep('Load Configuration', () => {
        const config = loadConfiguration({
          env: this.deps.options.env ?? (typeof process !== 'undefined' ? process.env : {}),
          overrides: this.deps.options.configuration,
        });
        this.deps.setConfig(config);
      });

      await runStep('Validate Configuration', () => {
        validateConfiguration(this.deps.getConfig());
      });

      await runStep('Initialize Dependency Container', () => {
        const config = this.deps.getConfig();
        this.deps.container.registerValue('platform.config', config);
        this.deps.container.registerValue('platform.id', this.deps.platformId);
        this.deps.container.registerValue(
          'platform.version',
          config.platform.version,
        );
        this.deps.container.registerValue('platform.events', this.deps.events);
        this.deps.container.registerValue('platform.services', this.deps.services);
      });

      await runStep('Discover Engines', async () => {
        const discoverers: EngineDiscoverer[] = [
          ...(this.deps.options.discoverers ?? []),
        ];
        for (const discover of discoverers) {
          const found = await discover();
          for (const module of found) {
            this.deps.lifecycle.markDiscovered(module.id);
            if (!this.deps.services.has(module.id)) {
              this.deps.services.register(module);
            }
          }
        }
      });

      await runStep('Register Engines', async () => {
        for (const id of this.deps.services.listIds()) {
          await this.deps.services.resolve(id);
          if (this.deps.lifecycle.getState(id) !== 'registered') {
            this.deps.lifecycle.markRegistered(id);
          }
        }
      });

      let order: string[] = [];
      await runStep('Resolve Dependencies', async () => {
        const modules = await this.deps.services.listModules();
        order = resolveStartupOrder(modules);
      });

      await runStep('Initialize Engines', async () => {
        const ctx = this.buildContext();
        for (const id of order) {
          await this.deps.lifecycle.configure(id, this.deps.getConfig());
          await this.deps.lifecycle.initialize(id, ctx);
          this.deps.lifecycle.markReady(id);
          await this.deps.lifecycle.start(id);
        }
      });

      await runStep('Run Health Checks', async () => {
        const health = await this.deps.health.probe();
        if (health.status === 'unhealthy') {
          throw new Error('Platform health check failed (unhealthy)');
        }
        if (health.status === 'degraded') {
          warnings.push('Platform health degraded after engine start');
          this.deps.pushWarning(warnings[warnings.length - 1]!);
        }
      });

      await runStep('Start Runtime', async () => {
        const runtime = this.deps.getRuntime() ?? this.deps.options.runtime;
        if (runtime) {
          this.deps.setRuntime(runtime);
          this.deps.container.registerValue('platform.runtime', runtime);
          await runtime.start();
        } else {
          warnings.push('No RuntimeStarter provided — runtime not started');
          this.deps.pushWarning(warnings[warnings.length - 1]!);
        }
      });

      const readyAt = this.deps.clock().toISOString();
      const durationMs = Date.now() - bootStarted;
      this.deps.setStartupTimeMs(durationMs);
      this.deps.setState('ready');
      this.deps.events.publish({
        type: 'PlatformReady',
        payload: { durationMs },
      });

      const report: StartupReport = {
        platformId: this.deps.platformId,
        version: this.deps.getConfig().platform.version,
        environment: this.deps.getConfig().environment,
        startedAt,
        readyAt,
        durationMs,
        steps: Object.freeze(steps),
        errors: Object.freeze(errors),
        warnings: Object.freeze(warnings),
      };
      this.deps.setStartupReport(report);

      const bundle = await this.deps.diagnostics.generate();
      this.deps.events.publish({
        type: 'DiagnosticsGenerated',
        payload: { generatedAt: bundle.generatedAt },
      });

      return report;
    } catch (err) {
      this.deps.setState('failed');
      const message = err instanceof Error ? err.message : String(err);
      this.deps.pushError(message);
      const report: StartupReport = {
        platformId: this.deps.platformId,
        version: this.deps.getConfig()?.platform?.version ?? this.deps.kernelVersion,
        environment: this.deps.getConfig()?.environment ?? 'unknown',
        startedAt,
        durationMs: Date.now() - bootStarted,
        steps: Object.freeze(steps),
        errors: Object.freeze([...errors, message]),
        warnings: Object.freeze(warnings),
      };
      this.deps.setStartupReport(report);
      throw err;
    }
  }

  async reloadConfiguration(
    patch: Partial<PlatformConfiguration> | Readonly<Record<string, unknown>>,
  ): Promise<void> {
    const next = mergeConfiguration(this.deps.getConfig(), patch);
    validateConfiguration(next);
    this.deps.setConfig(next);
    this.deps.container.registerValue('platform.config', next);
    this.deps.events.publish({
      type: 'ConfigurationReloaded',
      payload: { environment: next.environment },
    });
  }

  private buildContext(): CoreKernelContext {
    return {
      platformId: this.deps.platformId,
      correlationId: this.deps.correlationId,
      version: this.deps.kernelVersion,
      startedAt: this.deps.clock().toISOString(),
      config: this.deps.getConfig(),
      container: this.deps.container,
      services: this.deps.services,
      clock: this.deps.clock,
    };
  }
}

/** Helper for tests / discoverers — wrap modules as discoverer. */
export function staticDiscoverer(
  modules: readonly CoreEngineModule[],
): EngineDiscoverer {
  return () => modules;
}
