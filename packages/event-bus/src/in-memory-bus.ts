import type {
  BatchPublishResult,
  DeadLetterRecord,
  DeliveryGuarantee,
  EventBus,
  EventBusHealth,
  EventBusOptions,
  EventBusStats,
  EventDraft,
  EventHandler,
  PrimaEvent,
  PublishOptions,
  Subscription,
  SubscriptionOptions,
} from '@prima/contracts';
import { createCorrelationId, createEventId, createSubscriptionId } from './ids.js';
import { PRIORITY_RANK } from './priority.js';
import { matchEventFilter, resolveRoutingLane } from './routing.js';

interface InternalSubscription {
  readonly id: string;
  readonly handler: EventHandler;
  readonly options: SubscriptionOptions;
}

interface DelayedItem {
  event: PrimaEvent;
  options: PublishOptions;
  runAt: number;
}

function isPrimaEvent<T>(value: EventDraft<T> | PrimaEvent<T>): value is PrimaEvent<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'eventId' in value &&
    'timestamp' in value &&
    'correlationId' in value &&
    'priority' in value &&
    'metadata' in value
  );
}

function freezeEvent<T>(event: PrimaEvent<T>): PrimaEvent<T> {
  const payload =
    event.payload !== null && typeof event.payload === 'object'
      ? Object.freeze({ ...(event.payload as object) })
      : event.payload;
  return Object.freeze({
    ...event,
    payload: payload as T,
    metadata: Object.freeze({ ...event.metadata }),
    userContext: event.userContext ? Object.freeze({ ...event.userContext }) : undefined,
    executionContext: event.executionContext
      ? Object.freeze({ ...event.executionContext })
      : undefined,
  });
}

function asBusEvent<T>(event: PrimaEvent<T>): PrimaEvent {
  return event as unknown as PrimaEvent;
}

export class InMemoryEventBus implements EventBus {
  readonly busId: string;
  private readonly subs = new Map<string, InternalSubscription>();
  private readonly historyLog: PrimaEvent[] = [];
  private readonly seenIds = new Set<string>();
  private readonly seenQueue: string[] = [];
  private readonly deadLetter: DeadLetterRecord[] = [];
  private readonly delayed: DelayedItem[] = [];
  private readonly aggregateQueues = new Map<string, Promise<void>>();
  private pendingAsync = 0;
  private publishedCount = 0;
  private deliveredCount = 0;
  private failedDeliveries = 0;
  private duplicateDrops = 0;
  private latencyTotalMs = 0;
  private latencySamples = 0;
  private running = false;
  private delayTimer: ReturnType<typeof setInterval> | undefined;
  private readonly historyLimit: number;
  private readonly enableDuplicateDetection: boolean;
  private readonly duplicateWindowSize: number;
  private readonly orderPerAggregate: boolean;
  private readonly defaultDelivery: DeliveryGuarantee;
  private readonly defaultHandlerTimeoutMs: number;
  private readonly defaultMaxRetries: number;
  private readonly defaultRetryDelayMs: number;

  constructor(options: EventBusOptions = {}) {
    this.busId = options.busId ?? `bus-${createEventId()}`;
    this.historyLimit = options.historyLimit ?? 10_000;
    this.enableDuplicateDetection = options.enableDuplicateDetection ?? true;
    this.duplicateWindowSize = options.duplicateWindowSize ?? 50_000;
    this.orderPerAggregate = options.orderPerAggregate ?? true;
    this.defaultDelivery = options.defaultDelivery ?? 'at-least-once';
    this.defaultHandlerTimeoutMs = options.defaultHandlerTimeoutMs ?? 30_000;
    this.defaultMaxRetries = options.defaultMaxRetries ?? 2;
    this.defaultRetryDelayMs = options.defaultRetryDelayMs ?? 25;
  }

