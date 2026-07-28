import { uid } from './ids.js';
import type {
  MemoryDomain,
  MemoryItem,
  MemoryItemStatus,
  MemorySource,
  MemoryTier,
  MemoryUpdateRecord,
} from './types.js';
import { ALL_MEMORY_DOMAINS } from './types.js';

/**
 * MemoryRegistry — authoritative index of teacher-owned memory items.
 */
export class MemoryRegistry {
  private readonly items = new Map<string, MemoryItem>();

  list(filter?: {
    teacherId?: string;
    domain?: MemoryDomain;
    tier?: MemoryTier;
    status?: MemoryItemStatus;
  }): MemoryItem[] {
    return [...this.items.values()].filter((item) => {
      if (filter?.teacherId && item.teacherId !== filter.teacherId) return false;
      if (filter?.domain && item.domain !== filter.domain) return false;
      if (filter?.tier && item.tier !== filter.tier) return false;
      if (filter?.status && item.status !== filter.status) return false;
      return true;
    });
  }

  get(id: string): MemoryItem | undefined {
    return this.items.get(id);
  }

  create(input: {
    teacherId: string;
    domain: MemoryDomain;
    tier: MemoryTier;
    title: string;
    payload: Record<string, unknown>;
    source: MemorySource;
    confidence: number;
    canonicalKey?: string;
    id?: string;
  }): MemoryItem | { error: string } {
    if (!ALL_MEMORY_DOMAINS.includes(input.domain)) {
      return { error: `Unknown memory domain: ${input.domain}` };
    }
    if (input.confidence < 0 || input.confidence > 1) {
      return { error: 'Confidence must be between 0 and 1' };
    }
    if (input.source.kind === 'system_observed' && input.confidence > 0.6) {
      return { error: 'Observed memory cannot exceed confidence 0.6 without teacher evidence' };
    }
    if (input.canonicalKey) {
      const clash = this.list({
        teacherId: input.teacherId,
        status: 'active',
      }).find((i) => i.canonicalKey === input.canonicalKey);
      if (clash) {
        return { error: `Duplicate memory prevented: ${clash.id}` };
      }
    }

    const now = new Date().toISOString();
    const update: MemoryUpdateRecord = {
      at: now,
      action: 'create',
      source: input.source,
    };
    const item: MemoryItem = {
      id: input.id ?? uid('mem'),
      teacherId: input.teacherId,
      domain: input.domain,
      tier: input.tier,
      title: input.title.trim(),
      payload: structuredClone(input.payload),
      source: input.source,
      confidence: input.confidence,
      lastUpdated: now,
      usageCount: 0,
      status: 'active',
      createdAt: now,
      canonicalKey: input.canonicalKey,
      updateLog: [update],
    };
    this.items.set(item.id, item);
    return item;
  }

  update(
    id: string,
    patch: {
      title?: string;
      payload?: Record<string, unknown>;
      confidence?: number;
      status?: MemoryItemStatus;
      source: MemorySource;
      note?: string;
      action?: MemoryUpdateRecord['action'];
    },
  ): MemoryItem | { error: string } {
    const current = this.items.get(id);
    if (!current || current.status === 'deleted') {
      return { error: 'Memory item not found' };
    }
    const now = new Date().toISOString();
    const next: MemoryItem = {
      ...current,
      title: patch.title?.trim() ?? current.title,
      payload: patch.payload
        ? { ...current.payload, ...patch.payload }
        : current.payload,
      confidence: patch.confidence ?? current.confidence,
      status: patch.status ?? current.status,
      source: patch.source,
      lastUpdated: now,
      updateLog: [
        {
          at: now,
          action: patch.action ?? 'update',
          source: patch.source,
          note: patch.note,
        },
        ...current.updateLog,
      ],
    };
    this.items.set(id, next);
    return next;
  }

  /** Teacher correction immediately overwrites previous memory */
  correct(
    id: string,
    payload: Record<string, unknown>,
    source: MemorySource,
    note?: string,
  ): MemoryItem | { error: string } {
    return this.update(id, {
      payload,
      confidence: 1,
      source: { ...source, kind: 'teacher_correction' },
      action: 'correct',
      note,
    });
  }

  recordUse(id: string): MemoryItem | { error: string } {
    const current = this.items.get(id);
    if (!current || current.status !== 'active') {
      return { error: 'Memory item not found' };
    }
    const now = new Date().toISOString();
    const next: MemoryItem = {
      ...current,
      usageCount: current.usageCount + 1,
      lastUpdated: now,
      updateLog: [
        {
          at: now,
          action: 'use',
          source: current.source,
        },
        ...current.updateLog,
      ],
    };
    this.items.set(id, next);
    return next;
  }

  softDelete(id: string, source: MemorySource): MemoryItem | { error: string } {
    return this.update(id, {
      status: 'deleted',
      source,
      action: 'delete',
    });
  }

  archive(id: string, source: MemorySource): MemoryItem | { error: string } {
    return this.update(id, {
      status: 'archived',
      source,
      action: 'archive',
    });
  }
}
