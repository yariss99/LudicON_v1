import type { KnowledgeObject, KnowledgePack } from '@prima/contracts';

export interface StoredPackVersion {
  readonly pack: KnowledgePack;
  readonly objects: Map<string, KnowledgeObject>;
}

/** In-memory durable store — replaceable by infrastructure adapter later. */
export class InMemoryKnowledgeStore {
  /** packId -> version -> StoredPackVersion */
  private readonly packs = new Map<string, Map<string, StoredPackVersion>>();

  upsert(pack: KnowledgePack, objects: readonly KnowledgeObject[]): void {
    let versions = this.packs.get(pack.packId);
    if (!versions) {
      versions = new Map();
      this.packs.set(pack.packId, versions);
    }
    const objectMap = new Map<string, KnowledgeObject>();
    for (const obj of objects) {
      objectMap.set(obj.objectId, obj);
    }
    versions.set(pack.version, { pack, objects: objectMap });
  }

  getPack(packId: string, version: string): StoredPackVersion | undefined {
    return this.packs.get(packId)?.get(version);
  }

  listPackVersions(packId: string): KnowledgePack[] {
    const versions = this.packs.get(packId);
    if (!versions) return [];
    return [...versions.values()].map((v) => v.pack);
  }

  listAllPublished(): StoredPackVersion[] {
    const result: StoredPackVersion[] = [];
    for (const versions of this.packs.values()) {
      for (const stored of versions.values()) {
        if (stored.pack.lifecycleState === 'published') {
          result.push(stored);
        }
      }
    }
    return result;
  }

  getObject(
    packId: string,
    version: string,
    objectId: string,
  ): KnowledgeObject | undefined {
    return this.packs.get(packId)?.get(version)?.objects.get(objectId);
  }

  updatePackState(
    packId: string,
    version: string,
    next: KnowledgePack,
  ): boolean {
    const stored = this.getPack(packId, version);
    if (!stored) return false;
    this.packs.get(packId)!.set(version, {
      pack: next,
      objects: stored.objects,
    });
    return true;
  }
}
