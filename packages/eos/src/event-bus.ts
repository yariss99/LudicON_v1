import type { KernelEvent, KernelEventBus, KernelEventListener } from '@prima/contracts';

export class InMemoryKernelEventBus implements KernelEventBus {
  private readonly listeners = new Set<KernelEventListener>();
  private readonly log: KernelEvent[] = [];

  publish(event: Omit<KernelEvent, 'occurredAt'> & { occurredAt?: string }): void {
    const full: KernelEvent = {
      ...event,
      occurredAt: event.occurredAt ?? new Date().toISOString(),
    };
    this.log.push(full);
    for (const listener of this.listeners) {
      listener(full);
    }
  }

  subscribe(listener: KernelEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  history(): readonly KernelEvent[] {
    return [...this.log];
  }
}
