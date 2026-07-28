/**
 * Bridge Kernel events onto the platform Event Bus without mixing concerns.
 */

import type { KernelEvent, KernelEventBus, KernelEventListener } from './events.js';
import type { EventBus } from './event-bus.js';
import type { PrimaEvent } from './event-envelope.js';

export function kernelEventToPrimaEvent(event: KernelEvent): PrimaEvent {
  return {
    eventId: `kernel-${event.kernelId}-${event.type}-${event.occurredAt}`,
    eventType: event.type,
    category: event.engineId ? 'engine' : 'kernel',
    aggregateId: event.engineId ?? event.kernelId,
    correlationId: event.correlationId ?? event.kernelId,
    timestamp: event.occurredAt,
    source: event.engineId ? `engine:${event.engineId}` : `kernel:${event.kernelId}`,
    version: '1.0.0',
    priority: 'normal',
    payload: {
      kernelId: event.kernelId,
      engineId: event.engineId,
      ...(event.payload ?? {}),
    },
    metadata: {},
    executionContext: {
      kernelId: event.kernelId,
      engineId: event.engineId,
      correlationId: event.correlationId,
    },
  };
}

/**
 * KernelEventBus adapter that fans out to local listeners and the platform EventBus.
 */
export function createKernelEventBusBridge(
  platformBus: EventBus,
  options?: { alsoLocal?: boolean },
): KernelEventBus & { localHistory(): readonly KernelEvent[] } {
  const alsoLocal = options?.alsoLocal ?? true;
  const localListeners = new Set<KernelEventListener>();
  const localLog: KernelEvent[] = [];

  return {
    publish(event) {
      const full: KernelEvent = {
        ...event,
        occurredAt: event.occurredAt ?? new Date().toISOString(),
      };
      if (alsoLocal) {
        localLog.push(full);
        for (const listener of localListeners) listener(full);
      }
      platformBus.publishSync(kernelEventToPrimaEvent(full), { mode: 'sync' });
    },
    subscribe(listener) {
      localListeners.add(listener);
      return () => localListeners.delete(listener);
    },
    history() {
      return [...localLog];
    },
    localHistory() {
      return [...localLog];
    },
  };
}
