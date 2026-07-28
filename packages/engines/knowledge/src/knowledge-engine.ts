import type {
  EngineConfigSchema,
  EventBus,
  ExecutionContext,
  KernelContext,
  KnowledgeAggregateRequest,
  KnowledgeEngineEventType,
  KnowledgeImportRequest,
  KnowledgeImportResult,
  KnowledgeObject,
  KnowledgePack,
  KnowledgePackage,
  KnowledgeQuery,
  KnowledgeResolveRequest,
  KnowledgeSearchHit,
  ProvenanceRecord,
} from '@prima/contracts';
import { BasePrimaEngine } from '@prima/engine-sdk';
import type { MapEngineConfiguration } from '@prima/engine-sdk';
import { KnowledgeCache, searchCacheKey } from './cache.js';
import { searchKnowledge, type SemanticSearchPort } from './retrieval.js';
import { InMemoryKnowledgeStore } from './store.js';
import { assertPublishedReadable, validateImport } from './validation.js';
import { KNOWLEDGE_ENGINE_MANIFEST } from './manifest.js';

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export type KnowledgeEngineOptions = {
  readonly eventBus?: EventBus;
  readonly store?: InMemoryKnowledgeStore;
  readonly cache?: KnowledgeCache;
  readonly semanticSearch?: SemanticSearchPort;
};

/**
 * ENG-02 Knowledge Engine — knowledge as a service.
 * Never decides pedagogy. Never generates educational resources.
 * Knowledge is pulled via explicit requests.
 */
export class KnowledgeEngine extends BasePrimaEngine {
  private readonly store: InMemoryKnowledgeStore;
  private readonly cache: KnowledgeCache;
  private readonly eventBus?: EventBus;
  private readonly semanticSearch?: SemanticSearchPort;

  constructor(options: KnowledgeEngineOptions = {}) {
    super(KNOWLEDGE_ENGINE_MANIFEST);
    this.store = options.store ?? new InMemoryKnowledgeStore();
    this.cache = options.cache ?? new KnowledgeCache();
    this.eventBus = options.eventBus;
    this.semanticSearch = options.semanticSearch;
  }

  getConfigurationSchema(): EngineConfigSchema {
    return {
      keys: [
        { key: 'enableSemanticSearch', required: false, defaultValue: false },
        { key: 'defaultSearchLimit', required: false, defaultValue: 20 },
        { key: 'cacheHotTtlMs', required: false, defaultValue: 60_000 },
      ],
    };
  }

  protected async onInitialize(_context: KernelContext): Promise<void> {
    this.observability.logger.info('Knowledge Engine initialized');
  }

  protected async onConfigure(_config: MapEngineConfiguration): Promise<void> {}

  protected async onStart(_execution: ExecutionContext): Promise<void> {
    this.observability.logger.info('Knowledge Engine started');
  }

  async importKnowledge(request: KnowledgeImportRequest): Promise<KnowledgeImportResult> {
    this.setBusy();
    try {
      const existing = this.store.getPack(request.pack.packId, request.pack.version);
      const { result, conflicts } = validateImport(
        request,
        existing
          ? { pack: existing.pack, objects: existing.objects }
          : undefined,
      );

      if (conflicts.length > 0) {
        await this.emit('KnowledgeConflictDetected', {
          packId: request.pack.packId,
          version: request.pack.version,
          conflicts,
        });
      }

      if (!result.ok) {
        await this.emit('KnowledgeValidationFailed', {
          packId: request.pack.packId,
          version: request.pack.version,
          issues: result.issues,
          source: request.source,
        });
        return {
          ok: false,
          packId: request.pack.packId,
          version: request.pack.version,
          issues: result.issues.map((i) => i.message),
        };
      }

      let pack = request.pack;
      if (
        (request.source === 'external' ||
          request.source === 'plugin' ||
          request.source === 'connector') &&
        pack.lifecycleState === 'published'
      ) {
        pack = { ...pack, lifecycleState: 'quarantine', trustLevel: 'untrusted' };
      }

      await this.emit('KnowledgeValidated', {
        packId: pack.packId,
        version: pack.version,
        source: request.source,
      });

      this.store.upsert(pack, request.objects);
      this.cache.invalidatePack(pack.packId);

      await this.emit('KnowledgeImported', {
        packId: pack.packId,
        version: pack.version,
        source: request.source,
        objectCount: request.objects.length,
      });

      return {
        ok: true,
        packId: pack.packId,
        version: pack.version,
        issues: [],
      };
    } finally {
      this.setReady();
    }
  }

