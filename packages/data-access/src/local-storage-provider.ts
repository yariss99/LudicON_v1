import type { z } from "zod";
import { MIGRATIONS, type StoredEnvelope } from "./migrations.js";
import {
  DataIntegrityError,
  DataWriteError,
  type DataProvider,
  type ListQuery,
} from "./provider.js";

/**
 * Bumped when the on-disk shape changes. Migrations run on read.
 *
 * v3 is a deliberate discontinuity, not a shape change. The product's definition
 * of a Project was replaced — it is now an A4 evaluation document rather than a
 * container for lesson-planning artefacts — and there is no honest mapping from
 * the old records to the new ones: a lesson plan is not a page, and a worksheet
 * exercise is not an exercise block. Migrating would have produced plausible-
 * looking empty documents, which is worse than nothing.
 *
 * So no step is registered from 2. `migrate()` below then does what it already
 * did for an unreachable version — returns an empty envelope — and the stale
 * key is deleted. The old work is gone from disk, not merely orphaned at an
 * address nobody visits. That is the owner's explicit choice, made knowing it
 * is irreversible; be certain before bumping this again for the same reason.
 *
 * The discard is EAGER, and it has to be. It used to happen lazily, in `#read`,
 * which meant a collection was only discarded if something still read it. After
 * the rewrite nothing reads `lesson-plans`, `documents`, `document-versions` or
 * `collections` from the browser at all, so `ludicon.lesson-plans.v2` sat on
 * disk for the life of the profile while the claim "old data is discarded" was
 * being made about it. `#sweep` below walks the whole `ludicon.*` keyspace once
 * per provider, so the claim is true of every collection, including the ones
 * this build has forgotten exist.
 */
const SCHEMA_VERSION = 3;
const KEY_PREFIX = "ludicon";

const collectionKey = (collection: string, version: number): string =>
  `${KEY_PREFIX}.${collection}.v${version}`;

/** `ludicon.<collection>.v<n>` — the collection may itself contain dots. */
const KEY_PATTERN = new RegExp(`^${KEY_PREFIX}\\.(.+)\\.v(\\d+)$`);

type StaleKey = {
  readonly key: string;
  readonly collection: string;
  readonly version: number;
};

const parseKey = (key: string): StaleKey | null => {
  const match = KEY_PATTERN.exec(key);
  if (match === null) return null;

  const [, collection, version] = match;
  if (collection === undefined || version === undefined) return null;

  const parsed = Number.parseInt(version, 10);
  return Number.isNaN(parsed) ? null : { key, collection, version: parsed };
};

const emptyEnvelope = (): StoredEnvelope => ({
  version: SCHEMA_VERSION,
  records: {},
});

/**
 * Walks a stored envelope forward to the current version.
 *
 * A gap in the registry means there is no honest way to read the data, so it is
 * discarded rather than handed back as a well-typed lie. Every version this
 * product has shipped has a step, so that branch is a guard, not a plan.
 */
function migrate(collection: string, envelope: StoredEnvelope): StoredEnvelope {
  let current = envelope;
  while (current.version < SCHEMA_VERSION) {
    const step = MIGRATIONS[current.version];
    if (step === undefined) return emptyEnvelope();
    current = {
      version: current.version + 1,
      records: step(collection, current.records),
    };
  }
  return current;
}

function parseEnvelope(raw: string): StoredEnvelope | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      !("records" in parsed)
    ) {
      return null;
    }
    const { version, records } = parsed as {
      version: unknown;
      records: unknown;
    };
    if (typeof version !== "number" || typeof records !== "object") return null;
    if (records === null || Array.isArray(records)) return null;
    return { version, records: { ...(records as Record<string, unknown>) } };
  } catch {
    // Corrupt JSON. Returning nothing is safer than throwing into a render.
    return null;
  }
}