  createEvent<T>(draft: EventDraft<T>): PrimaEvent<T> {
    const event: PrimaEvent<T> = {
      eventId: draft.eventId ?? createEventId(),
      eventType: draft.eventType,
      category: draft.category,
      aggregateId: draft.aggregateId,
      correlationId: draft.correlationId ?? createCorrelationId(),
      causationId: draft.causationId,
      timestamp: draft.timestamp ?? new Date().toISOString(),
      source: draft.source,
      version: draft.version ?? '1.0.0',
      tenantId: draft.tenantId,
      userContext: draft.userContext,
      executionContext: draft.executionContext,
      priority: draft.priority ?? 'normal',
      payload: draft.payload,
      metadata: {
        ...(draft.metadata ?? {}),
        routingLane: undefined,
      },
    };
    const frozen = freezeEvent(event);
    const lane = resolveRoutingLane(asBusEvent(frozen));
    return freezeEvent({
      ...frozen,
      metadata: Object.freeze({ ...frozen.metadata, routingLane: lane }),
    });
  }

  publishSync<T>(
    draft: EventDraft<T> | PrimaEvent<T>,
    options: PublishOptions = {},
  ): PrimaEvent<T> {
    const event = this.normalize(draft, options);
    if (options.delayMs && options.delayMs > 0) {
      this.enqueueDelayed(asBusEvent(event), options, options.delayMs);
      return event;
    }
    if (options.scheduleAt) {
      const runAt = Date.parse(options.scheduleAt);
      const delay = Number.isFinite(runAt) ? Math.max(0, runAt - Date.now()) : 0;
      this.enqueueDelayed(asBusEvent(event), options, delay);
      return event;
    }
    this.dispatchSync(asBusEvent(event), options);
    return event;
  }

  async publishAsync<T>(
    draft: EventDraft<T> | PrimaEvent<T>,
    options: PublishOptions = {},
  ): Promise<PrimaEvent<T>> {
    const event = this.normalize(draft, options);
    if (options.delayMs && options.delayMs > 0) {
      this.enqueueDelayed(asBusEvent(event), options, options.delayMs);
      return event;
    }
    if (options.scheduleAt) {
      const runAt = Date.parse(options.scheduleAt);
      const delay = Number.isFinite(runAt) ? Math.max(0, runAt - Date.now()) : 0;
      this.enqueueDelayed(asBusEvent(event), options, delay);
      return event;
    }
    await this.dispatch(asBusEvent(event), { ...options, mode: options.mode ?? 'async' });
    return event;
  }

  async publishBatch(
    drafts: readonly EventDraft[],
    options: PublishOptions = {},
  ): Promise<BatchPublishResult> {
    const published: PrimaEvent[] = [];
    const failed: { draft: EventDraft; error: string }[] = [];
    // Higher priority first within batch
    const sorted = [...drafts].sort(
      (a, b) =>
        PRIORITY_RANK[b.priority ?? 'normal'] - PRIORITY_RANK[a.priority ?? 'normal'],
    );
    for (const draft of sorted) {
      try {
        published.push(await this.publishAsync(draft, options));
      } catch (error) {
        failed.push({ draft, error: String(error) });
      }
    }
    return { published, failed };
  }

  subscribe(handler: EventHandler, options: SubscriptionOptions = {}): Subscription {
    const id = options.id ?? createSubscriptionId();
    if (this.subs.has(id)) {
      throw new Error(`Subscription already exists: ${id}`);
    }
    this.subs.set(id, { id, handler, options });
    return {
      id,
      options,
      unsubscribe: () => {
        this.subs.delete(id);
      },
    };
  }

  history(limit?: number): readonly PrimaEvent[] {
    if (limit === undefined) return [...this.historyLog];
    return this.historyLog.slice(-limit);
  }

  stats(): EventBusStats {
    return {
      publishedCount: this.publishedCount,
      deliveredCount: this.deliveredCount,
      failedDeliveries: this.failedDeliveries,
      duplicateDrops: this.duplicateDrops,
      subscriberCount: this.subs.size,
      pendingDelayed: this.delayed.length,
      pendingAsync: this.pendingAsync,
      deadLetterCount: this.deadLetter.length,
      averageDeliveryLatencyMs:
        this.latencySamples === 0 ? 0 : this.latencyTotalMs / this.latencySamples,
    };
  }

  health(): EventBusHealth {
    const pending = this.pendingAsync + this.delayed.length;
    let status: EventBusHealth['status'] = 'healthy';
    if (this.deadLetter.length > 100 || pending > 10_000) status = 'unhealthy';
    else if (this.deadLetter.length > 0 || pending > 1_000) status = 'degraded';
    return {
      status,
      subscriberCount: this.subs.size,
      pendingAsync: this.pendingAsync,
      pendingDelayed: this.delayed.length,
      deadLetterCount: this.deadLetter.length,
      checkedAt: new Date().toISOString(),
    };
  }