  async publishPack(packId: string, version: string): Promise<KnowledgeImportResult> {
    const stored = this.store.getPack(packId, version);
    if (!stored) {
      return { ok: false, packId, version, issues: ['Pack version not found'] };
    }
    const next: KnowledgePack = {
      ...stored.pack,
      lifecycleState: 'published',
      trustLevel:
        stored.pack.trustLevel === 'untrusted' ? 'advisory' : stored.pack.trustLevel,
      publishedAt: new Date().toISOString(),
    };
    const check = validateImport({
      source: 'manual',
      pack: next,
      objects: [...stored.objects.values()],
    });
    if (!check.result.ok) {
      return {
        ok: false,
        packId,
        version,
        issues: check.result.issues.map((i) => i.message),
      };
    }
    this.store.updatePackState(packId, version, next);
    this.cache.invalidatePack(packId);
    await this.emit('KnowledgePublished', { packId, version });
    await this.emit('KnowledgeUpdated', { packId, version, lifecycleState: 'published' });
    return { ok: true, packId, version, issues: [] };
  }

  async deprecatePack(packId: string, version: string): Promise<boolean> {
    const stored = this.store.getPack(packId, version);
    if (!stored) return false;
    this.store.updatePackState(packId, version, {
      ...stored.pack,
      lifecycleState: 'deprecated',
      deprecatedAt: new Date().toISOString(),
    });
    this.cache.invalidatePack(packId);
    await this.emit('KnowledgeDeprecated', { packId, version });
    return true;
  }

  async retirePack(packId: string, version: string): Promise<boolean> {
    const stored = this.store.getPack(packId, version);
    if (!stored) return false;
    this.store.updatePackState(packId, version, {
      ...stored.pack,
      lifecycleState: 'retired',
    });
    this.cache.invalidatePack(packId);
    await this.emit('KnowledgeRetired', { packId, version });
    return true;
  }

  async resolve(request: KnowledgeResolveRequest): Promise<KnowledgeObject | undefined> {
    if (request.packId && request.packVersion) {
      const obj = this.store.getObject(
        request.packId,
        request.packVersion,
        request.objectId,
      );
      if (obj) {
        await this.emit('KnowledgeResolved', {
          objectId: request.objectId,
          packId: request.packId,
          packVersion: request.packVersion,
        });
      }
      return obj;
    }
    for (const stored of this.store.listAllPublished()) {
      const obj = stored.objects.get(request.objectId);
      if (obj) {
        await this.emit('KnowledgeResolved', {
          objectId: request.objectId,
          packId: stored.pack.packId,
          packVersion: stored.pack.version,
        });
        return obj;
      }
    }
    return undefined;
  }

  async search(query: KnowledgeQuery): Promise<readonly KnowledgeSearchHit[]> {
    const enableSemantic = this.config.get<boolean>('enableSemanticSearch', false);
    if (enableSemantic && this.semanticSearch) {
      return this.semanticSearch.search(query);
    }

    const key = searchCacheKey(query);
    const cached = this.cache.getSearch(key);
    if (cached) return cached;

    let searchCorpora;
    if (query.packId && query.packVersion) {
      const exact = this.store.getPack(query.packId, query.packVersion);
      searchCorpora = exact ? [exact] : [];
    } else {
      searchCorpora = this.store.listAllPublished();
    }

    const limit =
      query.limit ?? this.config.get<number>('defaultSearchLimit', 20) ?? 20;
    const hits = searchKnowledge(searchCorpora, { ...query, limit });
    this.cache.setSearch(key, hits, true);
    return hits;
  }

