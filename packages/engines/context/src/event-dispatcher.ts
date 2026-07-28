import { uid } from './ids.js';
import type { ContextEvent, ContextEventType } from './types.js';

/**
 * EventDispatcher — in-process event queue for context synchronization.
 * Event-driven updates; never poll.
 */
export class EventDispatcher {
  private readonly queue: ContextEvent[] = [];
  private readonly history: ContextEvent[] = [];

  enqueue(
    type: ContextEventType,
    sessionId: string,
    affects: ContextEvent['affects'],
    payload: Record<string, unknown>,
  ): ContextEvent {
    const event: ContextEvent = {
      id: uid('cevt'),
      type,
      sessionId,
      at: new Date().toISOString(),
      affects: [...affects],
      payload: structuredClone(payload),
    };
    this.queue.push(event);
    return event;
  }

  pending(): readonly ContextEvent[] {
    return this.queue;
  }

  /** Drain event queue (FIFO) */
  dequeue(): ContextEvent | undefined {
    const event = this.queue.shift();
    if (event) this.history.push(event);
    return event;
  }

  drain(): ContextEvent[] {
    const batch = this.queue.splice(0, this.queue.length);
    this.history.push(...batch);
    return batch;
  }

  recorded(): readonly ContextEvent[] {
    return this.history;
  }
}
