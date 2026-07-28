/**
 * Version Manager — every change creates a new version entry.
 */

import { newId, nowIso } from './ids.js';
import type { MemoryRecord, MemoryVersionEntry } from './types.js';

export class VersionManager {
  private readonly versions = new Map<string, MemoryVersionEntry[]>();

  constructor(private readonly clock: () => Date = () => new Date()) {}

  record(
    snapshot: MemoryRecord,
    actorId: string,
    reason?: string,
  ): MemoryVersionEntry {
    const entry: MemoryVersionEntry = {
      memoryId: snapshot.memoryId,
      version: snapshot.version,
      recordedAt: nowIso(this.clock),
      actorId,
      reason,
      snapshot,
    };
    const list = this.versions.get(snapshot.memoryId) ?? [];
    list.push(entry);
    this.versions.set(snapshot.memoryId, list);
    return entry;
  }

  history(memoryId: string): readonly MemoryVersionEntry[] {
    return Object.freeze([...(this.versions.get(memoryId) ?? [])]);
  }

  getVersion(
    memoryId: string,
    version: number,
  ): MemoryVersionEntry | undefined {
    return this.versions.get(memoryId)?.find((v) => v.version === version);
  }
}

export { newId };
