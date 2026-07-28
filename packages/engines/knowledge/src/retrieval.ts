import type {
  KnowledgeObject,
  KnowledgeQuery,
  KnowledgeSearchHit,
  KnowledgeTrustLevel,
} from '@prima/contracts';
import type { StoredPackVersion } from './store.js';
import { assertPublishedReadable } from './validation.js';

const DEFAULT_TRUST: KnowledgeTrustLevel[] = [
  'authoritative',
  'derived',
  'advisory',
  'operational',
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-zăâîșț0-9]+/i)
    .filter((t) => t.length > 1);
}

function scoreObject(query: KnowledgeQuery, object: KnowledgeObject): number {
  let score = 0;
  const text = query.text?.toLowerCase() ?? '';
  if (text) {
    const title = object.title.toLowerCase();
    if (title.includes(text)) score += 10;
    const tokens = tokenize(text);
    for (const t of tokens) {
      if (title.includes(t)) score += 3;
      const payloadStr = JSON.stringify(object.payload).toLowerCase();
      if (payloadStr.includes(t)) score += 1;
    }
  } else {
    score += 1;
  }

  const hints = query.contextHints;
  if (hints?.subject) {
    const payloadStr = JSON.stringify(object.payload).toLowerCase();
    if (payloadStr.includes(hints.subject.toLowerCase())) score += 5;
  }
  if (hints?.gradeBand) {
    const payloadStr = JSON.stringify(object.payload).toLowerCase();
    if (payloadStr.includes(hints.gradeBand.toLowerCase())) score += 4;
  }

  if (object.trustLevel === 'authoritative') score += 2;
  if (object.trustLevel === 'advisory') score += 1;

  return score;
}

/**
 * Lexical + context-hint ranking.
 * Semantic search is a future Port — interface reserved via query flag in engine.
 */
export function searchKnowledge(
  corpora: readonly StoredPackVersion[],
  query: KnowledgeQuery,
): KnowledgeSearchHit[] {
  const trust = new Set(query.trustLevels ?? DEFAULT_TRUST);
  const domains = new Set(
    query.domains ?? (query.domain ? [query.domain] : []),
  );
  const limit = query.limit ?? 20;
  const hits: KnowledgeSearchHit[] = [];

  for (const stored of corpora) {
    const blocked = assertPublishedReadable(stored.pack);
    if (blocked) {
      // Deprecated still readable for old assemblies; quarantine not
      if (stored.pack.lifecycleState !== 'deprecated') continue;
    }
    if (query.packId && stored.pack.packId !== query.packId) continue;
    if (query.packVersion && stored.pack.version !== query.packVersion) continue;
    if (domains.size > 0 && !domains.has(stored.pack.domain)) continue;

    const tags = query.tags ?? [];

    for (const object of stored.objects.values()) {
      if (!trust.has(object.trustLevel)) continue;
      if (object.trustLevel === 'untrusted' || object.trustLevel === 'generated_candidate') {
        continue;
      }
      if (domains.size > 0 && !domains.has(object.domain)) continue;
      if (tags.length > 0) {
        const haystack = `${object.title} ${JSON.stringify(object.payload)}`.toLowerCase();
        if (!tags.every((t) => haystack.includes(t.toLowerCase()))) continue;
      }
      const score = scoreObject(query, object);
      if (score <= 0 && query.text) continue;
      hits.push({
        object,
        score,
        packId: stored.pack.packId,
        packVersion: stored.pack.version,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}

/** Future semantic search Port — not implemented in-process. */
export interface SemanticSearchPort {
  search(query: KnowledgeQuery): Promise<KnowledgeSearchHit[]>;
}
