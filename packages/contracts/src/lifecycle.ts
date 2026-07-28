/** Engine and Kernel lifecycle states + legal transitions. */

export type EngineLifecycleState =
  | 'unregistered'
  | 'registered'
  | 'initialized'
  | 'configured'
  | 'starting'
  | 'running'
  | 'paused'
  | 'stopping'
  | 'stopped'
  | 'shutting_down'
  | 'shutdown'
  | 'recovering'
  | 'failed'
  | 'destroyed';

export type KernelLifecycleState =
  | 'created'
  | 'configured'
  | 'starting'
  | 'running'
  | 'degraded'
  | 'stopping'
  | 'stopped'
  | 'failed'
  | 'destroyed';

/** Legal Engine transitions enforced by LifecycleManager. */
export const ENGINE_LIFECYCLE_TRANSITIONS: Readonly<
  Record<EngineLifecycleState, readonly EngineLifecycleState[]>
> = {
  unregistered: ['registered'],
  registered: ['initialized', 'destroyed'],
  initialized: ['configured', 'failed', 'destroyed'],
  configured: ['starting', 'failed', 'destroyed'],
  starting: ['running', 'failed'],
  running: ['paused', 'stopping', 'failed', 'recovering'],
  paused: ['running', 'stopping', 'failed'],
  stopping: ['stopped', 'failed'],
  stopped: ['starting', 'shutting_down', 'destroyed', 'recovering'],
  shutting_down: ['shutdown', 'failed'],
  shutdown: ['destroyed', 'registered'],
  recovering: ['running', 'stopped', 'failed'],
  failed: ['recovering', 'stopped', 'shutting_down', 'destroyed'],
  destroyed: [],
};

export interface LifecycleManager {
  getState(engineId: string): EngineLifecycleState;
  assertTransition(engineId: string, to: EngineLifecycleState): void;
  transition(engineId: string, to: EngineLifecycleState): void;
  initialize(engineId: string): Promise<void>;
  configure(engineId: string, config: Readonly<Record<string, unknown>>): Promise<void>;
  start(engineId: string): Promise<void>;
  pause(engineId: string): Promise<void>;
  resume(engineId: string): Promise<void>;
  stop(engineId: string): Promise<void>;
  shutdown(engineId: string): Promise<void>;
  restart(engineId: string): Promise<void>;
  recover(engineId: string, reason: string): Promise<void>;
  destroy(engineId: string): Promise<void>;
}
