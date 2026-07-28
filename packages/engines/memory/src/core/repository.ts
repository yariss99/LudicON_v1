/**
 * In-memory repository — Repository Pattern.
 * Swap for durable storage without changing MemoryEngine.
 */

import type { MemoryRecord } from './types.js';

export interface MemoryRepository {
  save(record: MemoryRecord): void;
  get(memoryId: string): MemoryRecord | undefined;
  delete(memoryId: string): boolean;
  list(): readonly MemoryRecord[];
}

export class InMemoryMemoryRepository implements MemoryRepository {
  private readonly records = new Map<string, MemoryRecord>();

  save(record: MemoryRecord): void {
    this.records.set(record.memoryId, record);
  }

  get(memoryId: string): MemoryRecord | undefined {
    return this.records.get(memoryId);
  }

  delete(memoryId: string): boolean {
    return this.records.delete(memoryId);
  }

  list(): readonly MemoryRecord[] {
    return [...this.records.values()];
  }
}
