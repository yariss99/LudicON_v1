import { freezeSnapshot } from './context-registry.js';
import type { ContextAggregator } from './context-aggregator.js';
import type { ContextRegistry } from './context-registry.js';
import type { ContextSubscriber } from './context-subscriber.js';
import type { ContextValidator } from './context-validator.js';
import type { EventDispatcher } from './event-dispatcher.js';
import type {
  ContextEvent,
  ContextEventType,
  RuntimeContextSnapshot,
  ValidationReport,
} from './types.js';
import { EVENT_DOMAIN_MAP } from './types.js';

/**
 * ContextPublisher — lifecycle: Update → Validate → Distribute.
 * Only changed context is propagated to subscribers.
 */
export class ContextPublisher {
  constructor(
    private readonly registry: ContextRegistry,
    private readonly aggregator: ContextAggregator,
    private readonly dispatcher: EventDispatcher,
    private readonly subscribers: ContextSubscriber,
    private readonly validator: ContextValidator,
  ) {}

  /**
   * Publish a domain event. Updates only affected domains, validates,
   * then distributes an immutable snapshot to subscribers.
   */
  publish(
    type: ContextEventType,
    sessionId: string,
    payload: Record<string, unknown>,
    affects = EVENT_DOMAIN_MAP[type],
  ):
    | {
        event: ContextEvent;
        snapshot: RuntimeContextSnapshot;
        validation: ValidationReport;
      }
    | { error: string } {
    const event = this.dispatcher.enqueue(type, sessionId, affects, payload);
    // Process immediately (event-driven; no polling)
    this.dispatcher.dequeue();

    const applied = this.aggregator.applyEvent(event);
    if ('error' in applied) return applied;

    const validation = this.validator.validate(applied);
    if (!validation.ok) {
      return { error: validation.issues.map((i) => i.message).join('; ') };
    }

    applied.lifecycle = 'validated';
    const snapshot = freezeSnapshot(applied);
    applied.lifecycle = 'distributed';
    this.registry.setActive(applied);

    this.subscribers.notify(event, snapshot);
    return { event, snapshot, validation };
  }
}
