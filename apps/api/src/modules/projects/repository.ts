/**
 * Drizzle queries for projects. No business rules, no HTTP, no domain mapping —
 * rows in, rows out. The service layer decides what the rows mean.
 */
import type { GradeLevel, ProjectState } from "@ludicon/domain";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  ilike,
  lt,
  or,
  type SQL,
} from "drizzle-orm";

import type { Executor } from "../../db/client.js";
import {
  projects,
  type ProjectInsert,
  type ProjectRow,
} from "../../db/schema.js";
import { type Cursor, escapeLikePattern } from "../../lib/pagination.js";

export type ProjectSort = "recent" | "created" | "title";

export type ProjectFilters = {
  ownerId: string;
  state?: ProjectState | undefined;
  grade?: GradeLevel | undefined;
  subject?: string | undefined;
  favorite?: boolean | undefined;
  archived: boolean;
  search?: string | undefined;
};

export type ListProjectsInput = ProjectFilters & {
  sort: ProjectSort;
  /** Callers pass `limit + 1`; the extra row answers "is there a next page?". */
  limit: number;
  cursor: Cursor | null;
};

/**
 * Ownership is a filter, not an afterthought: every list query is scoped to the
 * caller, so a missing authorization check cannot leak another teacher's rows.
 */
const filterConditions = (filters: ProjectFilters): SQL[] => {
  const conditions: SQL[] = [eq(projects.ownerId, filters.ownerId)];

  if (filters.state !== undefined) {
    conditions.push(eq(projects.state, filters.state));
  }
  if (filters.grade !== undefined) {
    conditions.push(eq(projects.grade, filters.grade));
  }
  if (filters.subject !== undefined) {
    conditions.push(eq(projects.subject, filters.subject));
  }
  if (filters.favorite !== undefined) {
    conditions.push(eq(projects.favorite, filters.favorite));
  }
  conditions.push(eq(projects.archived, filters.archived));
  if (filters.search !== undefined) {
    conditions.push(
      ilike(projects.title, `%${escapeLikePattern(filters.search)}%`),
    );
  }

  return conditions;
};

/**
 * Keyset predicate for the requested ordering.
 *
 * `(sortKey, id)` is compared as a pair so rows sharing a sort key are still
 * totally ordered — the reason both indexes on `projects` end in `id`.
 */
const cursorCondition = (
  sort: ProjectSort,
  cursor: Cursor,
): SQL | undefined => {
  switch (sort) {
    case "recent": {
      const at = new Date(cursor.k);
      return or(
        lt(projects.updatedAt, at),
        and(eq(projects.updatedAt, at), lt(projects.id, cursor.id)),
      );
    }
    case "created": {
      const at = new Date(cursor.k);
      return or(
        lt(projects.createdAt, at),
        and(eq(projects.createdAt, at), lt(projects.id, cursor.id)),
      );
    }
    case "title":
      return or(
        gt(projects.title, cursor.k),
        and(eq(projects.title, cursor.k), gt(projects.id, cursor.id)),
      );
  }
};

const orderingFor = (sort: ProjectSort): SQL[] => {
  switch (sort) {
    case "recent":
      return [desc(projects.updatedAt), desc(projects.id)];
    case "created":
      return [desc(projects.createdAt), desc(projects.id)];
    case "title":
      return [asc(projects.title), asc(projects.id)];
  }
};

export const listProjects = async (
  exec: Executor,
  input: ListProjectsInput,
): Promise<ProjectRow[]> => {
  const conditions = filterConditions(input);
  if (input.cursor !== null) {
    const keyset = cursorCondition(input.sort, input.cursor);
    if (keyset !== undefined) {
      conditions.push(keyset);
    }
  }

  return exec
    .select()
    .from(projects)
    .where(and(...conditions))
    .orderBy(...orderingFor(input.sort))
    .limit(input.limit);
};

export const countProjects = async (
  exec: Executor,
  filters: ProjectFilters,
): Promise<number> => {
  const [row] = await exec
    .select({ total: count() })
    .from(projects)
    .where(and(...filterConditions(filters)));
  return row?.total ?? 0;
};

export const findProjectById = async (
  exec: Executor,
  id: string,
): Promise<ProjectRow | null> => {
  const [row] = await exec
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return row ?? null;
};

export const insertProject = async (
  exec: Executor,
  values: ProjectInsert,
): Promise<ProjectRow> => {
  const [row] = await exec.insert(projects).values(values).returning();
  if (row === undefined) {
    throw new Error("project insert returned no row");
  }
  return row;
};

/** Returns `null` when the row no longer exists, so the caller can 404. */
export const updateProject = async (
  exec: Executor,
  id: string,
  patch: Partial<ProjectInsert>,
): Promise<ProjectRow | null> => {
  const [row] = await exec
    .update(projects)
    .set(patch)
    .where(eq(projects.id, id))
    .returning();
  return row ?? null;
};

export const deleteProject = async (
  exec: Executor,
  id: string,
): Promise<boolean> => {
  const rows = await exec
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  return rows.length > 0;
};
