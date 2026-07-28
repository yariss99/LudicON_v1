import type {
  EngineLifecycleState,
  ExecutionContext,
  KernelContext,
  LifecycleManager,
} from '@prima/contracts';
import { ENGINE_LIFECYCLE_TRANSITIONS, FatalKernelError } from '@prima/contracts';
import type { InMemoryEngineRegistry } from './registry.js';
import { toKernelError, withTimeout } from './async-util.js';

export class EngineLifecycleManager implements LifecycleManager {
  constructor(
    private readonly registry: InMemoryEngineRegistry,
    private readonly context: () => KernelContext,
    private readonly execution: () => ExecutionContext,
    private readonly phaseTimeoutMs: number,
    private readonly emit: (type: string, engineId: string, payload?: Record<string, unknown>) => void,
  ) {}

  getState(engineId: string): EngineLifecycleState {
    return this.registry.getLifecycleState(engineId);
  }

  assertTransition(engineId: string, to: EngineLifecycleState): void {
    const from = this.getState(engineId);
    const allowed = ENGINE_LIFECYCLE_TRANSITIONS[from];
    if (!allowed.includes(to)) {
      throw new FatalKernelError(
        `Illegal lifecycle transition for ${engineId}: ${from} -> ${to}`,
        { engineId },
      );
    }
  }

  transition(engineId: string, to: EngineLifecycleState): void {
    this.assertTransition(engineId, to);
    this.registry.setLifecycleState(engineId, to);
  }

  async initialize(engineId: string): Promise<void> {
    this.assertTransition(engineId, 'initialized');
    this.emit('EngineInitializing', engineId);
    const engine = this.registry.getEngine(engineId);
    try {
      await withTimeout(
        engine.initialize(this.context()),
        this.phaseTimeoutMs,
        `initialize:${engineId}`,
      );
      this.registry.setLifecycleState(engineId, 'initialized');
      this.emit('EngineInitialized', engineId);
    } catch (error) {
      this.registry.setLifecycleState(engineId, 'failed');
      this.emit('EngineFailed', engineId, { phase: 'initialize', error: String(error) });
      throw toKernelError(error, engineId);
    }
  }

  async configure(engineId: string, config: Readonly<Record<string, unknown>>): Promise<void> {
    this.assertTransition(engineId, 'configured');
    const engine = this.registry.getEngine(engineId);
    try {
      await withTimeout(
        engine.configure(config),
        this.phaseTimeoutMs,
        `configure:${engineId}`,
      );
      this.registry.setLifecycleState(engineId, 'configured');
      this.emit('EngineConfigured', engineId);
    } catch (error) {
      this.registry.setLifecycleState(engineId, 'failed');
      this.emit('EngineFailed', engineId, { phase: 'configure', error: String(error) });
      throw toKernelError(error, engineId);
    }
  }

  async start(engineId: string): Promise<void> {
    this.assertTransition(engineId, 'starting');
    this.registry.setLifecycleState(engineId, 'starting');
    this.emit('EngineStarting', engineId);
    const engine = this.registry.getEngine(engineId);
    try {
      await withTimeout(
        engine.start(this.execution()),
        this.phaseTimeoutMs,
        `start:${engineId}`,
      );
      this.registry.setLifecycleState(engineId, 'running');
      this.emit('EngineStarted', engineId);
    } catch (error) {
      this.registry.setLifecycleState(engineId, 'failed');
      this.emit('EngineFailed', engineId, { phase: 'start', error: String(error) });
      throw toKernelError(error, engineId);
    }
  }

  async pause(engineId: string): Promise<void> {
    this.assertTransition(engineId, 'paused');
    await this.registry.getEngine(engineId).pause();
    this.registry.setLifecycleState(engineId, 'paused');
    this.emit('EnginePaused', engineId);
  }

  async resume(engineId: string): Promise<void> {
    this.assertTransition(engineId, 'running');
    await this.registry.getEngine(engineId).resume();
    this.registry.setLifecycleState(engineId, 'running');
    this.emit('EngineResumed', engineId);
  }

  async stop(engineId: string): Promise<void> {
    const state = this.getState(engineId);
    if (state === 'stopped') return;
    this.assertTransition(engineId, 'stopping');
    this.registry.setLifecycleState(engineId, 'stopping');
    this.emit('EngineStopping', engineId);
    try {
      await withTimeout(
        this.registry.getEngine(engineId).stop(),
        this.phaseTimeoutMs,
        `stop:${engineId}`,
      );
      this.registry.setLifecycleState(engineId, 'stopped');
      this.emit('EngineStopped', engineId);
    } catch (error) {
      this.registry.setLifecycleState(engineId, 'failed');
      this.emit('EngineFailed', engineId, { phase: 'stop', error: String(error) });
      throw toKernelError(error, engineId);
    }
  }

  async shutdown(engineId: string): Promise<void> {
    this.assertTransition(engineId, 'shutting_down');
    this.registry.setLifecycleState(engineId, 'shutting_down');
    this.emit('EngineShuttingDown', engineId);
    try {
      await withTimeout(
        this.registry.getEngine(engineId).shutdown(),
        this.phaseTimeoutMs,
        `shutdown:${engineId}`,
      );
      this.registry.setLifecycleState(engineId, 'shutdown');
      this.emit('EngineShutdown', engineId);
    } catch (error) {
      this.registry.setLifecycleState(engineId, 'failed');
      this.emit('EngineFailed', engineId, { phase: 'shutdown', error: String(error) });
      throw toKernelError(error, engineId);
    }
  }

  async restart(engineId: string): Promise<void> {
    this.emit('EngineRestarting', engineId);
    const state = this.getState(engineId);
    if (state === 'running' || state === 'paused') {
      await this.stop(engineId);
    }
    if (this.getState(engineId) === 'stopped') {
      // stopped -> starting
      await this.start(engineId);
      return;
    }
    if (this.getState(engineId) === 'configured') {
      await this.start(engineId);
      return;
    }
    throw new FatalKernelError(`Cannot restart engine from state ${this.getState(engineId)}`, {
      engineId,
    });
  }

  async recover(engineId: string, reason: string): Promise<void> {
    this.assertTransition(engineId, 'recovering');
    this.registry.setLifecycleState(engineId, 'recovering');
    this.emit('EngineRecovering', engineId, { reason });
    try {
      await withTimeout(
        this.registry.getEngine(engineId).recover(reason),
        this.phaseTimeoutMs,
        `recover:${engineId}`,
      );
      this.registry.setLifecycleState(engineId, 'running');
      this.emit('EngineRecovered', engineId, { reason });
    } catch (error) {
      this.registry.setLifecycleState(engineId, 'failed');
      this.emit('EngineFailed', engineId, { phase: 'recover', error: String(error) });
      throw toKernelError(error, engineId);
    }
  }

  async destroy(engineId: string): Promise<void> {
    this.assertTransition(engineId, 'destroyed');
    await this.registry.getEngine(engineId).destroy();
    this.registry.setLifecycleState(engineId, 'destroyed');
    this.emit('EngineDestroyed', engineId);
  }
}
