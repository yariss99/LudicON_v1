import { z } from "zod";
import {
  API_PREFIX,
  surfaceFor,
  toApiSort,
  UnsupportedOperationError,
  type CollectionSurface,
} from "./api-surface.js";
import {
  DataIntegrityError,
  DataWriteError,
  type DataProvider,
  type ListQuery,
} from "./provider.js";

export type HttpProviderConfig = {
  /** Origin only — the `/api/v1` prefix is this provider's business, not the caller's. */
  baseUrl: string;
  /** Supplies the bearer token. Async because Clerk mints tokens on demand. */
  getToken: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
};

/**
 * API-backed provider.
 *
 * The other half of the seam — but only for what `apps/api` genuinely serves,
 * which `api-surface.ts` states and this class obeys. The previous version made
 * the seam's promise ("swapping this in changes nothing above the interface")
 * without keeping it: it addressed paths the server does not mount, wrote with
 * a verb the server does not register, and parsed a body shape the server never
 * sends. Every one of those failed at runtime, on the first call, in a way that
 * looked like a network problem.
 *
 * Three rules follow from that and are worth stating because they are what make
 * the difference between a seam and a claim:
 *
 *  - the API's shape is DATA, not control flow woven through the methods below;
 *  - anything the API cannot do raises `UnsupportedOperationError` BEFORE the
 *    request, naming the missing server slice — no operation degrades quietly;
 *  - responses are unwrapped from `{ok, data}` and then validated with the same
 *    schemas used locally, so the server cannot hand the UI a shape it does not
 *    expect and cannot have its envelope mistaken for the entity.
 */
export class HttpProvider implements DataProvider {
  readonly #config: HttpProviderConfig;
  readonly #fetch: typeof fetch;

