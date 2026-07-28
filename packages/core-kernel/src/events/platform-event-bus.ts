/**
 * Platform event bus — Observer pattern for Core Kernel events.
 */

import { newId, nowIso } from '../ids.js';
import type {
  PlatformEvent,
  PlatformEventListener,
  PlatformEventType,
} from '../types.js';

export class PlatformEventBus {
  private readonly listeners = new Set<PlatformEventListener>();
  private readonly history: PlatformEvent[] = [];

  constructor(
    private readonly platformId: string,
    private readonly getCorrelationId: () => string,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  subscribe(listener: PlatformEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  publish(input: {
    type: PlatformEventType;
    engineId?: string;
    payload?: Readonly<Record<string, unknown>>;
  }): PlatformEvent {
    const event: PlatformEvent = {
      eventId: newId('pevt'),
      type: input.type,
      timestamp: nowIso(this.clock),
      platformId: this.platformId,
      correlationId: this.getCorrelationId(),
      engineId: input.engineId,
      payload: Object.freeze({ ...(input.payload ?? {}) }),
    };
    this.history.push(event);
    for (const listener of this.listeners) listener(event);
    return event;
  }

  list(): readonly PlatformEvent[] {
    return Object.freeze([...this.history]);
  }
}
