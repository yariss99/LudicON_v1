/**
 * Query Engine — metadata, full-text, and lightweight semantic retrieval.
 */

import { tokenize } from './ids.js';
import type {
  MemoryQuery,
  MemoryRecord,
  MemorySearchHit,
  MemoryLifecycleStatus,
  MemoryType,
} from './types.js';

export class MemoryQueryEngine {
  search(
    records: readonly MemoryRecord[],
    query: MemoryQuery,
  ): readonly MemorySearchHit[] {
    const types = normalizeList(query.memoryType);
    const statuses = normalizeList(query.status) ?? (['active'] as MemoryLifecycleStatus[]);
    const limit = query.limit ?? 50;

    const textTokens = query.text ? tokenize(query.text) : [];
    const semanticTokens = query.semanticText
      ? tokenize(query.semanticText)
      : [];

    const hits: MemorySearchHit[] = [];

    for (const record of records) {
      if (types && !types.includes(record.memoryType)) continue;
      if (statuses && !statuses.includes(record.status)) continue;
      if (query.teacherId && record.context.teacherId !== query.teacherId) {
        continue;
      }
      if (query.projectId && record.context.projectId !== query.projectId) {
        continue;
      }
      if (query.workflowId && record.context.workflowId !== query.workflowId) {
        continue;
      }
      if (query.lessonId && record.context.lessonId !== query.lessonId) {
        continue;
      }
      if (query.artifactId && record.context.artifactId !== query.artifactId) {
        continue;
      }
      if (
        query.competencyId &&
        !(record.context.competencyIds ?? []).includes(query.competencyId)
      ) {
        continue;
      }
      if (query.tags && query.tags.length > 0) {
        const tagSet = new Set(record.tags);
        if (!query.tags.every((t) => tagSet.has(t))) continue;
      }

      let score = 1;
      if (textTokens.length > 0) {
        const hay = record.searchText;
        const matched = textTokens.filter((t) => hay.includes(t)).length;
        if (matched === 0) continue;
        score += matched * 2;
      }
      if (semanticTokens.length > 0) {
        const hay = `${record.searchText} ${record.tags.join(' ')}`;
        const matched = semanticTokens.filter((t) => hay.includes(t)).length;
        if (matched === 0 && textTokens.length === 0) continue;
        score += matched * 3;
      }

      hits.push({ record, score });
    }

    return Object.freeze(
      hits.sort((a, b) => b.score - a.score).slice(0, limit),
    );
  }
}

function normalizeList<T extends string>(
  value: T | readonly T[] | undefined,
): T[] | undefined {
  if (value === undefined) return undefined;
  return (Array.isArray(value) ? [...value] : [value as T]) as T[];
}

export type { MemoryType };
