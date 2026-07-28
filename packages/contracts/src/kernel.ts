/** Kernel façade contracts. */

import type { Engine, EngineDescriptor, EngineId, RegistrationSource } from './engine.js';
import type { KernelHealthReport } from './health.js';
import type { KernelLifecycleState } from './lifecycle.js';
import type { KernelEvent, KernelEventListener } from './events.js';
import type { ConfigurationProvider } from './config.js';
import type { KernelContext, ServiceLocator } from './context.js';

export interface EosKernelOptions {
  readonly kernelId?: string;
  readonly configuration?: ConfigurationProvider;
  readonly serviceLocator?: ServiceLocator;
  /** Optional platform Event Bus — Kernel events are bridged when provided. */
  readonly eventBus?: import('./event-bus.js').EventBus;
  /** Per-phase timeout in milliseconds (initialize/configure/start/stop/shutdown). */
  readonly phaseTimeoutMs?: number;
  /** Max retries for recoverable engine start failures. */
  readonly startRetryCount?: number;
  readonly startRetryDelayMs?: number;
  /** If true, one fatal engine failure fails the Kernel startup. Default true. */
  readonly failKernelOnFatalEngineError?: boolean;
  /** Allow parallel start of engines whose dependencies are already running. Default true. */
  readonly parallelStart?: boolean;
}

export interface EosKernel {
  readonly id: string;
  readonly state: KernelLifecycleState;

  register(engine: Engine, source?: RegistrationSource): void;
  registerDescriptor(descriptor: EngineDescriptor): void;
  unregister(engineId: EngineId): void;
  enable(engineId: EngineId): void;
  disable(engineId: EngineId): void;

  configure(overrides?: Readonly<Record<string, unknown>>): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;

  restartEngine(engineId: EngineId): Promise<void>;
  recoverEngine(engineId: EngineId, reason: string): Promise<void>;

  getContext(): KernelContext;
  health(): KernelHealthReport;
  on(listener: KernelEventListener): () => void;
  getEvents(): readonly KernelEvent[];
}
