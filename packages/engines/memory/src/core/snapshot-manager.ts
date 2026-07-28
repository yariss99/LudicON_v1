/**
 * Snapshot Manager — immutable multi-record snapshots for rollback / replay.
 */

import { newId, nowIso } from './ids.js';
import type { MemoryRecord, MemorySnapshot } from './types.js';

export class SnapshotManager {
  private readonly snapshots = new Map<string, MemorySnapshot>();

  constructor(private readonly clock: () => Date = () => new Date()) {}

  create(input: {
    label: string;
    createdBy: string;
    records: readonly MemoryRecord[];
    metadata?: Readonly<Record<string, unknown>>;
  }): MemorySnapshot {
    const snapshot: MemorySnapshot = {
      snapshotId: newId('msnap'),
      label: input.label,
      createdAt: nowIso(this.clock),
      createdBy: input.createdBy,
      memoryIds: Object.freeze(input.records.map((r) => r.memoryId)),
      records: Object.freeze(input.records.map((r) => structuredClone(r))),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    };
    this.snapshots.set(snapshot.snapshotId, snapshot);
    return snapshot;
  }

  get(snapshotId: string): MemorySnapshot | undefined {
    return this.snapshots.get(snapshotId);
  }

  list(): readonly MemorySnapshot[] {
    return [...this.snapshots.values()];
  }
}
