/** Kernel and execution context + service locator. */

import type { ConfigurationProvider } from './config.js';
import type { KernelEventBus } from './events.js';

export type Clock = () => Date;

export interface ServiceLocator {
  register<T>(token: string, instance: T): void;
  resolve<T>(token: string): T;
  tryResolve<T>(token: string): T | undefined;
  has(token: string): boolean;
}

/**
 * Shared Kernel context handed to Engines at initialize.
 * Must not carry educational decision authority.
 */
export interface KernelContext {
  readonly kernelId: string;
  readonly correlationId: string;
  readonly configuration: ConfigurationProvider;
  readonly services: ServiceLocator;
  readonly events: KernelEventBus;
  readonly clock: Clock;
}

/**
 * Per-start execution context (one Kernel start cycle or Engine restart).
 */
export interface ExecutionContext {
  readonly correlationId: string;
  readonly startedAt: string;
  readonly deadlineAt?: string;
}
