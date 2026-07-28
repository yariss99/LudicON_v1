import type { MemoryRegistry } from './memory-registry.js';
import type { MemorySearchHit, MemorySearchRequest } from './types.js';

function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i');
}

function tokenize(text: string): string[] {
  return fold(text)
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length > 1);
}

/** Light stem / synonym bridge for pedagogical search phrases */
function expandToken(token: string): string[] {
  const out = new Set([token]);
  if (token.startsWith('fraction')) out.add('fracti');
  if (token.startsWith('fracti')) out.add('fraction');
  if (token === 'lessons' || token === 'lesson') out.add('blueprint');
  if (token === 'games' || token === 'game') out.add('game');
  if (token === 'grade' || token === 'clasa') {
    out.add('clasa');
    out.add('grade');
  }
  if (token === 'ii' || token === '2') {
    out.add('ii');
    out.add('2');
  }
  return [...out];
}

/**
 * MemorySearch — semantic/lexical search across teacher memory.
 */
export class MemorySearch {
  constructor(private readonly registry: MemoryRegistry) {}

  search(request: MemorySearchRequest): MemorySearchHit[] {
    const limit = request.limit ?? 20;
    const tokens = tokenize(request.text).flatMap(expandToken);
    const text = fold(request.text);
    const hits: MemorySearchHit[] = [];

    for (const item of this.registry.list({
      teacherId: request.teacherId,
      domain: request.domain,
      tier: request.tier,
      status: 'active',
    })) {
      const blob = fold(`${item.title} ${JSON.stringify(item.payload)}`);
      const title = fold(item.title);
      let score = 0;
      if (text && blob.includes(text)) score += 10;
      for (const t of tokens) {
        if (blob.includes(t)) score += 3;
        if (title.includes(t)) score += 2;
      }
      if (score <= 0) continue;
      hits.push({
        item,
        score,
        explanation: `Matched “${item.title}” in ${item.domain} (score ${score}).`,
      });
    }

    return hits.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
