/**
 * Runtime event bus — Mediator side-channel for orchestration events.
 */

import { newId, nowIso } from './ids.js';
import type {
  EngineId,
  RuntimeEvent,
  RuntimeEventListener,
  RuntimeEventType,
} from './types.js';

export class RuntimeEventBus {
  private readonly listeners = new Set<RuntimeEventListener>();
  private readonly history: RuntimeEvent[] = [];

  constructor(private readonly clock: () => Date = () => new Date()) {}

  subscribe(listener: RuntimeEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  publish(input: {
    type: RuntimeEventType;
    executionId: string;
    workflowId?: string;
    engineId?: EngineId;
    stepId?: string;
    payload?: Readonly<Record<string, unknown>>;
  }): RuntimeEvent {
    const event: RuntimeEvent = {
      eventId: newId('revt'),
      type: input.type,
      timestamp: nowIso(this.clock),
      executionId: input.executionId,
      workflowId: input.workflowId,
      engineId: input.engineId,
      stepId: input.stepId,
      payload: Object.freeze({ ...(input.payload ?? {}) }),
    };
    this.history.push(event);
    for (const listener of this.listeners) {
      listener(event);
    }
    return event;
  }

  list(executionId?: string): readonly RuntimeEvent[] {
    if (!executionId) return Object.freeze([...this.history]);
    return Object.freeze(
      this.history.filter((e) => e.executionId === executionId),
    );
  }
}