  constructor(config: HttpProviderConfig) {
    this.#config = config;
    this.#fetch = config.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  async #request(path: string, init?: RequestInit): Promise<Response> {
    const token = await this.#config.getToken();
    const headers = new Headers(init?.headers);
    headers.set("content-type", "application/json");
    if (token) headers.set("authorization", `Bearer ${token}`);

    return this.#fetch(`${this.#config.baseUrl}${API_PREFIX}${path}`, {
      ...init,
      headers,
    });
  }

  async get<T>(
    collection: string,
    id: string,
    schema: z.ZodType<T>,
  ): Promise<T | null> {
    const surface = surfaceFor(collection, "get");
    const response = await this.#request(
      `/${surface.path}/${encodeURIComponent(id)}`,
    );
    if (response.status === 404) return null;

    const data = await unwrap(response, collection);
    return parseOrThrow(collection, id, schema, pluck(data, surface.detailKey));
  }

  /**
   * Fetches the WHOLE collection, following the server's cursor.
   *
   * `DataProvider.list` says "fetch a whole collection", and the previous
   * version issued one request and returned whatever came back — which, against
   * a cursor-paginated API whose default page is 25, is the first 25 records
   * silently presented as all of them. `listAll()` on a teacher with 30 papers
   * would have lost five of them with no error anywhere, and a short list is
   * indistinguishable from a complete one by inspection. That is the single
   * worst failure this file can have, so the walk is not an optimisation.
   *
   * A `query.limit` turns the walk off: the caller asked for at most N, the
   * server caps the page at N, so the first response already IS the answer.
   */
  async list<T>(
    collection: string,
    schema: z.ZodType<T>,
    query?: ListQuery,
  ): Promise<T[]> {
    const surface = surfaceFor(collection, "list");
    const base = toApiQuery(collection, surface, query);
    const bounded = query?.limit !== undefined;

    const items: T[] = [];
    let cursor: string | null = null;

    for (let page = 0; page < MAX_LIST_PAGES; page += 1) {
      const response = await this.#request(
        `/${surface.path}${withPaging(base, bounded ? null : MAX_PAGE_SIZE, cursor)}`,
      );
      const data = await unwrap(response, collection);
      items.push(
        ...parseOrThrow(collection, "*", schema.array(), pluck(data, "items")),
      );

      if (bounded) return items;
      cursor = nextCursorOf(collection, data);
      if (cursor === null) return items;
    }

    // A server that never stops handing out cursors would otherwise spin here
    // forever. Refusing names the problem; returning `items` would report a
    // truncated collection as a complete one, which is what this method exists
    // to stop doing.
    throw new UnsupportedOperationError(
      collection,
      "list",
      `apps/api kept offering another page of "${collection}" after ` +
        `${MAX_LIST_PAGES * MAX_PAGE_SIZE} records. Fetching a whole collection is not a ` +
        `workable way to read this many — the caller needs a filter or an explicit limit.`,
    );
  }

  /**
   * Insert or replace the whole record at the id the caller chose.
   *
   * This used to throw unconditionally, and the reasoning was sound at the time:
   * the API offered `POST /` with a server-assigned id and `PATCH /:id` with a
   * partial body, and emulating a replace out of those is two round trips
   * wrapped around a race that quietly turns a replace into a merge.
   *
   * What changed is the server, not the argument. `evaluation-projects` now
   * registers a genuine idempotent `PUT /:id`, because that collection's ids are
   * minted in the browser and its edits produce whole documents — so the seam's
   * operation and the endpoint's semantics are the same operation, with no
   * emulation in between. Every other collection still refuses, and
   * `api-surface.ts` is where that is decided rather than here.
   */
  async put<T>(
    collection: string,
    id: string,
    value: T,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const surface = surfaceFor(collection, "put");
    const response = await this.#request(
      `/${surface.path}/${encodeURIComponent(id)}`,
      { method: "PUT", body: JSON.stringify(value) },
    );

    // 201 on the write that created the record, 200 on every replace after it.
    // Both are successes, and the body is identical, so the status is not read.
    const data = await unwrap(response, collection);
    return parseOrThrow(collection, id, schema, pluck(data, surface.detailKey));
  }

  async remove(collection: string, id: string): Promise<void> {
    const surface = surfaceFor(collection, "remove");
    const response = await this.#request(
      `/${surface.path}/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    // 404 on delete is success — the record is gone either way. Reachable only
    // because `surfaceFor` has already established the route exists; it used to
    // also mask every request aimed at a route that does not.
    if (!response.ok && response.status !== 404) {
      throw new DataWriteError(collection, await safeBody(response));
    }
  }

  /**
   * NOT atomic, and it must not claim to be.
   *
   * This used to say the guarantee "moves to the API". It does not: there is no
   * batch endpoint, no `/transaction`, nothing — the work simply runs as a
   * sequence of ordinary requests, and a failure halfway leaves the earlier ones
   * applied. Every caller of `transact` is therefore a caller that would need a
   * server-side unit of work, which is a useful thing to be able to enumerate
   * and impossible if this pretends.
   */
  transact<T>(work: (tx: DataProvider) => Promise<T>): Promise<T> {
    return work(this);
  }
}

/**
 * The server's own page ceiling — `PageQuery.limit` in `@ludicon/contracts` caps
 * at 100. Asking for exactly that minimises round trips on an unbounded walk;
 * asking for more would be silently clamped, which is a slower walk that looks
 * like a faster one.
 */
const MAX_PAGE_SIZE = 100;

/**
 * How many pages an unbounded walk will follow before refusing.
 *
 * A bound rather than a `while (cursor)` because the loop's exit condition comes
 * from the server, and a server that always answers with a cursor would hang the
 * tab. Ten thousand records is far past the point where "fetch the whole
 * collection" was the right call anyway, so hitting this is a design signal, not
 * a limit to raise.
 */
const MAX_LIST_PAGES = 100;

/**
 * The success envelope. `{ok: true, data}` on every handler, `{ok: false,
 * error}` on every failure, with the status carrying the same information.
 */
const Envelope = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), data: z.unknown() }),
  z.object({
    ok: z.literal(false),
    error: z.object({ code: z.string(), message: z.string() }).loose(),
  }),
]);

/**
 * Strips the envelope, or turns a failure into a `DataWriteError`.
 *
 * Validating the envelope rather than trusting `response.ok` is what makes a
 * proxy's HTML error page a clear integrity failure instead of a Zod error
 * about a missing `title` field three frames away.
 */
async function unwrap(
  response: Response,
  collection: string,
): Promise<unknown> {
  const body: unknown = await response.json().catch(() => null);
  const envelope = Envelope.safeParse(body);

  if (!envelope.success) {
    throw new DataIntegrityError(collection, "*", {
      status: response.status,
      reason: "response is not an {ok, data} envelope",
    });
  }
  if (!envelope.data.ok) {
    throw new DataWriteError(collection, envelope.data.error);
  }
  return envelope.data.data;
}

/** `{ok, data: {project}}` and `{ok, data: {items}}` — never the bare entity. */
function pluck(data: unknown, key: string): unknown {
  return typeof data === "object" && data !== null && key in data
    ? (data as Record<string, unknown>)[key]
    : undefined;
}

const PageShape = z.object({ nextCursor: z.string().min(1).nullable() });

/**
 * The cursor for the next page, or `null` when this was the last one.
 *
 * A page body without a `nextCursor` is an integrity failure rather than "assume
 * there is no more": the field is what tells the walk whether it has everything,
 * so defaulting it to `null` would turn an unrecognised response into a
 * confidently truncated list — the exact bug `list` was rewritten to prevent.
 */
function nextCursorOf(collection: string, data: unknown): string | null {
  const parsed = PageShape.safeParse(data);
  if (!parsed.success) {
    throw new DataIntegrityError(collection, "*", {
      reason:
        "list response carried no nextCursor, so completeness is unknowable",
      issues: parsed.error.issues,
    });
  }
  return parsed.data.nextCursor;
}

/**
 * Adds the page size and cursor to an already-built query string.
 *
 * Appended here rather than inside `toApiQuery` because they are not part of the
 * caller's `ListQuery` — they belong to the walk, and change on every iteration
 * while the filters do not.
 */
function withPaging(
  base: string,
  pageSize: number | null,
  cursor: string | null,
): string {
  const extra = new URLSearchParams();
  if (pageSize !== null) extra.set("limit", String(pageSize));
  if (cursor !== null) extra.set("cursor", cursor);

  const encoded = extra.toString();
  if (encoded === "") return base;
  return base === "" ? `?${encoded}` : `${base}&${encoded}`;
}

function parseOrThrow<T>(
  collection: string,
  id: string,
  schema: z.ZodType<T>,
  value: unknown,
): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new DataIntegrityError(collection, id, result.error.issues);
  }
  return result.data;
}

/**
 * `ListQuery` in the API's own vocabulary, or an error.
 *
 * The two are not the same language and the gaps are refused rather than
 * dropped: `offset` has no cursor-based equivalent, an ordering outside
 * `recent|created|title` cannot be expressed, and a `where` key the endpoint
 * does not declare would be stripped server-side and return an unfiltered list
 * that looks right. All three used to happen silently.
 */
function toApiQuery(
  collection: string,
  surface: CollectionSurface,
  query?: ListQuery,
): string {
  if (!query) return "";
  const params = new URLSearchParams();

  for (const [field, value] of Object.entries(query.where ?? {})) {
    if (!surface.filters.includes(field)) {
      throw new UnsupportedOperationError(
        collection,
        "list",
        `apps/api does not filter "${collection}" by "${field}". It accepts ` +
          `${surface.filters.join(", ") || "no filters"}.`,
      );
    }
    if (value !== null) params.set(field, String(value));
  }

  if (query.orderBy) {
    const sort = toApiSort(query.orderBy.field, query.orderBy.direction);
    if (sort === null) {
      throw new UnsupportedOperationError(
        collection,
        "list",
        `apps/api sorts by recent|created|title, not ` +
          `"${query.orderBy.field} ${query.orderBy.direction}".`,
      );
    }
    params.set("sort", sort);
  }

  if (query.offset !== undefined && query.offset !== 0) {
    throw new UnsupportedOperationError(
      collection,
      "list",
      `apps/api paginates by cursor, not offset. ListQuery.offset cannot be honoured.`,
    );
  }
  if (query.limit !== undefined) params.set("limit", String(query.limit));

  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

async function safeBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return { status: response.status, statusText: response.statusText };
  }
}
