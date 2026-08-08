import type { z } from "zod";
import type { DataProvider, ListQuery } from "./provider.js";

/**
 * Generic document repository.
 *
 * Replaces thirteen hand-written repositories that shared a byte-identical
 * `load<T>`/`save<T>` pair (ten-plus copies across the pre-refactor tree) and
 * re-implemented the same eleven methods — create, save, getById,
 * listByProject, duplicate, archive, publish, setValidation, listVersions,
 * getVersion, restoreVersion — once per asset type.
 *
 * One implementation, configured per collection.
 */
export type RepositoryConfig<T> = {
  /** Storage collection name, e.g. "projects". */
  collection: string;
  /** Schema used to validate every read and write. */
  schema: z.ZodType<T>;
  /** Extracts the primary key from a record. */
  getId: (record: T) => string;
};

export type Repository<T> = {
  get(id: string): Promise<T | null>;
  list(query?: ListQuery): Promise<T[]>;
  save(record: T): Promise<T>;
  remove(id: string): Promise<void>;
  /** Read-modify-write against the validated current value. */
  patch(id: string, patch: (current: T) => T): Promise<T>;
};

export function createRepository<T>(
  provider: DataProvider,
  config: RepositoryConfig<T>,
): Repository<T> {
  const { collection, schema, getId } = config;

  return {
    get: (id) => provider.get(collection, id, schema),

    list: (query) => provider.list(collection, schema, query),

    save: (record) => provider.put(collection, getId(record), record, schema),

    remove: (id) => provider.remove(collection, id),

    async patch(id, patch) {
      return provider.transact(async (tx) => {
        const current = await tx.get(collection, id, schema);
        if (current === null) {
          throw new Error(`${collection}/${id} not found`);
        }
        const next = patch(current);
        return tx.put(collection, id, next, schema);
      });
    },
  };
}

/**
 * Version-history repository.
 *
 * The old code kept full document snapshots in per-feature version tables
 * capped inconsistently at 3000 / 5000 / 500 entries, and nothing ever pruned
 * the primary tables. `maxVersions` makes the retention policy explicit and
 * uniform.
 */
export type VersionedRepositoryConfig<TDoc, TVersion> =
  RepositoryConfig<TDoc> & {
    versionCollection: string;
    versionSchema: z.ZodType<TVersion>;
    getVersionId: (version: TVersion) => string;
    buildVersion: (document: TDoc, note?: string) => TVersion;
    maxVersions: number;
  };

export type VersionedRepository<TDoc, TVersion> = Repository<TDoc> & {
  /** Persist the document and append a version snapshot atomically. */
  saveWithVersion(document: TDoc, note?: string): Promise<TDoc>;
  listVersions(documentId: string): Promise<TVersion[]>;
};

export function createVersionedRepository<TDoc, TVersion>(
  provider: DataProvider,
  config: VersionedRepositoryConfig<TDoc, TVersion>,
): VersionedRepository<TDoc, TVersion> {
  const base = createRepository(provider, config);

  return {
    ...base,

    async saveWithVersion(document, note) {
      return provider.transact(async (tx) => {
        const saved = await tx.put(
          config.collection,
          config.getId(document),
          document,
          config.schema,
        );

        const version = config.buildVersion(saved, note);
        await tx.put(
          config.versionCollection,
          config.getVersionId(version),
          version,
          config.versionSchema,
        );

        await pruneVersions(tx, config, config.getId(saved));
        return saved;
      });
    },

    listVersions: (documentId) =>
      provider.list(config.versionCollection, config.versionSchema, {
        where: { documentId },
        orderBy: { field: "version", direction: "desc" },
      }),
  };
}

async function pruneVersions<TDoc, TVersion>(
  tx: DataProvider,
  config: VersionedRepositoryConfig<TDoc, TVersion>,
  documentId: string,
): Promise<void> {
  const versions = await tx.list(
    config.versionCollection,
    config.versionSchema,
    {
      where: { documentId },
      orderBy: { field: "version", direction: "desc" },
    },
  );

  for (const stale of versions.slice(config.maxVersions)) {
    await tx.remove(config.versionCollection, config.getVersionId(stale));
  }
}
