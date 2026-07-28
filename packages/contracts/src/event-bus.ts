/**
 * Event Bus contracts — transport only (ES-003).
 */

import type {
  DeliveryGuarantee,
  EventCategory,
  EventDraft,
  EventPriority,
  EventType,
  PrimaEvent,
} from './event-envelope.js';

export type EventHandler = (event: PrimaEvent) => void | Promise<void>;

export interface SubscriptionFilter {
  readonly eventTypes?: readonly EventType[];
  /** Glob-like: `Kernel.*`, `Engine.Started`, `*` */
  readonly patterns?: readonly string[];
  readonly categories?: readonly EventCategory[];
  readonly sources?: readonly string[];
  readonly aggregateIds?: readonly string[];
  readonly engineIds?: readonly string[];
  readonly minPriority?: EventPriority;
  readonly custom?: (event: PrimaEvent) => boolean;
}

export interface SubscriptionOptions {
  readonly id?: string;
  readonly filter?: SubscriptionFilter;
  /** Higher runs first among matches */
  readonly priority?: number;
  readonly delivery?: DeliveryGuarantee;
  readonly maxRetries?: number;
  readonly retryDelayMs?: number;
  /** Isolate failures — default true */
  readonly isolateFailures?: boolean;
  readonly timeoutMs?: number;
}

export interface Subscription {
  readonly id: string;
  readonly options: SubscriptionOptions;
  unsubscribe(): void;
}

export interface PublishOptions {
  readonly mode?: 'sync' | 'async';
  readonly priority?: EventPriority;
  readonly delayMs?: number;
  /** Future: absolute schedule — accepted, may queue as delayed */
  readonly scheduleAt?: string;
  readonly delivery?: DeliveryGuarantee;
}

export interface BatchPublishResult {
  readonly published: readonly PrimaEvent[];
  readonly failed: readonly { draft: EventDraft; error: string }[];
}

export interface EventBusStats {
  readonly publishedCount: number;
  readonly deliveredCount: number;
  readonly failedDeliveries: number;
  readonly duplicateDrops: number;
  readonly subscriberCount: number;
  readonly pendingDelayed: number;
  readonly pendingAsync: number;
  readonly deadLetterCount: number;
  readonly averageDeliveryLatencyMs: number;
}

export interface EventBusHealth {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly subscriberCount: number;
  readonly pendingAsync: number;
  readonly pendingDelayed: number;
  readonly deadLetterCount: number;
  readonly checkedAt: string;
}

export interface DeadLetterRecord {
  readonly event: PrimaEvent;
  readonly subscriptionId: string;
  readonly error: string;
  readonly attempts: number;
  readonly failedAt: string;
}

/**
 * Central Event Bus — publishers and subscribers remain anonymous to each other.
 */
export interface EventBus {
  /** Fill identity fields; returns immutable event (not yet published unless publish called). */
  createEvent<T>(draft: EventDraft<T>): PrimaEvent<T>;

  publishSync<T>(draft: EventDraft<T> | PrimaEvent<T>, options?: PublishOptions): PrimaEvent<T>;
  publishAsync<T>(draft: EventDraft<T> | PrimaEvent<T>, options?: PublishOptions): Promise<PrimaEvent<T>>;
  publishBatch(drafts: readonly EventDraft[], options?: PublishOptions): Promise<BatchPublishResult>;

  subscribe(handler: EventHandler, options?: SubscriptionOptions): Subscription;

  /** Observed history for in-process / test (bounded). */
  history(limit?: number): readonly PrimaEvent[];

  stats(): EventBusStats;
  health(): EventBusHealth;
  deadLetters(): readonly DeadLetterRecord[];

  /** Drain delayed/async work — useful for tests and graceful shutdown. */
  flush(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface EventBusOptions {
  readonly busId?: string;
  readonly defaultDelivery?: DeliveryGuarantee;
  readonly historyLimit?: number;
  readonly enableDuplicateDetection?: boolean;
  readonly duplicateWindowSize?: number;
  /** Ordered delivery per aggregateId when true */
  readonly orderPerAggregate?: boolean;
  readonly defaultHandlerTimeoutMs?: number;
  readonly defaultMaxRetries?: number;
  readonly defaultRetryDelayMs?: number;
}
