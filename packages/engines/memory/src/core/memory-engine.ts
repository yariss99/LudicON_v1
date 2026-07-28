/**
 * MemoryEngine — structured educational memory gateway.
 *
 * Not a chat history. Not a prompt cache.
 * Stores workflow progress, decisions, artifacts, preferences, knowledge.
 */

import { buildSearchText, newId, nowIso } from './ids.js';
import { MemoryEventBus } from './event-bus.js';
import { MemoryQueryEngine } from './query-engine.js';
import {
  InMemoryMemoryRepository,
  type MemoryRepository,
} from './repository.js';
import { SnapshotManager } from './snapshot-manager.js';
import { VersionManager } from './version-manager.js';
import type {
  CreateMemoryInput,
  MemoryEducationalContext,
  MemoryQuery,
  MemoryRecord,
  MemorySearchHit,
  MemorySnapshot,
  MemoryType,
  MemoryVersionEntry,
} from './types.js';

export type CreateMemoryEngineOptions = {
  readonly repository?: MemoryRepository;
  readonly versions?: VersionManager;
  readonly snapshots?: SnapshotManager;
  readonly queryEngine?: MemoryQueryEngine;
  readonly events?: MemoryEventBus;
  readonly clock?: () => Date;
};

export class MemoryEngine {
  private readonly repository: MemoryRepository;
  private readonly versions: VersionManager;
  private readonly snapshots: SnapshotManager;
  private readonly queryEngine: MemoryQueryEngine;
  private readonly events: MemoryEventBus;
  private readonly clock: () => Date;

  constructor(options: CreateMemoryEngineOptions = {}) {
    this.clock = options.clock ?? (() => new Date());
    this.repository = options.repository ?? new InMemoryMemoryRepository();
    this.versions = options.versions ?? new VersionManager(this.clock);
    this.snapshots = options.snapshots ?? new SnapshotManager(this.clock);
    this.queryEngine = options.queryEngine ?? new MemoryQueryEngine();
    this.events = options.events ?? new MemoryEventBus(this.clock);
  }

  getEventBus(): MemoryEventBus {
    return this.events;
  }

  getVersionManager(): VersionManager {
    return this.versions;
  }

  getSnapshotManager(): SnapshotManager {
    return this.snapshots;
  }

  /** Create structured memory (version 1). */
  create<T extends Readonly<Record<string, unknown>>>(
    input: CreateMemoryInput<T>,
  ): MemoryRecord<T> {
    const memoryId = input.memoryId ?? newId('mem');
    if (this.repository.get(memoryId)) {
      throw new Error(`Memory already exists: ${memoryId}`);
    }
    const now = nowIso(this.clock);
    const tags = Object.freeze([...(input.tags ?? [])]);
    const payload = freezePayload(input.payload);
    const context = freezeContext(input.context);
    const record: MemoryRecord<T> = {
      memoryId,
      memoryType: input.memoryType,
      version: 1,
      status: 'active',
      context,
      payload,
      tags,
      createdAt: now,
      updatedAt: now,
      createdBy: input.actorId,
      searchText: buildSearchText(
        payload as Record<string, unknown>,
        tags,
        context as unknown as Record<string, unknown>,
      ),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    };
    this.repository.save(record as MemoryRecord);
    this.versions.record(record as MemoryRecord, input.actorId, 'create');
    this.events.publish({
      type: 'MemoryCreated',
      memoryId,
      memoryType: input.memoryType,
      version: 1,
      actorId: input.actorId,
      workflowId: input.context.workflowId,
    });
    return record;
  }

  /** Update creates a new version — previous versions remain in VersionManager. */
  update(
    memoryId: string,
    patch: {
      payload?: Readonly<Record<string, unknown>>;
      context?: Partial<MemoryEducationalContext>;
      tags?: readonly string[];
      metadata?: Readonly<Record<string, unknown>>;
      actorId: string;
      reason?: string;
    },
  ): MemoryRecord {
    const current = this.requireActive(memoryId);
    const nextVersion = current.version + 1;
    const now = nowIso(this.clock);
    const payload = freezePayload({
      ...(current.payload as Record<string, unknown>),
      ...(patch.payload ?? {}),
    });
    const context = freezeContext({
      ...current.context,
      ...(patch.context ?? {}),
    });
    const tags = Object.freeze(
      patch.tags ? [...patch.tags] : [...current.tags],
    );
    const record: MemoryRecord = {
      ...current,
      version: nextVersion,
      payload,
      context,
      tags,
      updatedAt: now,
      searchText: buildSearchText(
        payload as Record<string, unknown>,
        tags,
        context as unknown as Record<string, unknown>,
      ),
      metadata: Object.freeze({
        ...current.metadata,
        ...(patch.metadata ?? {}),
      }),
    };
    this.repository.save(record);
    this.versions.record(record, patch.actorId, patch.reason ?? 'update');
    this.events.publish({
      type: 'MemoryUpdated',
      memoryId,
      memoryType: record.memoryType,
      version: nextVersion,
      actorId: patch.actorId,
      workflowId: record.context.workflowId,
      metadata: { reason: patch.reason },
    });
    return record;
  }

  get(memoryId: string): MemoryRecord | undefined {
    return this.repository.get(memoryId);
  }

  query(query: MemoryQuery): readonly MemorySearchHit[] {
    return this.queryEngine.search(this.repository.list(), query);
  }

  searchByWorkflow(workflowId: string, limit?: number): readonly MemorySearchHit[] {
    return this.query({ workflowId, limit });
  }

  searchByTeacher(teacherId: string, limit?: number): readonly MemorySearchHit[] {
    return this.query({ teacherId, limit });
  }

  searchByProject(projectId: string, limit?: number): readonly MemorySearchHit[] {
    return this.query({ projectId, limit });
  }

