/**
 * Drizzle queries for the teacher's library.
 */
import type { AssetKind, LifecycleStatus } from "@ludicon/domain";
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
  sql,
  type SQL,
} from "drizzle-orm";

import type { Executor } from "../../db/client.js";
import { resources, type ResourceRow } from "../../db/schema.js";
import { type Cursor, escapeLikePattern } from "../../lib/pagination.js";

export type ResourceSort = "recent" | "created" | "title";

export type ResourceFilters = {
  ownerId: string;
  kind?: AssetKind | undefined;
  status?: LifecycleStatus | undefined;
  projectId?: string | undefined;
  subject?: string | undefined;
  grade?: string | undefined;
  tag?: string | undefined;
  /** Free-text term, matched against title and summary. */
  search?: string | undefined;
};

export type ListResourcesInput = ResourceFilters & {
  sort: ResourceSort;
  limit: number;
  cursor: Cursor | null;
};

const filterConditions = (filters: ResourceFilters): SQL[] => {
  const conditions: SQL[] = [eq(resources.ownerId, filters.ownerId)];

  if (filters.kind !== undefined) {
    conditions.push(eq(resources.kind, filters.kind));
  }
  if (filters.status !== undefined) {
    conditions.push(eq(resources.status, filters.status));
  }
  if (filters.projectId !== undefined) {
    conditions.push(eq(resources.projectId, filters.projectId));
  }
  if (filters.subject !== undefined) {
    conditions.push(eq(resources.subject, filters.subject));
  }
  if (filters.grade !== undefined) {
    conditions.push(eq(resources.grade, filters.grade));
  }
  if (filters.tag !== undefined) {
    // `tags` is a JSONB array of strings; containment uses the parameterised
    // `@>` operator rather than string matching, so a tag cannot be spoofed by
    // another tag that merely contains it as a substring.
    conditions.push(
      sql`${resources.tags} @> ${JSON.stringify([filters.tag])}::jsonb`,
    );
  }
  if (filters.search !== undefined) {
    const pattern = `%${escapeLikePattern(filters.search)}%`;
    const match = or(
      ilike(resources.title, pattern),
      ilike(resources.summary, pattern),
    );
    if (match !== undefined) {
      conditions.push(match);
    }
  }

  return conditions;
};

const cursorCondition = (
  sort: ResourceSort,
  cursor: Cursor,
): SQL | undefined => {
  switch (sort) {
    case "recent": {
      const at = new Date(cursor.k);
      return or(
        lt(resources.updatedAt, at),
        and(eq(resources.updatedAt, at), lt(resources.id, cursor.id)),
      );
    }
    case "created": {
      const at = new Date(cursor.k);
      return or(
        lt(resources.createdAt, at),
        and(eq(resources.createdAt, at), lt(resources.id, cursor.id)),
      );
    }
    case "title":
      return or(
        gt(resources.title, cursor.k),
        and(eq(resources.title, cursor.k), gt(resources.id, cursor.id)),
      );
  }
};

const orderingFor = (sort: ResourceSort): SQL[] => {
  switch (sort) {
    case "recent":
      return [desc(resources.updatedAt), desc(resources.id)];
    case "created":
      return [desc(resources.createdAt), desc(resources.id)];
    case "title":
      return [asc(resources.title), asc(resources.id)];
  }
};

export const listResources = async (
  exec: Executor,
  input: ListResourcesInput,
): Promise<ResourceRow[]> => {
  const conditions = filterConditions(input);
  if (input.cursor !== null) {
    const keyset = cursorCondition(input.sort, input.cursor);
    if (keyset !== undefined) {
      conditions.push(keyset);
    }
  }

  return exec
    .select()
    .from(resources)
    .where(and(...conditions))
    .orderBy(...orderingFor(input.sort))
    .limit(input.limit);
};

export const countResources = async (
  exec: Executor,
  filters: ResourceFilters,
): Promise<number> => {
  const [row] = await exec
    .select({ total: count() })
    .from(resources)
    .where(and(...filterConditions(filters)));
  return row?.total ?? 0;
};

export const findResourceById = async (
  exec: Executor,
  id: string,
): Promise<ResourceRow | null> => {
  const [row] = await exec
    .select()
    .from(resources)
    .where(eq(resources.id, id))
    .limit(1);
  return row ?? null;
};
