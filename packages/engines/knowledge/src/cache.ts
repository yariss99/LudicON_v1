import type { KnowledgePackage, KnowledgeSearchHit } from '@prima/contracts';

export interface CacheStats {
  readonly hotEntries: number;
  readonly coldEntries: number;
  readonly hits: number;
  readonly misses: number;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tier: 'hot' | 'cold';
}

/**
 * In-process hot/cold cache. Distributed cache is a future Infrastructure Port.
 */
export class KnowledgeCache {
  private readonly hot = new Map<string, CacheEntry<unknown>>();
  private readonly cold = new Map<string, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;
  private readonly hotTtlMs: number;
  private readonly coldTtlMs: number;
  private readonly hotMax: number;

  constructor(options?: { hotTtlMs?: number; coldTtlMs?: number; hotMax?: number }) {
    this.hotTtlMs = options?.hotTtlMs ?? 60_000;
    this.coldTtlMs = options?.coldTtlMs ?? 600_000;
    this.hotMax = options?.hotMax ?? 200;
  }

  getSearch(key: string): KnowledgeSearchHit[] | undefined {
    return this.get(key) as KnowledgeSearchHit[] | undefined;
  }

  setSearch(key: string, value: KnowledgeSearchHit[], hot = true): void {
    this.set(key, value, hot);
  }

  getPackage(key: string): KnowledgePackage | undefined {
    return this.get(key) as KnowledgePackage | undefined;
  }

  setPackage(key: string, value: KnowledgePackage): void {
    this.set(key, value, true);
  }

  invalidate(prefix?: string): number {
    let n = 0;
    const clearMap = (map: Map<string, CacheEntry<unknown>>) => {
      if (!prefix) {
        n += map.size;
        map.clear();
        return;
      }
      for (const key of map.keys()) {
        if (key.startsWith(prefix)) {
          map.delete(key);
          n += 1;
        }
      }
    };
    clearMap(this.hot);
    clearMap(this.cold);
    return n;
  }

  invalidatePack(packId: string): number {
    // Pack-scoped keys plus aggregate search/package entries that may include the pack.
    return (
      this.invalidate(`pack:${packId}:`) +
      this.invalidate('search:') +
      this.invalidate('pkg:')
    );
  }

  stats(): CacheStats {
    return {
      hotEntries: this.hot.size,
      coldEntries: this.cold.size,
      hits: this.hits,
      misses: this.misses,
    };
  }

  private get(key: string): unknown | undefined {
    const now = Date.now();
    const fromHot = this.hot.get(key);
    if (fromHot && fromHot.expiresAt > now) {
      this.hits += 1;
      return fromHot.value;
    }
    if (fromHot) this.hot.delete(key);

    const fromCold = this.cold.get(key);
    if (fromCold && fromCold.expiresAt > now) {
      this.hits += 1;
      // promote
      this.set(key, fromCold.value, true);
      return fromCold.value;
    }
    if (fromCold) this.cold.delete(key);
    this.misses += 1;
    return undefined;
  }

  private set(key: string, value: unknown, hot: boolean): void {
    const entry: CacheEntry<unknown> = {
      value,
      expiresAt: Date.now() + (hot ? this.hotTtlMs : this.coldTtlMs),
      tier: hot ? 'hot' : 'cold',
    };
    if (hot) {
      if (this.hot.size >= this.hotMax) {
        const first = this.hot.keys().next().value;
        if (first) {
          const demoted = this.hot.get(first);
          this.hot.delete(first);
          if (demoted) {
            this.cold.set(first, {
              ...demoted,
              tier: 'cold',
              expiresAt: Date.now() + this.coldTtlMs,
            });
          }
        }
      }
      this.hot.set(key, entry);
    } else {
      this.cold.set(key, entry);
    }
  }
}

export function searchCacheKey(query: {
  text?: string;
  domain?: string;
  packId?: string;
  packVersion?: string;
  limit?: number;
  correlationId: string;
}): string {
  // Cache by query shape, not correlation (correlation is for tracing)
  return `search:${query.packId ?? '*'}:${query.packVersion ?? '*'}:${query.domain ?? '*'}:${query.text ?? ''}:${query.limit ?? 20}`;
}
