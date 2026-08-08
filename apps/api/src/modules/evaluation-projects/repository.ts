/**
 * Drizzle queries for evaluation papers. Rows in, rows out — no business rules,
 * no HTTP, no domain mapping.
 *
 * The one query worth arguing about is `upsertEvaluationProject`, which carries
 * its ownership guard IN THE STATEMENT rather than leaving it to the caller. A
 * plain `ON CONFLICT DO UPDATE` on a client-chosen id is an account takeover
 * primitive: guess a paper's id, PUT to it, own it. The service does load and
 * check first — see `service.ts` — but a check that lives only in the caller is
 * one refactor away from being skipped, and it cannot cover the row that appears
 * between the read and the write. `setWhere` closes both.
 *
 * The rejected alternative was `SELECT … FOR UPDATE` before the write. It needs
 * the row to exist to lock anything, so it protects the update path and not the
 * insert path — which is the path a takeover would use.
 */
import type { Discipline, GradeLevel } from "@ludicon/domain";
import { and, asc, count, desc, eq, gt, lt, or, type SQL } from "drizzle-orm";

import type { Executor } from "../../db/client.js";
import {
  evaluationProjects,
  type EvaluationProjectInsert,
  type EvaluationProjectRow,
} from "../../db/schema.js";
import type { Cursor } from "../../lib/pagination.js";

export type EvaluationProjectSort = "recent" | "created" | "title";

export type EvaluationProjectFilters = {
  /** Always the session's teacher. Never widened by a query parameter. */
  ownerId: string;
  discipline?: Discipline | undefined;
  grade?: GradeLevel | undefined;
  /** `undefined` means "both" — the archive view needs to be reachable. */
  archived?: boolean | undefined;
};

export type ListEvaluationProjectsInput = EvaluationProjectFilters & {
  sort: EvaluationProjectSort;
  /** Callers pass `limit + 1`; the extra row answers "is there a next page?". */
  limit: number;
  cursor: Cursor | null;
};

/**
 * Ownership is a filter, not an afterthought: every list is scoped to the
 * caller, so a missing authorization check cannot leak another teacher's papers.
 */
const filterConditions = (filters: EvaluationProjectFilters): SQL[] => {
  const conditions: SQL[] = [eq(evaluationProjects.ownerId, filters.ownerId)];

  if (filters.discipline !== undefined) {
    conditions.push(eq(evaluationProjects.discipline, filters.discipline));
  }
  if (filters.grade !== undefined) {
    conditions.push(eq(evaluationProjects.grade, filters.grade));
  }
  if (filters.archived !== undefined) {
    conditions.push(eq(evaluationProjects.archived, filters.archived));
  }

  return conditions;
};

/**
 * Keyset predicate for the requested ordering.
 *
 * `(sortKey, id)` is compared as a pair so papers sharing a sort key — two saved
 * in the same millisecond, or two still called "" — are still totally ordered.
 */
const cursorCondition = (
  sort: EvaluationProjectSort,
  cursor: Cursor,
): SQL | undefined => {
  switch (sort) {
    case "recent": {
      const at = new Date(cursor.k);
      return or(
        lt(evaluationProjects.updatedAt, at),
        and(
          eq(evaluationProjects.updatedAt, at),
          lt(evaluationProjects.id, cursor.id),
        ),
      );
    }
    case "created": {
      const at = new Date(cursor.k);
      return or(
        lt(evaluationProjects.createdAt, at),
        and(
          eq(evaluationProjects.createdAt, at),
          lt(evaluationProjects.id, cursor.id),
        ),
      );
    }
    case "title":
      return or(
        gt(evaluationProjects.title, cursor.k),
        and(
          eq(evaluationProjects.title, cursor.k),
          gt(evaluationProjects.id, cursor.id),
        ),
      );
  }
};

const orderingFor = (sort: EvaluationProjectSort): SQL[] => {
  switch (sort) {
    case "recent":
      return [desc(evaluationProjects.updatedAt), desc(evaluationProjects.id)];
    case "created":
      return [desc(evaluationProjects.createdAt), desc(evaluationProjects.id)];
    case "title":
      return [asc(evaluationProjects.title), asc(evaluationProjects.id)];
  }
};

export const listEvaluationProjects = async (
  exec: Executor,
  input: ListEvaluationProjectsInput,
): Promise<EvaluationProjectRow[]> => {
  const conditions = filterConditions(input);
  if (input.cursor !== null) {
    const keyset = cursorCondition(input.sort, input.cursor);
    if (keyset !== undefined) {
      conditions.push(keyset);
    }
  }

  return exec
    .select()
    .from(evaluationProjects)
    .where(and(...conditions))
    .orderBy(...orderingFor(input.sort))
    .limit(input.limit);
};

export const countEvaluationProjects = async (
  exec: Executor,
  filters: EvaluationProjectFilters,
): Promise<number> => {
  const [row] = await exec
    .select({ total: count() })
    .from(evaluationProjects)
    .where(and(...filterConditions(filters)));
  return row?.total ?? 0;
};

export const findEvaluationProjectById = async (
  exec: Executor,
  id: string,
): Promise<EvaluationProjectRow | null> => {
  const [row] = await exec
    .select()
    .from(evaluationProjects)
    .where(eq(evaluationProjects.id, id))
    .limit(1);
  return row ?? null;
};

/**
 * Insert-or-replace at the client's id, refusing to cross an ownership line.
 *
 * Returns `null` for exactly one situation: the id is taken and `owner_id` is
 * somebody else's, so `DO UPDATE` matched no row and `RETURNING` produced
 * nothing. Every other outcome — a fresh insert, a replace of the caller's own
 * paper — returns the stored row. The caller turns `null` into `FORBIDDEN`.
 *
 * `createdAt` is absent from `set` on purpose: an update must not restamp when
 * the paper was first written. `updatedAt` is passed explicitly rather than left
 * to the column's `$onUpdate`, which Drizzle applies to `.update()` and not to
 * the `DO UPDATE` arm of an upsert — relying on it would leave the row's clock
 * frozen at creation while the document inside it moved on.
 */
export const upsertEvaluationProject = async (
  exec: Executor,
  values: EvaluationProjectInsert,
): Promise<EvaluationProjectRow | null> => {
  const [row] = await exec
    .insert(evaluationProjects)
    .values(values)
    .onConflictDoUpdate({
      target: evaluationProjects.id,
      set: {
        schemaVersion: values.schemaVersion,
        title: values.title,
        discipline: values.discipline,
        grade: values.grade,
        archived: values.archived,
        archivedAt: values.archivedAt,
        document: values.document,
        updatedAt: values.updatedAt,
      },
      setWhere: eq(evaluationProjects.ownerId, values.ownerId),
    })
    .returning();

  return row ?? null;
};

export const deleteEvaluationProject = async (
  exec: Executor,
  id: string,
): Promise<boolean> => {
  const rows = await exec
    .delete(evaluationProjects)
    .where(eq(evaluationProjects.id, id))
    .returning({ id: evaluationProjects.id });
  return rows.length > 0;
};