  deadLetters(): readonly DeadLetterRecord[] {
    return [...this.deadLetter];
  }

  async flush(): Promise<void> {
    // Force all delayed items due
    for (const item of this.delayed) {
      (item as { runAt: number }).runAt = 0;
    }
    this.processDelayed(Date.now() + 1);
    let spins = 0;
    while ((this.pendingAsync > 0 || this.delayed.length > 0) && spins < 500) {
      this.processDelayed(Date.now() + 1);
      await new Promise((r) => setTimeout(r, 2));
      spins += 1;
    }
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.delayTimer = setInterval(() => this.processDelayed(Date.now()), 25);
    if (typeof this.delayTimer === 'object' && 'unref' in this.delayTimer) {
      this.delayTimer.unref();
    }
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.delayTimer) {
      clearInterval(this.delayTimer);
      this.delayTimer = undefined;
    }
    await this.flush();
  }

  private normalize<T>(
    draft: EventDraft<T> | PrimaEvent<T>,
    options: PublishOptions,
  ): PrimaEvent<T> {
    const base = isPrimaEvent(draft)
      ? freezeEvent(draft)
      : this.createEvent(draft);
    const priority = options.priority ?? base.priority;
    if (priority === base.priority) return base;
    return freezeEvent({ ...base, priority });
  }

  private enqueueDelayed(
    event: PrimaEvent,
    options: PublishOptions,
    delayMs: number,
  ): void {
    if (this.isDuplicate(event.eventId)) {
      this.duplicateDrops += 1;
      return;
    }
    this.rememberId(event.eventId);
    this.recordHistory(event);
    this.publishedCount += 1;
    this.delayed.push({
      event,
      options,
      runAt: Date.now() + delayMs,
    });
  }

  private processDelayed(now: number): void {
    const due: DelayedItem[] = [];
    const remaining: DelayedItem[] = [];
    for (const item of this.delayed) {
      if (item.runAt <= now) due.push(item);
      else remaining.push(item);
    }
    this.delayed.length = 0;
    this.delayed.push(...remaining);
    due.sort(
      (a, b) => PRIORITY_RANK[b.event.priority] - PRIORITY_RANK[a.event.priority],
    );
    for (const item of due) {
      void this.dispatch(item.event, { ...item.options, mode: 'async' }, true);
    }
  }

  private dispatchSync(event: PrimaEvent, options: PublishOptions): void {
    if (this.isDuplicate(event.eventId)) {
      this.duplicateDrops += 1;
      return;
    }
    this.rememberId(event.eventId);
    this.recordHistory(event);
    this.publishedCount += 1;

    const started = Date.now();
    const matched = this.matchingSubs(event).sort(
      (a, b) => (b.options.priority ?? 0) - (a.options.priority ?? 0),
    );
    const delivery = options.delivery ?? this.defaultDelivery;

    for (const sub of matched) {
      const maxRetries =
        delivery === 'at-most-once'
          ? 0
          : (sub.options.maxRetries ?? this.defaultMaxRetries);
      let attempt = 0;
      let lastError: unknown;
      let ok = false;
      while (attempt <= maxRetries) {
        attempt += 1;
        try {
          const result = sub.handler(event);
          if (result !== undefined && result !== null && typeof (result as Promise<void>).then === 'function') {
            this.pendingAsync += 1;
            void Promise.resolve(result)
              .then(() => {
                this.deliveredCount += 1;
              })
              .catch((error) => {
                this.failedDeliveries += 1;
                this.deadLetter.push({
                  event,
                  subscriptionId: sub.id,
                  error: String(error),
                  attempts: attempt,
                  failedAt: new Date().toISOString(),
                });
              })
              .finally(() => {
                this.pendingAsync -= 1;
              });
            ok = true;
            break;
          }
          this.deliveredCount += 1;
          ok = true;
          break;
        } catch (error) {
          lastError = error;
          this.failedDeliveries += 1;
        }
      }
      if (!ok) {
        this.deadLetter.push({
          event,
          subscriptionId: sub.id,
          error: String(lastError),
          attempts: attempt,
          failedAt: new Date().toISOString(),
        });
      }
    }

    this.latencyTotalMs += Date.now() - started;
    this.latencySamples += 1;
  }

  private async dispatch(
    event: PrimaEvent,
    options: PublishOptions,
    alreadyCounted = false,
  ): Promise<void> {
    if (!alreadyCounted) {
      if (this.isDuplicate(event.eventId)) {
        this.duplicateDrops += 1;
        return;
      }
      this.rememberId(event.eventId);
      this.recordHistory(event);
      this.publishedCount += 1;
    }

    const deliverAll = async (): Promise<void> => {
      const started = Date.now();
      const matched = this.matchingSubs(event).sort(
        (a, b) => (b.options.priority ?? 0) - (a.options.priority ?? 0),
      );
      const mode = options.mode ?? 'async';
      const delivery = options.delivery ?? this.defaultDelivery;

      if (mode === 'sync') {
        for (const sub of matched) {
          await this.deliver(event, sub, delivery);
        }
      } else {
        await Promise.all(matched.map((sub) => this.deliver(event, sub, delivery)));
      }

      this.latencyTotalMs += Date.now() - started;
      this.latencySamples += 1;
    };

    const run = async (): Promise<void> => {
      const mode = options.mode ?? 'async';
      if (mode === 'sync') {
        await deliverAll();
        return;
      }
      this.pendingAsync += 1;
      try {
        await deliverAll();
      } finally {
        this.pendingAsync -= 1;
      }
    };

    if (this.orderPerAggregate && event.aggregateId) {
      const key = event.aggregateId;
      const prev = this.aggregateQueues.get(key) ?? Promise.resolve();
      const next = prev.then(run, run);
      this.aggregateQueues.set(
        key,
        next.catch(() => undefined),
      );
      await next;
      return;
    }

    await run();
  }

  private matchingSubs(event: PrimaEvent): InternalSubscription[] {
    return [...this.subs.values()].filter((s) =>
      matchEventFilter(event, s.options.filter),
    );
  }

  private async deliver(
    event: PrimaEvent,
    sub: InternalSubscription,
    delivery: DeliveryGuarantee,
  ): Promise<void> {
    const maxRetries =
      delivery === 'at-most-once'
        ? 0
        : (sub.options.maxRetries ?? this.defaultMaxRetries);
    const retryDelay = sub.options.retryDelayMs ?? this.defaultRetryDelayMs;
    const timeout = sub.options.timeoutMs ?? this.defaultHandlerTimeoutMs;
    const isolate = sub.options.isolateFailures ?? true;

    // exactly-once: future-ready — treat as at-least-once + duplicate window today
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= maxRetries) {
      attempt += 1;
      try {
        await this.invokeHandler(sub.handler, event, timeout);
        this.deliveredCount += 1;
        return;
      } catch (error) {
        lastError = error;
        this.failedDeliveries += 1;
        if (attempt > maxRetries) break;
        await sleep(retryDelay * attempt);
      }
    }

    this.deadLetter.push({
      event,
      subscriptionId: sub.id,
      error: String(lastError),
      attempts: attempt,
      failedAt: new Date().toISOString(),
    });

    if (!isolate) {
      throw lastError instanceof Error ? lastError : new Error(String(lastError));
    }
  }

  private async invokeHandler(
    handler: EventHandler,
    event: PrimaEvent,
    timeoutMs: number,
  ): Promise<void> {
    const result = handler(event);
    if (result === undefined || result === null) return;
    if (timeoutMs <= 0) {
      await result;
      return;
    }
    await Promise.race([
      result,
      new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error(`Handler timeout after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  }

  private isDuplicate(eventId: string): boolean {
    if (!this.enableDuplicateDetection) return false;
    return this.seenIds.has(eventId);
  }

  private rememberId(eventId: string): void {
    if (!this.enableDuplicateDetection) return;
    this.seenIds.add(eventId);
    this.seenQueue.push(eventId);
    while (this.seenQueue.length > this.duplicateWindowSize) {
      const old = this.seenQueue.shift();
      if (old) this.seenIds.delete(old);
    }
  }

  private recordHistory(event: PrimaEvent): void {
    this.historyLog.push(event);
    while (this.historyLog.length > this.historyLimit) {
      this.historyLog.shift();
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Remove unused export at bottom - clean end of file
export function createEventBus(options?: EventBusOptions): EventBus {
  return new InMemoryEventBus(options);
}
