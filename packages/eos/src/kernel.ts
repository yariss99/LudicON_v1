import type {
  Engine,
  EngineDescriptor,
  EngineId,
  EosKernel,
  EosKernelOptions,
  ExecutionContext,
  KernelContext,
  KernelEvent,
  KernelEventBus,
  KernelEventListener,
  KernelEventType,
  KernelLifecycleState,
  RegistrationSource,
  ServiceLocator,
} from '@prima/contracts';
import {
  FatalKernelError,
  RecoverableKernelError,
  defaultStartRetryPolicy,
  createKernelEventBusBridge,
} from '@prima/contracts';
import { MapConfigurationProvider } from './configuration.js';
import { resolveStartupOrder } from './dependency-order.js';
import { InMemoryKernelEventBus } from './event-bus.js';
import { DefaultHealthMonitor } from './health-monitor.js';
import { EngineLifecycleManager } from './lifecycle-manager.js';
import { InMemoryEngineRegistry } from './registry.js';
import { InMemoryServiceLocator } from './service-locator.js';
import { sleep, toKernelError } from './async-util.js';

function createId(): string {
  return `eos-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export class EosKernelImpl implements EosKernel {
  readonly id: string;
  private kernelState: KernelLifecycleState = 'created';
  private readonly registry = new InMemoryEngineRegistry();
  private readonly events: KernelEventBus;
  private readonly configuration: MapConfigurationProvider;
  private readonly services: ServiceLocator;
  private readonly phaseTimeoutMs: number;
  private readonly startRetryCount: number;
  private readonly startRetryDelayMs: number;
  private readonly failKernelOnFatalEngineError: boolean;
  private readonly parallelStart: boolean;
  private readonly clock: () => Date;
  private correlationId: string;
  private executionContext: ExecutionContext;
  private readonly lifecycle: EngineLifecycleManager;
  private readonly healthMonitor: DefaultHealthMonitor;
  private context: KernelContext;

  constructor(options: EosKernelOptions = {}) {
    this.id = options.kernelId ?? createId();
    this.configuration = new MapConfigurationProvider(options.configuration?.getAll() ?? {});
    this.services = options.serviceLocator ?? new InMemoryServiceLocator();
    this.events = options.eventBus
      ? createKernelEventBusBridge(options.eventBus)
      : new InMemoryKernelEventBus();
    this.phaseTimeoutMs = options.phaseTimeoutMs ?? 30_000;
    this.startRetryCount = options.startRetryCount ?? 2;
    this.startRetryDelayMs = options.startRetryDelayMs ?? 50;
    this.failKernelOnFatalEngineError = options.failKernelOnFatalEngineError ?? true;
    this.parallelStart = options.parallelStart ?? true;
    this.clock = () => new Date();
    this.correlationId = createId();
    this.executionContext = {
      correlationId: this.correlationId,
      startedAt: this.clock().toISOString(),
    };
    this.context = this.buildContext();
    this.lifecycle = new EngineLifecycleManager(
      this.registry,
      () => this.context,
      () => this.executionContext,
      this.phaseTimeoutMs,
      (type, engineId, payload) => this.emit(type as KernelEventType, engineId, payload),
    );
    this.healthMonitor = new DefaultHealthMonitor(this.registry, () => this.kernelState);
    this.emit('KernelCreated');
  }

  get state(): KernelLifecycleState {
    return this.kernelState;
  }

  register(engine: Engine, source: RegistrationSource = 'manual'): void {
    this.registry.register(engine, source);
    this.emit('EngineRegistered', engine.metadata.id, {
      version: engine.metadata.version,
      source,
    });
  }

  registerDescriptor(descriptor: EngineDescriptor): void {
    this.registry.registerDescriptor(descriptor);
  }

  unregister(engineId: EngineId): void {
    this.registry.remove(engineId);
    this.emit('EngineUnregistered', engineId);
  }

  enable(engineId: EngineId): void {
    this.registry.enable(engineId);
    this.emit('EngineEnabled', engineId);
  }

  disable(engineId: EngineId): void {
    this.registry.disable(engineId);
    this.emit('EngineDisabled', engineId);
  }

  async configure(overrides: Readonly<Record<string, unknown>> = {}): Promise<void> {
    this.configuration.merge(overrides);
    this.context = this.buildContext();
    this.kernelState = 'configured';
    this.emit('KernelConfigured');
  }

  async start(): Promise<void> {
    if (this.kernelState === 'running') return;
    if (
      this.kernelState !== 'created' &&
      this.kernelState !== 'configured' &&
      this.kernelState !== 'stopped' &&
      this.kernelState !== 'failed'
    ) {
      throw new FatalKernelError(`Cannot start Kernel from state ${this.kernelState}`);
    }

    this.correlationId = createId();
    this.executionContext = {
      correlationId: this.correlationId,
      startedAt: this.clock().toISOString(),
      deadlineAt: new Date(this.clock().getTime() + this.phaseTimeoutMs * 10).toISOString(),
    };
    this.context = this.buildContext();

    this.kernelState = 'starting';
    this.emit('KernelStarting', undefined, { correlationId: this.correlationId });

    try {
      const discovered = this.registry.materializeDescriptors();
      if (discovered.length > 0) {
        this.emit('DiscoveryCompleted', undefined, { count: discovered.length });
      }

      this.resetEnginesForStartup();

      const enabled = this.registry.enabledEngines();
      for (const v of enabled.map((e) => this.registry.validate(e.metadata.id))) {
        if (v.ok) this.emit('EngineValidated', v.engineId);
        else {
          this.emit('EngineValidationFailed', v.engineId, { issues: [...v.issues] });
          throw new FatalKernelError(
            `Engine validation failed: ${v.engineId}: ${v.issues.join('; ')}`,
            { engineId: v.engineId },
          );
        }
      }

      const order = resolveStartupOrder(enabled.map((e) => e.metadata));
      this.emit('DependencyOrderResolved', undefined, { order });

      for (const engineId of order) {
        if (this.registry.getLifecycleState(engineId) === 'registered') {
          await this.lifecycle.initialize(engineId);
        }
        if (this.registry.getLifecycleState(engineId) === 'initialized') {
          await this.lifecycle.configure(
            engineId,
            this.configuration.getEngineConfig(engineId),
          );
        }
      }

      await this.startEngines(order);

      this.kernelState = 'running';
      this.emit('KernelStarted', undefined, { correlationId: this.correlationId });
      this.healthMonitor.probeAll();
      this.emit('HealthChanged');
    } catch (error) {
      this.kernelState = 'failed';
      this.emit('KernelFailed', undefined, { error: String(error) });
      throw toKernelError(error);
    }
  }

  async stop(): Promise<void> {
    if (this.kernelState === 'stopped' || this.kernelState === 'destroyed') return;
    this.kernelState = 'stopping';
    this.emit('KernelStopping');

    const enabled = this.registry.enabledEngines();
    const order = resolveStartupOrder(enabled.map((e) => e.metadata)).reverse();
    const errors: Error[] = [];

    for (const engineId of order) {
      try {
        await this.stopEngineBestEffort(engineId);
      } catch (error) {
        errors.push(toKernelError(error, engineId));
      }
    }

    this.kernelState = 'stopped';
    this.emit('KernelStopped');
    if (errors.length > 0) {
      throw new RecoverableKernelError(
        `Kernel stopped with ${errors.length} engine error(s): ${errors.map((e) => e.message).join('; ')}`,
      );
    }
  }

  async destroy(): Promise<void> {
    if (
      this.kernelState === 'running' ||
      this.kernelState === 'starting' ||
      this.kernelState === 'degraded'
    ) {
      try {
        await this.stop();
      } catch {
        /* continue destroy */
      }
    }

    for (const reg of this.registry.list()) {
      const id = reg.metadata.id;
      try {
        if (this.registry.getLifecycleState(id) === 'destroyed') continue;
        await this.stopEngineBestEffort(id);
        let current = this.registry.getLifecycleState(id);
        if (current === 'stopped') {
          await this.lifecycle.shutdown(id);
          current = this.registry.getLifecycleState(id);
        }
        if (current === 'shutdown' || current === 'registered') {
          await this.lifecycle.destroy(id);
        } else if (
          current === 'failed' ||
          current === 'configured' ||
          current === 'initialized'
        ) {
          this.registry.setLifecycleState(id, 'destroyed');
          await this.registry.getEngine(id).destroy();
          this.emit('EngineDestroyed', id);
        }
      } catch {
        /* isolate */
      }
    }

    this.kernelState = 'destroyed';
    this.emit('KernelDestroyed');
  }

  async restartEngine(engineId: EngineId): Promise<void> {
    await this.lifecycle.restart(engineId);
    this.refreshDegradedState();
  }

  async recoverEngine(engineId: EngineId, reason: string): Promise<void> {
    await this.lifecycle.recover(engineId, reason);
    this.refreshDegradedState();
  }

  getContext(): KernelContext {
    return this.context;
  }

  health() {
    return this.healthMonitor.probeAll();
  }

  on(listener: KernelEventListener): () => void {
    return this.events.subscribe(listener);
  }

  getEvents(): readonly KernelEvent[] {
    return this.events.history();
  }

  private resetEnginesForStartup(): void {
    for (const reg of this.registry.list()) {
      if (!reg.enabled) continue;
      const id = reg.metadata.id;
      const state = this.registry.getLifecycleState(id);
      if (state === 'shutdown' || state === 'stopped' || state === 'failed') {
        this.registry.setLifecycleState(id, 'registered');
      }
    }
  }

  private async stopEngineBestEffort(engineId: EngineId): Promise<void> {
    const state = this.registry.getLifecycleState(engineId);
    if (state === 'shutdown' || state === 'destroyed' || state === 'registered') return;

    if (state === 'running' || state === 'paused') {
      await this.lifecycle.stop(engineId);
    } else if (state === 'failed') {
      this.registry.setLifecycleState(engineId, 'stopping');
      try {
        await this.registry.getEngine(engineId).stop();
      } catch {
        /* isolate */
      }
      this.registry.setLifecycleState(engineId, 'stopped');
      this.emit('EngineStopped', engineId);
    }

    if (this.registry.getLifecycleState(engineId) === 'stopped') {
      await this.lifecycle.shutdown(engineId);
    }
  }

  private async startEngines(order: EngineId[]): Promise<void> {
    const retry = defaultStartRetryPolicy(this.startRetryCount, this.startRetryDelayMs);
    const started = new Set<EngineId>();

    const canStart = (id: EngineId): boolean => {
      const meta = this.registry.getEngine(id).metadata;
      return meta.dependencies.every((d) => started.has(d));
    };

    const startOne = async (engineId: EngineId): Promise<void> => {
      let attempt = 0;
      for (;;) {
        attempt += 1;
        try {
          const state = this.registry.getLifecycleState(engineId);
          // After a failed start attempt, return to configured so start may retry.
          if (state === 'failed') {
            this.registry.setLifecycleState(engineId, 'configured');
          }
          await this.lifecycle.start(engineId);
          started.add(engineId);
          return;
        } catch (error) {
          if (!retry.shouldRetry(error, attempt)) {
            if (this.failKernelOnFatalEngineError) throw toKernelError(error, engineId);
            this.kernelState = 'degraded';
            this.emit('KernelDegraded', engineId, { error: String(error) });
            return;
          }
          await sleep(retry.delayMs);
        }
      }
    };

    if (!this.parallelStart) {
      for (const id of order) await startOne(id);
      return;
    }

    const pending = new Set(order);
    while (pending.size > 0) {
      const wave = [...pending].filter(canStart);
      if (wave.length === 0) {
        throw new FatalKernelError('Unable to progress engine start order (dependency deadlock)');
      }
      await Promise.all(wave.map((id) => startOne(id)));
      for (const id of wave) pending.delete(id);
    }
  }

  private refreshDegradedState(): void {
    if (this.kernelState !== 'running' && this.kernelState !== 'degraded') return;
    const report = this.healthMonitor.probeAll();
    const unhealthy = report.engines.some(
      (e) => e.status === 'unhealthy' || e.status === 'unavailable',
    );
    this.kernelState = unhealthy ? 'degraded' : 'running';
    this.emit('HealthChanged');
  }

  private buildContext(): KernelContext {
    return {
      kernelId: this.id,
      correlationId: this.correlationId,
      configuration: this.configuration,
      services: this.services,
      events: this.events,
      clock: this.clock,
    };
  }

  private emit(
    type: KernelEventType,
    engineId?: string,
    payload?: Record<string, unknown>,
  ): void {
    this.events.publish({
      type,
      kernelId: this.id,
      engineId,
      correlationId: this.correlationId,
      payload,
    });
  }
}

export function createEosKernel(options?: EosKernelOptions): EosKernel {
  return new EosKernelImpl(options);
}
