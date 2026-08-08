import type { z } from "zod";

/**
 * The seam.
 *
 * Everything above this interface (repositories, TanStack Query, the UI) is
 * written once and never learns where data lives. Everything below it is
 * swappable: today `LocalStorageProvider`, tomorrow `HttpProvider` against the
 * Hono API, with no change above the line.
 *
 * The pre-refactor tree had no seam at all — 31 files hand-rolled five
 * different localStorage idioms across 48 key strings, so swapping the backend
 * meant editing every one of them.
 *
 * The interface is async even though localStorage is synchronous. That is
 * deliberate: making the sync case pretend to be async is trivial, whereas
 * retrofitting async onto a synchronous API surface means rewriting every
 * caller. The old code was 100% synchronous (exactly one async signature in
 * 26 repository files) and that is precisely why it could not accept a server.
 */
export interface DataProvider {
  /** Fetch one record. Resolves `null` when absent — never throws for "missing". */
  get<T>(
    collection: string,
    id: string,
    schema: z.ZodType<T>,
  ): Promise<T | null>;

  /** Fetch a whole collection, optionally filtered by an indexed field. */
  list<T>(
    collection: string,
    schema: z.ZodType<T>,
    query?: ListQuery,
  ): Promise<T[]>;

  /** Insert or replace. Returns the persisted record. */
  put<T>(
    collection: string,
    id: string,
    value: T,
    schema: z.ZodType<T>,
  ): Promise<T>;

  /** Remove a record. Succeeds even when the record is already gone. */
  remove(collection: string, id: string): Promise<void>;

  /**
   * Run several writes as one unit.
   *
   * localStorage cannot truly roll back, so the local implementation
   * snapshots and restores on failure — good enough to prevent half-applied
   * multi-record writes, which the old read-modify-write code could not do at
   * all. The HTTP implementation maps this to a server transaction.
   */
  transact<T>(work: (tx: DataProvider) => Promise<T>): Promise<T>;
}

export type ListQuery = {
  /** Equality filters applied to top-level fields. */
  where?: Readonly<Record<string, string | number | boolean | null>>;
  /** Field to sort by, plus direction. */
  orderBy?: { field: string; direction: "asc" | "desc" };
  limit?: number;
  offset?: number;
};

/** Raised when persisted data fails schema validation on read. */
export class DataIntegrityError extends Error {
  constructor(
    readonly collection: string,
    readonly id: string,
    readonly issues: unknown,
  ) {
    super(`Stored record ${collection}/${id} does not match its schema`);
    this.name = "DataIntegrityError";
  }
}

/** Raised when the storage backend refuses a write (quota, network, permission). */
export class DataWriteError extends Error {
  constructor(
    readonly collection: string,
    override readonly cause: unknown,
  ) {
    super(`Could not write to ${collection}`);
    this.name = "DataWriteError";
  }
}
