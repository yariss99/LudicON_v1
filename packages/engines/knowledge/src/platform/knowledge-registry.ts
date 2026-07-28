import type {
  KnowledgeDomainCategory,
  KnowledgeEntity,
  KnowledgeEntityStatus,
  KnowledgeQuery,
  KnowledgeSourceKind,
} from './types.js';
import { ALL_KNOWLEDGE_DOMAINS } from './types.js';

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function canonicalKey(title: string, category: KnowledgeDomainCategory): string {
  return `${category}::${title.trim().toLowerCase().replace(/\s+/g, ' ')}`;
}

/**
 * KnowledgeRegistry — versioned entity store with duplicate prevention.
 */
export class KnowledgeRegistry {
  private readonly entities = new Map<string, KnowledgeEntity>();
  /** canonicalKey -> id (active only) */
  private readonly byCanonical = new Map<string, string>();
  /** id -> version history snapshots */
  private readonly history = new Map<string, KnowledgeEntity[]>();

  list(status?: KnowledgeEntityStatus): KnowledgeEntity[] {
    const all = [...this.entities.values()];
    return status ? all.filter((e) => e.status === status) : all;
  }

  get(id: string): KnowledgeEntity | undefined {
    return this.entities.get(id);
  }

  byCategory(category: KnowledgeDomainCategory): KnowledgeEntity[] {
    return this.list('published').filter((e) => e.category === category);
  }

  historyOf(id: string): KnowledgeEntity[] {
    return this.history.get(id) ?? [];
  }

  query(q: KnowledgeQuery): KnowledgeEntity[] {
    const status = q.status ?? 'published';
    const text = q.text?.toLowerCase().trim();
    return this.list(status).filter((e) => {
      if (q.category && e.category !== q.category) return false;
      if (q.language && e.language !== q.language) return false;
      const meta = JSON.stringify(e.metadata).toLowerCase();
      const blob = `${e.title} ${e.description} ${meta}`.toLowerCase();
      if (text && !blob.includes(text)) return false;
      if (q.grade && !blob.includes(String(q.grade).toLowerCase())) return false;
      if (q.subject && !blob.includes(String(q.subject).toLowerCase())) return false;
      if (q.topic && !blob.includes(String(q.topic).toLowerCase())) return false;
      return true;
    });
  }

  add(input: {
    title: string;
    description: string;
    category: KnowledgeDomainCategory;
    evidenceSource: {
      kind: KnowledgeSourceKind;
      sourceId: string;
      label: string;
    };
    metadata?: KnowledgeEntity['metadata'];
    language?: string;
    status?: KnowledgeEntityStatus;
    id?: string;
    version?: string;
  }): KnowledgeEntity | { error: string } {
    if (!ALL_KNOWLEDGE_DOMAINS.includes(input.category)) {
      return { error: `Unknown knowledge domain: ${input.category}` };
    }
    const key = canonicalKey(input.title, input.category);
    const existingId = this.byCanonical.get(key);
    if (existingId) {
      const existing = this.entities.get(existingId);
      if (existing && existing.status !== 'archived' && existing.status !== 'merged') {
        return { error: `Duplicate entity prevented: ${input.title} (${input.category})` };
      }
    }

    const now = new Date().toISOString();
    const entity: KnowledgeEntity = {
      id: input.id ?? uid('ke'),
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      metadata: input.metadata ?? {},
      evidenceSource: input.evidenceSource,
      version: input.version ?? '1.0.0',
      language: input.language ?? 'ro',
      status: input.status ?? 'verified',
      createdAt: now,
      updatedAt: now,
      canonicalKey: key,
    };

    this.entities.set(entity.id, entity);
    this.byCanonical.set(key, entity.id);
    this.history.set(entity.id, [structuredClone(entity)]);
    return entity;
  }

  update(
    id: string,
    patch: Partial<Pick<KnowledgeEntity, 'title' | 'description' | 'metadata' | 'status' | 'language'>>,
  ): KnowledgeEntity | { error: string } {
    const current = this.entities.get(id);
    if (!current) return { error: 'Entity not found' };

    if (patch.title && patch.title !== current.title) {
      const key = canonicalKey(patch.title, current.category);
      const clash = this.byCanonical.get(key);
      if (clash && clash !== id) {
        return { error: 'Update would create duplicate entity' };
      }
      this.byCanonical.delete(current.canonicalKey);
      this.byCanonical.set(key, id);
    }

    const next: KnowledgeEntity = {
      ...current,
      ...patch,
      title: patch.title?.trim() ?? current.title,
      description: patch.description?.trim() ?? current.description,
      canonicalKey: patch.title
        ? canonicalKey(patch.title, current.category)
        : current.canonicalKey,
      version: bumpPatch(current.version),
      updatedAt: new Date().toISOString(),
    };

    this.entities.set(id, next);
    const hist = this.history.get(id) ?? [];
    hist.unshift(structuredClone(next));
    this.history.set(id, hist);
    return next;
  }

  archive(id: string): KnowledgeEntity | { error: string } {
    return this.update(id, { status: 'archived' });
  }

  mergeDuplicates(keepId: string, removeId: string): KnowledgeEntity | { error: string } {
    const keep = this.entities.get(keepId);
    const remove = this.entities.get(removeId);
    if (!keep || !remove) return { error: 'Entity not found' };
    if (keep.category !== remove.category) {
      return { error: 'Cannot merge entities from different domains' };
    }
    this.byCanonical.delete(remove.canonicalKey);
    const archived = this.update(removeId, { status: 'merged' });
    if ('error' in archived) return archived;
    return keep;
  }

  bulkImport(entities: Parameters<KnowledgeRegistry['add']>[0][]): {
    added: KnowledgeEntity[];
    errors: string[];
  } {
    const added: KnowledgeEntity[] = [];
    const errors: string[] = [];
    for (const item of entities) {
      const result = this.add(item);
      if ('error' in result) errors.push(result.error);
      else added.push(result);
    }
    return { added, errors };
  }

  publish(id: string): KnowledgeEntity | { error: string } {
    return this.update(id, { status: 'published' });
  }
}

function bumpPatch(version: string): string {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return `${version}+1`;
  }
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}
