import type {
  KnowledgeEdge,
  PedagogicalRelationType,
  RelationshipQuery,
} from './types.js';
import type { KnowledgeRegistry } from './knowledge-registry.js';

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * RelationshipEngine — directional typed edges only.
 */
export class RelationshipEngine {
  private readonly edges = new Map<string, KnowledgeEdge>();
  /** fromId -> edgeIds */
  private readonly outIndex = new Map<string, Set<string>>();
  /** toId -> edgeIds */
  private readonly inIndex = new Map<string, Set<string>>();

  constructor(private readonly registry: KnowledgeRegistry) {}

  list(): KnowledgeEdge[] {
    return [...this.edges.values()];
  }

  query(q: RelationshipQuery): KnowledgeEdge[] {
    return this.list().filter((e) => {
      if (q.fromId && e.fromId !== q.fromId) return false;
      if (q.toId && e.toId !== q.toId) return false;
      if (q.type && e.type !== q.type) return false;
      if (q.entityId && e.fromId !== q.entityId && e.toId !== q.entityId) {
        return false;
      }
      return true;
    });
  }

  /** Repoint edges when merging duplicate entities */
  repoint(fromEntityId: string, toEntityId: string): number {
    let changed = 0;
    for (const edge of this.list()) {
      let nextFrom = edge.fromId;
      let nextTo = edge.toId;
      if (edge.fromId === fromEntityId) nextFrom = toEntityId;
      if (edge.toId === fromEntityId) nextTo = toEntityId;
      if (nextFrom === edge.fromId && nextTo === edge.toId) continue;
      if (nextFrom === nextTo) {
        this.remove(edge.id);
        changed += 1;
        continue;
      }
      const clash = this.list().find(
        (e) =>
          e.id !== edge.id &&
          e.type === edge.type &&
          e.fromId === nextFrom &&
          e.toId === nextTo,
      );
      this.remove(edge.id);
      if (!clash) {
        this.add({
          type: edge.type,
          fromId: nextFrom,
          toId: nextTo,
          metadata: edge.metadata,
        });
      }
      changed += 1;
    }
    return changed;
  }

  add(input: {
    type: PedagogicalRelationType;
    fromId: string;
    toId: string;
    metadata?: Record<string, string>;
  }): KnowledgeEdge | { error: string } {
    if (!this.registry.get(input.fromId) || !this.registry.get(input.toId)) {
      return { error: 'Both entities must exist for a relationship' };
    }
    if (input.fromId === input.toId) {
      return { error: 'Self-relationships are not allowed' };
    }
    const duplicate = this.list().find(
      (e) =>
        e.type === input.type &&
        e.fromId === input.fromId &&
        e.toId === input.toId,
    );
    if (duplicate) return { error: 'Duplicate relationship prevented' };

    const edge: KnowledgeEdge = {
      id: uid('kr'),
      type: input.type,
      fromId: input.fromId,
      toId: input.toId,
      metadata: input.metadata,
    };
    this.edges.set(edge.id, edge);
    this.index(edge);
    return edge;
  }

  remove(edgeId: string): boolean {
    const edge = this.edges.get(edgeId);
    if (!edge) return false;
    this.edges.delete(edgeId);
    this.outIndex.get(edge.fromId)?.delete(edgeId);
    this.inIndex.get(edge.toId)?.delete(edgeId);
    return true;
  }

  outgoing(fromId: string, type?: PedagogicalRelationType): KnowledgeEdge[] {
    const ids = this.outIndex.get(fromId) ?? new Set();
    return [...ids]
      .map((id) => this.edges.get(id)!)
      .filter((e) => (type ? e.type === type : true));
  }

  incoming(toId: string, type?: PedagogicalRelationType): KnowledgeEdge[] {
    const ids = this.inIndex.get(toId) ?? new Set();
    return [...ids]
      .map((id) => this.edges.get(id)!)
      .filter((e) => (type ? e.type === type : true));
  }

  private index(edge: KnowledgeEdge): void {
    if (!this.outIndex.has(edge.fromId)) this.outIndex.set(edge.fromId, new Set());
    if (!this.inIndex.has(edge.toId)) this.inIndex.set(edge.toId, new Set());
    this.outIndex.get(edge.fromId)!.add(edge.id);
    this.inIndex.get(edge.toId)!.add(edge.id);
  }
}
