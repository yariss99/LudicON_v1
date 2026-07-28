/** Kernel-published events (execution foundation — not Domain educational events). */

export type KernelEventType =
  | 'KernelCreated'
  | 'KernelConfigured'
  | 'KernelStarting'
  | 'KernelStarted'
  | 'KernelDegraded'
  | 'KernelStopping'
  | 'KernelStopped'
  | 'KernelFailed'
  | 'KernelDestroyed'
  | 'EngineRegistered'
  | 'EngineUnregistered'
  | 'EngineEnabled'
  | 'EngineDisabled'
  | 'EngineValidated'
  | 'EngineValidationFailed'
  | 'EngineInitializing'
  | 'EngineInitialized'
  | 'EngineConfigured'
  | 'EngineStarting'
  | 'EngineStarted'
  | 'EnginePaused'
  | 'EngineResumed'
  | 'EngineStopping'
  | 'EngineStopped'
  | 'EngineShuttingDown'
  | 'EngineShutdown'
  | 'EngineRestarting'
  | 'EngineRecovering'
  | 'EngineRecovered'
  | 'EngineFailed'
  | 'EngineDestroyed'
  | 'HealthChanged'
  | 'DiscoveryCompleted'
  | 'DependencyOrderResolved';

export interface KernelEvent {
  readonly type: KernelEventType;
  readonly occurredAt: string;
  readonly kernelId: string;
  readonly engineId?: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, unknown>>;
}

export type KernelEventListener = (event: KernelEvent) => void;

export interface KernelEventBus {
  publish(event: Omit<KernelEvent, 'occurredAt'> & { occurredAt?: string }): void;
  subscribe(listener: KernelEventListener): () => void;
  history(): readonly KernelEvent[];
}
