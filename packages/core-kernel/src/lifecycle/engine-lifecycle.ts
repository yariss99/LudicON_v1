/**
 * Core engine lifecycle manager.
 */

import { CoreKernelError } from '../errors.js';
import type { PlatformEventBus } from '../events/platform-event-bus.js';
import type { ServiceRegistry } from '../registry/service-registry.js';
import type {
  CoreEngineModule,
  CoreEngineState,
  CoreKernelContext,
  PlatformConfiguration,
} from '../types.js';

const TRANSITIONS: Record<CoreEngineState, readonly CoreEngineState[]> = {
  discovered: ['registered', 'failed'],
  registered: ['configured', 'failed', 'stopped'],
  configured: ['initialized', 'failed', 'stopped'],
  initialized: ['ready', 'failed', 'stopped'],
  ready: ['running', 'failed', 'stopped'],
  running: ['paused', 'stopping', 'failed'],
  paused: ['running', 'stopping', 'failed'],
  stopping: ['stopped', 'failed'],
  stopped: ['configured', 'registered'],
  failed: ['stopped', 'registered'],
};

export class EngineLifecycleManager {
  private readonly states = new Map<string, CoreEngineState>();

  constructor(
    private readonly services: ServiceRegistry,
    private readonly events: PlatformEventBus,
  ) {}

  getState(engineId: string): CoreEngineState {
    return this.states.get(engineId) ?? 'discovered';
  }

  markDiscovered(engineId: string): void {
    this.states.set(engineId, 'discovered');
    this.events.publish({
      type: 'EngineDiscovered',
      engineId,
      payload: {},
    });
  }

  markRegistered(engineId: string): void {
    this.transition(engineId, 'registered');
    this.events.publish({
      type: 'EngineRegistered',
      engineId,
      payload: {},
    });
  }

  async configure(
    engineId: string,
    config: PlatformConfiguration,
  ): Promise<void> {
    const module = await this.services.resolve(engineId);
    this.assertTransition(engineId, 'configured');
    const engineConfig = config.engines[engineId] ?? {};
    await module.configure?.(engineConfig);
    this.states.set(engineId, 'configured');
  }

  async initialize(
    engineId: string,
    ctx: CoreKernelContext,
  ): Promise<void> {
    const module = await this.services.resolve(engineId);
    this.assertTransition(engineId, 'initialized');
    try {
      await module.initialize?.(ctx);
      this.states.set(engineId, 'initialized');
      this.events.publish({
        type: 'EngineInitialized',
        engineId,
        payload: { version: module.version },
      });
    } catch (err) {
      this.states.set(engineId, 'failed');
      this.events.publish({
        type: 'EngineFailed',
        engineId,
        payload: { phase: 'initialize', error: String(err) },
      });
      throw err;
    }
  }

  markReady(engineId: string): void {
    this.transition(engineId, 'ready');
  }

  async start(engineId: string): Promise<void> {
    const module = await this.services.resolve(engineId);
    const from = this.getState(engineId);
    if (from !== 'ready' && from !== 'paused' && from !== 'stopped') {
      this.assertTransition(engineId, 'running');
    }
    try {
      if (from === 'paused') await module.resume?.();
      else await module.start?.();
      this.states.set(engineId, 'running');
    } catch (err) {
      this.states.set(engineId, 'failed');
      this.events.publish({
        type: 'EngineFailed',
        engineId,
        payload: { phase: 'start', error: String(err) },
      });
      throw err;
    }
  }

  async pause(engineId: string): Promise<void> {
    const module = await this.services.resolve(engineId);
    this.assertTransition(engineId, 'paused');
    await module.pause?.();
    this.states.set(engineId, 'paused');
  }

  async stop(engineId: string): Promise<void> {
    const module = await this.services.resolve(engineId);
    const state = this.getState(engineId);
    if (state === 'stopped' || state === 'discovered') return;
    this.states.set(engineId, 'stopping');
    try {
      await module.stop?.();
      this.states.set(engineId, 'stopped');
    } catch (err) {
      this.states.set(engineId, 'failed');
      throw err;
    }
  }

  listStates(): ReadonlyMap<string, CoreEngineState> {
    return this.states;
  }

  private transition(engineId: string, to: CoreEngineState): void {
    this.assertTransition(engineId, to);
    this.states.set(engineId, to);
  }

  private assertTransition(engineId: string, to: CoreEngineState): void {
    const from = this.getState(engineId);
    const allowed = TRANSITIONS[from] ?? [];
    if (!allowed.includes(to) && from !== to) {
      throw new CoreKernelError(
        'INVALID_LIFECYCLE',
        `Cannot transition engine ${engineId} from ${from} to ${to}`,
      );
    }
  }

  describe(module: CoreEngineModule): {
    id: string;
    displayName: string;
    version: string;
    state: CoreEngineState;
    dependencies: readonly string[];
  } {
    return {
      id: module.id,
      displayName: module.displayName,
      version: module.version,
      state: this.getState(module.id),
      dependencies: module.dependencies ?? [],
    };
  }
}
