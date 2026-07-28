/**
 * Local memory event bus — can bridge to @prima/event-bus at composition root.
 */

import { newId, nowIso } from './ids.js';
import type {
  MemoryEvent,
  MemoryEventListener,
  MemoryEventType,
  MemoryType,
} from './types.js';

export class MemoryEventBus {
  private readonly listeners = new Set<MemoryEventListener>();

  constructor(private readonly clock: () => Date = () => new Date()) {}

  subscribe(listener: MemoryEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  publish(input: {
    type: MemoryEventType;
    memoryId: string;
    memoryType: MemoryType;
    version: number;
    actorId: string;
    workflowId?: string;
    metadata?: Readonly<Record<string, unknown>>;
  }): MemoryEvent {
    const event: MemoryEvent = {
      eventId: newId('mevt'),
      type: input.type,
      timestamp: nowIso(this.clock),
      memoryId: input.memoryId,
      memoryType: input.memoryType,
      version: input.version,
      actorId: input.actorId,
      workflowId: input.workflowId,
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    };
    for (const listener of this.listeners) {
      listener(event);
    }
    return event;
  }
}