  async aggregate(request: KnowledgeAggregateRequest): Promise<KnowledgePackage> {
    const cacheKey = `pkg:${request.objectIds.map((o) => `${o.packId}@${o.packVersion}:${o.objectId}`).join(',')}`;
    const cached = this.cache.getPackage(cacheKey);
    if (cached) return cached;

    const refs = [];
    const pins = new Map<string, string>();
    let provenanceComplete = true;
    const domains = new Set(request.domainScope ?? []);

    for (const ref of request.objectIds) {
      const stored = this.store.getPack(ref.packId, ref.packVersion);
      if (!stored) {
        provenanceComplete = false;
        continue;
      }
      const err = assertPublishedReadable(stored.pack);
      if (err && stored.pack.lifecycleState !== 'deprecated') {
        provenanceComplete = false;
        continue;
      }
      const obj = stored.objects.get(ref.objectId);
      if (!obj || obj.provenance.length === 0) {
        provenanceComplete = false;
      }
      if (obj) {
        refs.push(ref);
        pins.set(ref.packId, ref.packVersion);
        domains.add(obj.domain);
      }
    }

    const unsupportedMarked = refs.length === 0;
    if (unsupportedMarked) {
      await this.emit('KnowledgeUnsupportedMarked', {
        correlationId: request.correlationId,
      });
    }

    const pkg: KnowledgePackage = {
      packageId: newId('kpkg'),
      correlationId: request.correlationId,
      pinnedPackVersions: [...pins.entries()].map(([packId, version]) => ({
        packId,
        version,
      })),
      objects: refs,
      provenanceComplete: provenanceComplete && refs.length > 0,
      unsupportedMarked,
      assembledAt: new Date().toISOString(),
      domainScope: [...domains],
    };

    this.cache.setPackage(cacheKey, pkg);
    await this.emit('KnowledgePackageAssembled', {
      packageId: pkg.packageId,
      correlationId: request.correlationId,
      objectCount: refs.length,
      unsupportedMarked,
    });
    return pkg;
  }

  async retrieveForContext(query: KnowledgeQuery): Promise<KnowledgePackage> {
    const hits = await this.search(query);
    if (hits.length === 0) {
      return this.aggregate({
        correlationId: query.correlationId,
        objectIds: [],
        domainScope: query.domains ?? (query.domain ? [query.domain] : []),
      });
    }
    return this.aggregate({
      correlationId: query.correlationId,
      objectIds: hits.map((h) => ({
        objectId: h.object.objectId,
        packId: h.packId,
        packVersion: h.packVersion,
      })),
      domainScope: query.domains ?? (query.domain ? [query.domain] : undefined),
    });
  }

  provenanceOf(
    packId: string,
    version: string,
    objectId: string,
  ): readonly ProvenanceRecord[] {
    return this.store.getObject(packId, version, objectId)?.provenance ?? [];
  }

  cacheStats() {
    return this.cache.stats();
  }

  invalidateCache(packId?: string): number {
    const n = packId ? this.cache.invalidatePack(packId) : this.cache.invalidate();
    void this.emit('KnowledgeCacheInvalidated', { packId, count: n });
    return n;
  }

  async recommend(query: KnowledgeQuery): Promise<readonly KnowledgeSearchHit[]> {
    return this.search({
      ...query,
      trustLevels: query.trustLevels ?? ['advisory', 'authoritative'],
    });
  }

  private async emit(
    type: KnowledgeEngineEventType,
    payload: Record<string, unknown>,
  ): Promise<void> {
    if (!this.eventBus) return;
    await this.eventBus.publishAsync({
      eventType: type,
      category: 'engine',
      source: 'engine:knowledge',
      payload,
      correlationId:
        (payload.correlationId as string | undefined) ??
        this.kernelContext?.correlationId ??
        newId('corr'),
      executionContext: {
        kernelId: this.kernelContext?.kernelId,
        engineId: this.metadata.id,
      },
      metadata: { engineId: this.metadata.id },
    });
  }
}

export function createKnowledgeEngine(
  options?: KnowledgeEngineOptions,
): KnowledgeEngine {
  return new KnowledgeEngine(options);
}
