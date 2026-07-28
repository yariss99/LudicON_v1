import { uid } from './ids.js';
import type {
  ContextEvent,
  ContextEventType,
  ContextDomain,
  ContextSubscription,
  RuntimeContextSnapshot,
} from './types.js';

/**
 * ContextSubscriber — domain-filtered subscriptions.
 */
export class ContextSubscriber {
  private readonly subs = new Map<string, ContextSubscription>();

  subscribe(input: {
    sessionId?: string;
    domains?: ContextDomain[];
    eventTypes?: ContextEventType[];
    handler: ContextSubscription['handler'];
  }): string {
    const id = uid('csub');
    this.subs.set(id, { id, ...input });
    return id;
  }

  unsubscribe(subscriptionId: string): boolean {
    return this.subs.delete(subscriptionId);
  }

  notify(event: ContextEvent, snapshot: RuntimeContextSnapshot): void {
    for (const sub of this.subs.values()) {
      if (sub.sessionId && sub.sessionId !== event.sessionId) continue;
      if (
        sub.eventTypes &&
        sub.eventTypes.length > 0 &&
        !sub.eventTypes.includes(event.type)
      ) {
        continue;
      }
      if (sub.domains && sub.domains.length > 0) {
        const overlap = event.affects.some((d) => sub.domains!.includes(d));
        if (!overlap) continue;
      }
      sub.handler(event, snapshot);
    }
  }

  count(): number {
    return this.subs.size;
  }
}
