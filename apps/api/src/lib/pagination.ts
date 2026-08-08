/**
 * Opaque cursors.
 *
 * A cursor carries the sort key of the last row on the page plus its id, which
 * is what makes paging stable while rows are being created underneath the
 * reader. It is base64url JSON rather than an encrypted token: it exposes
 * nothing a caller cannot already see in the page it just received, and a
 * tampered cursor simply fails to decode.
 */
import { z } from "zod";

const CursorPayload = z.object({
  /** The sort key of the last row: an ISO instant, or a title. */
  k: z.string().min(1).max(400),
  /** Tie-breaker, so equal sort keys still produce a total order. */
  id: z.string().min(1).max(128),
});

export type Cursor = z.infer<typeof CursorPayload>;

export const encodeCursor = (cursor: Cursor): string =>
  Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");

/** Returns `null` for anything that is not a cursor this API produced. */
export const decodeCursor = (raw: string | undefined): Cursor | null => {
  if (raw === undefined) {
    return null;
  }
  let candidate: unknown;
  try {
    candidate = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const parsed = CursorPayload.safeParse(candidate);
  return parsed.success ? parsed.data : null;
};

/**
 * Splits an over-fetched result into the page and its successor cursor.
 *
 * Repositories ask for `limit + 1` rows; the extra row is never returned, it
 * only answers "is there more?" without a second count query.
 */
export const takePage = <TRow>(
  rows: TRow[],
  limit: number,
  toCursor: (row: TRow) => Cursor,
): { items: TRow[]; nextCursor: string | null } => {
  if (rows.length <= limit) {
    return { items: rows, nextCursor: null };
  }
  const items = rows.slice(0, limit);
  const last = items.at(-1);
  return {
    items,
    nextCursor: last === undefined ? null : encodeCursor(toCursor(last)),
  };
};

/**
 * Escapes the LIKE metacharacters in a user-supplied search term.
 *
 * Without this, a teacher searching for "100%" would match every row. This is
 * not an injection defence — Drizzle parameterises the pattern — it is a
 * correctness one.
 */
export const escapeLikePattern = (term: string): string =>
  term.replace(/[\\%_]/gu, (character) => `\\${character}`);
