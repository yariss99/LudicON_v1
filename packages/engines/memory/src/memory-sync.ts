import type { MemoryItem } from './types.js';

export type SyncOp =
  | { op: 'upsert'; item: MemoryItem }
  | { op: 'delete'; itemId: string; teacherId: string };

/**
 * MemorySync — update queue + synchronization flow for persistence ports.
 * In-process today; Infrastructure Port can drain the queue later.
 */
export class MemorySync {
  private readonly queue: SyncOp[] = [];
  private readonly applied: SyncOp[] = [];

  enqueue(op: SyncOp): void {
    this.queue.push(op);
  }

  pending(): readonly SyncOp[] {
    return this.queue;
  }

  /** Drain update queue into applied log (simulates persistence sync) */
  flush(): SyncOp[] {
    const batch = this.queue.splice(0, this.queue.length);
    this.applied.push(...batch);
    return batch;
  }

  history(): readonly SyncOp[] {
    return this.applied;
  }

  recordUpsert(item: MemoryItem): void {
    this.enqueue({ op: 'upsert', item: structuredClone(item) });
  }

  recordDelete(itemId: string, teacherId: string): void {
    this.enqueue({ op: 'delete', itemId, teacherId });
  }
}
