import type { KnowledgeRegistry } from './knowledge-registry.js';
import type { RelationshipEngine } from './relationship-engine.js';
import type {
  GraphTraversalResult,
  KnowledgeEdge,
  KnowledgeEntity,
  PedagogicalRelationType,
} from './types.js';

/**
 * KnowledgeGraph — traversal over connected pedagogical entities.
 */
export class KnowledgeGraph {
  constructor(
    private readonly registry: KnowledgeRegistry,
    private readonly relationships: RelationshipEngine,
  ) {}

  /**
   * BFS traversal from a start node following optional relation filter.
   */
  traverse(
    startId: string,
    options?: {
      direction?: 'out' | 'in' | 'both';
      relationType?: PedagogicalRelationType;
      maxDepth?: number;
    },
  ): GraphTraversalResult | { error: string } {
    const start = this.registry.get(startId);
    if (!start) return { error: 'Start entity not found' };

    const direction = options?.direction ?? 'out';
    const maxDepth = options?.maxDepth ?? 4;
    const visited = new Set<string>([startId]);
    const nodes: KnowledgeEntity[] = [start];
    const edges: KnowledgeEdge[] = [];
    const path: string[] = [startId];
    let frontier = [startId];
    let depth = 0;

    while (frontier.length > 0 && depth < maxDepth) {
      const nextFrontier: string[] = [];
      for (const id of frontier) {
        const out =
          direction === 'in'
            ? []
            : this.relationships.outgoing(id, options?.relationType);
        const inn =
          direction === 'out'
            ? []
            : this.relationships.incoming(id, options?.relationType);

        for (const edge of [...out, ...inn]) {
          const neighbor = edge.fromId === id ? edge.toId : edge.fromId;
          edges.push(edge);
          if (visited.has(neighbor)) continue;
          const entity = this.registry.get(neighbor);
          if (!entity || entity.status === 'archived' || entity.status === 'merged') {
            continue;
          }
          visited.add(neighbor);
          nodes.push(entity);
          path.push(neighbor);
          nextFrontier.push(neighbor);
        }
      }
      frontier = nextFrontier;
      depth += 1;
    }

    return { nodes, edges: dedupeEdges(edges), path };
  }

  neighbors(
    id: string,
    relationType?: PedagogicalRelationType,
  ): KnowledgeEntity[] {
    const result = this.traverse(id, {
      direction: 'both',
      relationType,
      maxDepth: 1,
    });
    if ('error' in result) return [];
    return result.nodes.filter((n) => n.id !== id);
  }
}

function dedupeEdges(edges: KnowledgeEdge[]): KnowledgeEdge[] {
  const seen = new Set<string>();
  const out: KnowledgeEdge[] = [];
  for (const edge of edges) {
    if (seen.has(edge.id)) continue;
    seen.add(edge.id);
    out.push(edge);
  }
  return out;
}