  searchByCompetency(
    competencyId: string,
    limit?: number,
  ): readonly MemorySearchHit[] {
    return this.query({ competencyId, limit });
  }

  searchByLesson(lessonId: string, limit?: number): readonly MemorySearchHit[] {
    return this.query({ lessonId, limit });
  }

  archive(memoryId: string, actorId: string): MemoryRecord {
    const current = this.requireActive(memoryId);
    const record: MemoryRecord = {
      ...current,
      status: 'archived',
      version: current.version + 1,
      updatedAt: nowIso(this.clock),
    };
    this.repository.save(record);
    this.versions.record(record, actorId, 'archive');
    this.events.publish({
      type: 'MemoryArchived',
      memoryId,
      memoryType: record.memoryType,
      version: record.version,
      actorId,
      workflowId: record.context.workflowId,
    });
    return record;
  }

  /** Restore from a specific version or reactivate archived memory. */
  restore(
    memoryId: string,
    actorId: string,
    version?: number,
  ): MemoryRecord {
    const current = this.repository.get(memoryId);
    if (!current) throw new Error(`Unknown memory: ${memoryId}`);

    let base = current;
    if (typeof version === 'number') {
      const entry = this.versions.getVersion(memoryId, version);
      if (!entry) {
        throw new Error(`Unknown version ${version} for ${memoryId}`);
      }
      base = entry.snapshot;
    }

    const record: MemoryRecord = {
      ...base,
      status: 'active',
      version: current.version + 1,
      updatedAt: nowIso(this.clock),
    };
    this.repository.save(record);
    this.versions.record(record, actorId, 'restore');
    this.events.publish({
      type: 'MemoryRestored',
      memoryId,
      memoryType: record.memoryType,
      version: record.version,
      actorId,
      workflowId: record.context.workflowId,
      metadata: { restoredFromVersion: version ?? base.version },
    });
    return record;
  }

  /** Soft delete — retains version history. */
  delete(memoryId: string, actorId: string): MemoryRecord {
    const current = this.repository.get(memoryId);
    if (!current) throw new Error(`Unknown memory: ${memoryId}`);
    const record: MemoryRecord = {
      ...current,
      status: 'deleted',
      version: current.version + 1,
      updatedAt: nowIso(this.clock),
    };
    this.repository.save(record);
    this.versions.record(record, actorId, 'delete');
    this.events.publish({
      type: 'MemoryDeleted',
      memoryId,
      memoryType: record.memoryType,
      version: record.version,
      actorId,
      workflowId: record.context.workflowId,
    });
    return record;
  }

  history(memoryId: string): readonly MemoryVersionEntry[] {
    return this.versions.history(memoryId);
  }

  createSnapshot(input: {
    label: string;
    createdBy: string;
    memoryIds?: readonly string[];
    memoryType?: MemoryType;
    metadata?: Readonly<Record<string, unknown>>;
  }): MemorySnapshot {
    let records = this.repository.list().filter((r) => r.status === 'active');
    if (input.memoryIds) {
      const set = new Set(input.memoryIds);
      records = records.filter((r) => set.has(r.memoryId));
    }
    if (input.memoryType) {
      records = records.filter((r) => r.memoryType === input.memoryType);
    }
    return this.snapshots.create({
      label: input.label,
      createdBy: input.createdBy,
      records,
      metadata: input.metadata,
    });
  }

  /** Restore all records from an immutable snapshot (new versions). */
  restoreSnapshot(snapshotId: string, actorId: string): readonly MemoryRecord[] {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) throw new Error(`Unknown snapshot: ${snapshotId}`);
    const restored: MemoryRecord[] = [];
    for (const snap of snapshot.records) {
      const existing = this.repository.get(snap.memoryId);
      if (!existing) {
        const record: MemoryRecord = {
          ...snap,
          status: 'active',
          updatedAt: nowIso(this.clock),
        };
        this.repository.save(record);
        this.versions.record(record, actorId, 'restore-snapshot');
        this.events.publish({
          type: 'MemoryRestored',
          memoryId: record.memoryId,
          memoryType: record.memoryType,
          version: record.version,
          actorId,
          workflowId: record.context.workflowId,
          metadata: { snapshotId },
        });
        restored.push(record);
      } else {
        const record: MemoryRecord = {
          ...snap,
          status: 'active',
          version: existing.version + 1,
          updatedAt: nowIso(this.clock),
        };
        this.repository.save(record);
        this.versions.record(record, actorId, 'restore-snapshot');
        this.events.publish({
          type: 'MemoryRestored',
          memoryId: record.memoryId,
          memoryType: record.memoryType,
          version: record.version,
          actorId,
          workflowId: record.context.workflowId,
          metadata: { snapshotId, previousVersion: existing.version },
        });
        restored.push(record);
      }
    }
    return restored;
  }

  private requireActive(memoryId: string): MemoryRecord {
    const current = this.repository.get(memoryId);
    if (!current) throw new Error(`Unknown memory: ${memoryId}`);
    if (current.status === 'deleted') {
      throw new Error(`Memory is deleted: ${memoryId}`);
    }
    return current;
  }
}

export function createMemoryEngine(
  options?: CreateMemoryEngineOptions,
): MemoryEngine {
  return new MemoryEngine(options);
}

function freezePayload<T>(payload: T): T {
  return Object.freeze(
    JSON.parse(JSON.stringify(payload)),
  ) as T;
}

function freezeContext(
  context: MemoryEducationalContext,
): MemoryEducationalContext {
  return Object.freeze({
    ...context,
    competencyIds: context.competencyIds
      ? Object.freeze([...context.competencyIds])
      : undefined,
    extra: context.extra ? Object.freeze({ ...context.extra }) : undefined,
  });
}
