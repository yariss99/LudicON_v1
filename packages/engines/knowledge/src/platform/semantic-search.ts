import type { KnowledgeRegistry } from './knowledge-registry.js';
import type { KnowledgeGraph } from './knowledge-graph.js';
import type { RelationshipEngine } from './relationship-engine.js';
import type {
  KnowledgeSearchHit,
  KnowledgeSearchRequest,
} from './types.js';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-zăâîșț0-9]+/i)
    .filter((t) => t.length > 1);
}

/**
 * SemanticSearch — keyword, semantic (lexical+metadata), relationship, similarity.
 * Embedding providers may plug in later; in-process ranking remains explainable.
 */
export class SemanticSearch {
  constructor(
    private readonly registry: KnowledgeRegistry,
    private readonly relationships: RelationshipEngine,
    private readonly graph: KnowledgeGraph,
  ) {}

  search(request: KnowledgeSearchRequest): KnowledgeSearchHit[] {
    const mode = request.mode ?? (request.relatedToId ? 'relationship' : 'semantic');
    const limit = request.limit ?? 20;

    if (mode === 'relationship' && request.relatedToId) {
      return this.relationshipSearch(request).slice(0, limit);
    }
    if (mode === 'similarity' && request.relatedToId) {
      return this.similaritySearch(request).slice(0, limit);
    }
    if (mode === 'recommendation') {
      return this.semanticRank(request).slice(0, limit);
    }
    return this.semanticRank(request).slice(0, limit);
  }

  private semanticRank(request: KnowledgeSearchRequest): KnowledgeSearchHit[] {
    const text = request.text?.toLowerCase() ?? '';
    const tokens = tokenize(text);
    const categories = new Set(
      request.categories ?? (request.category ? [request.category] : []),
    );

    const hits: KnowledgeSearchHit[] = [];
    for (const entity of this.registry.list('published')) {
      if (categories.size && !categories.has(entity.category)) continue;

      let score = 0;
      const title = entity.title.toLowerCase();
      const desc = entity.description.toLowerCase();
      const meta = JSON.stringify(entity.metadata).toLowerCase();

      if (text && title.includes(text)) score += 12;
      for (const t of tokens) {
        if (title.includes(t)) score += 4;
        if (desc.includes(t)) score += 2;
        if (meta.includes(t)) score += 1;
      }
      if (request.grade) {
        const g = String(request.grade).toLowerCase();
        if (meta.includes(g) || desc.includes(g) || title.includes(g)) score += 5;
      }
      if (request.subject) {
        const s = String(request.subject).toLowerCase();
        if (meta.includes(s) || desc.includes(s) || title.includes(s)) score += 5;
      }
      if (!text && !request.grade && !request.subject) score += 1;
      if (score <= 0) continue;

      hits.push({
        entity,
        score,
        explanation: explainHit(entity.title, score, modeLabel(request)),
      });
    }

    hits.sort((a, b) => b.score - a.score);
    return hits;
  }

  private relationshipSearch(request: KnowledgeSearchRequest): KnowledgeSearchHit[] {
    if (!request.relatedToId) return [];
    const edges = [
      ...this.relationships.outgoing(request.relatedToId, request.relationType),
      ...this.relationships.incoming(request.relatedToId, request.relationType),
    ];
    const hits: KnowledgeSearchHit[] = [];
    for (const edge of edges) {
      const neighborId = edge.fromId === request.relatedToId ? edge.toId : edge.fromId;
      const entity = this.registry.get(neighborId);
      if (!entity || entity.status !== 'published') continue;
      if (request.category && entity.category !== request.category) continue;
      hits.push({
        entity,
        score: 10,
        explanation: `Related via ${edge.type} to ${request.relatedToId}`,
      });
    }
    return hits;
  }

  private similaritySearch(request: KnowledgeSearchRequest): KnowledgeSearchHit[] {
    const seed = request.relatedToId
      ? this.registry.get(request.relatedToId)
      : undefined;
    if (!seed) return this.semanticRank(request);

    const neighbors = this.graph.neighbors(seed.id);
    const neighborIds = new Set(neighbors.map((n) => n.id));
    const base = this.semanticRank({
      ...request,
      text: request.text ?? `${seed.title} ${seed.description}`,
      category: request.category ?? seed.category,
    });

    return base.map((hit) =>
      neighborIds.has(hit.entity.id)
        ? {
            ...hit,
            score: hit.score + 6,
            explanation: `${hit.explanation}; graph-adjacent to ${seed.title}`,
          }
        : hit,
    );
  }
}

function modeLabel(request: KnowledgeSearchRequest): string {
  return request.mode ?? 'semantic';
}

function explainHit(title: string, score: number, mode: string): string {
  return `Matched “${title}” via ${mode} search (score ${score}).`;
}