function isStorageAvailable(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

/**
 * localStorage-backed provider.
 *
 * Every read is validated against the caller's Zod schema. That is the whole
 * point: the old code did `JSON.parse(raw) as T` in seventeen places, which is
 * an unchecked cast wearing a concrete type name, and it meant any corrupt or
 * stale record propagated into React as a well-typed lie.
 */
export class LocalStorageProvider implements DataProvider {
  /** In-memory fallback so the app still works with storage disabled. */
  readonly #memory = new Map<string, StoredEnvelope>();

  constructor() {
    this.#sweep();
  }

  /**
   * Retires every key an older build left behind, once, at construction.
   *
   * The alternative — carrying forward only the collection being read, which is
   * what this class did before — is correct exactly as long as every collection
   * still has a reader. That stopped being true when the studio was rewritten,
   * and the failure is silent: the data is neither read nor discarded, just
   * resident. Sweeping the keyspace instead of a list of collection names is
   * what makes this survive the next rewrite too, because it does not depend on
   * the current build remembering which collections used to exist.
   *
   * Nothing here may throw. This class is constructed at module scope in the web
   * app, so an exception is a blank page rather than a failed sweep, and a
   * profile with an unreadable key is not a reason to refuse to boot. A key that
   * cannot be carried forward is simply left where it is and retried next load.
   */
  #sweep(): void {
    if (!isStorageAvailable()) return;

    try {
      // Collected before mutating: `localStorage.key(i)` is index-based and
      // removing during the walk renumbers everything after the removal.
      const stale: StaleKey[] = [];
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        const parsed = key === null ? null : parseKey(key);
        if (parsed !== null && parsed.version < SCHEMA_VERSION) {
          stale.push(parsed);
        }
      }

      for (const entry of stale) this.#carryForward(entry);
    } catch {
      // Quota, a locked profile, or a key that vanished mid-walk. All three are
      // the storage layer's business and none is worth a broken boot.
    }
  }

  /**
   * Migrates one stale key to the current version and deletes it.
   *
   * The forward write happens only when something survived the migration. A
   * discontinuity like 2 -> 3 yields no records, and writing an empty envelope
   * for a collection nothing reads would replace one piece of dead storage with
   * another — the read path already treats a missing key and an empty envelope
   * identically.
   *
   * The removal is last on purpose: if `#write` throws on quota, the old key is
   * still there and the next load tries again, rather than the data being gone
   * with nothing written in its place.
   */
  #carryForward(stale: StaleKey): StoredEnvelope {
    const raw = localStorage.getItem(stale.key);
    if (raw === null) return emptyEnvelope();

    const stored = parseEnvelope(raw);
    const migrated =
      stored === null
        ? emptyEnvelope()
        : migrate(stale.collection, { ...stored, version: stale.version });

    if (Object.keys(migrated.records).length > 0) {
      this.#write(stale.collection, migrated);
    }
    localStorage.removeItem(stale.key);

    return migrated;
  }

  #read(collection: string): StoredEnvelope {
    const key = collectionKey(collection, SCHEMA_VERSION);

    if (!isStorageAvailable()) {
      return this.#memory.get(key) ?? emptyEnvelope();
    }

    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const envelope = parseEnvelope(raw);
      if (envelope === null) return emptyEnvelope();
      return envelope.version === SCHEMA_VERSION
        ? envelope
        : migrate(collection, envelope);
    }

    return this.#adopt(collection);
  }

  /**
   * Brings work written by an earlier version forward, on read.
   *
   * `#sweep` has already done this for everything present at construction, so
   * this path only catches a key written since — by a second tab still running
   * the previous build, which is the one case a constructor-time sweep cannot
   * see. Keeping it costs one `getItem` per cold collection read and removes the
   * window in which that tab's last save would be silently ignored.
   */
  #adopt(collection: string): StoredEnvelope {
    for (let version = SCHEMA_VERSION - 1; version >= 1; version -= 1) {
      const key = collectionKey(collection, version);
      if (localStorage.getItem(key) === null) continue;
      return this.#carryForward({ key, collection, version });
    }
    return emptyEnvelope();
  }

  #write(collection: string, envelope: StoredEnvelope): void {
    const key = collectionKey(collection, SCHEMA_VERSION);
    this.#memory.set(key, envelope);

    if (!isStorageAvailable()) return;

    try {
      localStorage.setItem(key, JSON.stringify(envelope));
    } catch (cause) {
      // Quota exceeded is the realistic failure. The old code left 13 of its
      // writes outside try/catch, so this threw straight into event handlers.
      throw new DataWriteError(collection, cause);
    }
  }

  #validate<T>(
    collection: string,
    id: string,
    value: unknown,
    schema: z.ZodType<T>,
  ): T {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new DataIntegrityError(collection, id, result.error.issues);
    }
    return result.data;
  }

  get<T>(
    collection: string,
    id: string,
    schema: z.ZodType<T>,
  ): Promise<T | null> {
    const envelope = this.#read(collection);
    const raw = envelope.records[id];
    if (raw === undefined) return Promise.resolve(null);
    return Promise.resolve(this.#validate(collection, id, raw, schema));
  }

  list<T>(
    collection: string,
    schema: z.ZodType<T>,
    query?: ListQuery,
  ): Promise<T[]> {
    const envelope = this.#read(collection);

    // Drop records that no longer match the schema rather than surfacing them.
    // A stale record is a bug, but crashing the list is worse than omitting it.
    const records: T[] = [];
    for (const [id, raw] of Object.entries(envelope.records)) {
      const result = schema.safeParse(raw);
      if (result.success) records.push(result.data);
      else if (import.meta.env?.DEV) {
        console.warn(
          `[data-access] dropped invalid ${collection}/${id}`,
          result.error.issues,
        );
      }
    }

    return Promise.resolve(applyQuery(records, query));
  }

  put<T>(
    collection: string,
    id: string,
    value: T,
    schema: z.ZodType<T>,
  ): Promise<T> {
    // Validate on the way in too, so bad data never reaches storage.
    const validated = this.#validate(collection, id, value, schema);
    const envelope = this.#read(collection);
    this.#write(collection, {
      version: SCHEMA_VERSION,
      records: { ...envelope.records, [id]: validated },
    });
    return Promise.resolve(validated);
  }

  remove(collection: string, id: string): Promise<void> {
    const envelope = this.#read(collection);
    if (!(id in envelope.records)) return Promise.resolve();
    const { [id]: _removed, ...rest } = envelope.records;
    this.#write(collection, { version: SCHEMA_VERSION, records: rest });
    return Promise.resolve();
  }

  /**
   * Snapshot-and-restore pseudo-transaction.
   *
   * localStorage has no real transactions. Snapshotting every touched
   * collection and restoring on failure prevents half-applied multi-record
   * writes, which is the failure the old read-modify-write code hit whenever
   * a second write threw.
   */
  async transact<T>(work: (tx: DataProvider) => Promise<T>): Promise<T> {
    const snapshot = new Map<string, string | null>();

    if (isStorageAvailable()) {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key?.startsWith(`${KEY_PREFIX}.`)) {
          snapshot.set(key, localStorage.getItem(key));
        }
      }
    }

    try {
      return await work(this);
    } catch (error) {
      if (isStorageAvailable()) {
        for (const [key, value] of snapshot) {
          if (value === null) localStorage.removeItem(key);
          else localStorage.setItem(key, value);
        }
      }
      this.#memory.clear();
      throw error;
    }
  }
}

function applyQuery<T>(records: T[], query?: ListQuery): T[] {
  if (!query) return records;

  let result = records;

  if (query.where) {
    const entries = Object.entries(query.where);
    result = result.filter((record) =>
      entries.every(
        ([field, expected]) =>
          (record as Record<string, unknown>)[field] === expected,
      ),
    );
  }

  if (query.orderBy) {
    const { field, direction } = query.orderBy;
    const sign = direction === "asc" ? 1 : -1;
    result = [...result].sort((a, b) => {
      const left = (a as Record<string, unknown>)[field];
      const right = (b as Record<string, unknown>)[field];
      if (left === right) return 0;
      if (left === undefined || left === null) return 1;
      if (right === undefined || right === null) return -1;
      return left < right ? -sign : sign;
    });
  }

  const offset = query.offset ?? 0;
  const end = query.limit === undefined ? undefined : offset + query.limit;
  return offset === 0 && end === undefined ? result : result.slice(offset, end);
}
