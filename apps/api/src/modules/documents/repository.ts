/**
 * Drizzle queries for documents and their version snapshots.
 *
 * Documents carry no owner column of their own — they belong to a project, and
 * the project carries the owner. Every list query therefore joins `projects`
 * and filters on `owner_id`, so ownership is part of the query rather than an
 * afterthought applied to its results.
 */
import type { AssetKind, LifecycleStatus } from "@ludicon/domain";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gt,
  lt,
  or,
  type SQL,
} from "drizzle-orm";

import type { Executor } from "../../db/client.js";
import {
  documents,
  type DocumentInsert,
  type DocumentRow,
  documentVersions,
  type DocumentVersionRow,
  projects,
} from "../../db/schema.js";
import type { Cursor } from "../../lib/pagination.js";

export type DocumentSort = "recent" | "created" | "title";

export type DocumentFilters = {
  ownerId: string;
  projectId?: string | undefined;
  lessonPlanId?: string | undefined;
  kind?: AssetKind | undefined;
  status?: LifecycleStatus | undefined;
};

export type ListDocumentsInput = DocumentFilters & {
  sort: DocumentSort;
  limit: number;
  cursor: Cursor | null;
};

const filterConditions = (filters: DocumentFilters): SQL[] => {
  const conditions: SQL[] = [eq(projects.ownerId, filters.ownerId)];

  if (filters.projectId !== undefined) {
    conditions.push(eq(documents.projectId, filters.projectId));
  }
  if (filters.lessonPlanId !== undefined) {
    conditions.push(eq(documents.lessonPlanId, filters.lessonPlanId));
  }
  if (filters.kind !== undefined) {
    conditions.push(eq(documents.kind, filters.kind));
  }
  if (filters.status !== undefined) {
    conditions.push(eq(documents.status, filters.status));
  }

  return conditions;
};

const cursorCondition = (
  sort: DocumentSort,
  cursor: Cursor,
): SQL | undefined => {
  switch (sort) {
    case "recent": {
      const at = new Date(cursor.k);
      return or(
        lt(documents.updatedAt, at),
        and(eq(documents.updatedAt, at), lt(documents.id, cursor.id)),
      );
    }
    case "created": {
      const at = new Date(cursor.k);
      return or(
        lt(documents.createdAt, at),
        and(eq(documents.createdAt, at), lt(documents.id, cursor.id)),
      );
    }
    case "title":
      return or(
        gt(documents.title, cursor.k),
        and(eq(documents.title, cursor.k), gt(documents.id, cursor.id)),
      );
  }
};

const orderingFor = (sort: DocumentSort): SQL[] => {
  switch (sort) {
    case "recent":
      return [desc(documents.updatedAt), desc(documents.id)];
    case "created":
      return [desc(documents.createdAt), desc(documents.id)];
    case "title":
      return [asc(documents.title), asc(documents.id)];
  }
};

export const listDocuments = async (
  exec: Executor,
  input: ListDocumentsInput,
): Promise<DocumentRow[]> => {
  const conditions = filterConditions(input);
  if (input.cursor !== null) {
    const keyset = cursorCondition(input.sort, input.cursor);
    if (keyset !== undefined) {
      conditions.push(keyset);
    }
  }

  // Spreading the table's columns keeps the join from reshaping the row into
  // `{ documents, projects }`, so callers still receive a plain `DocumentRow`.
  return exec
    .select({ ...getTableColumns(documents) })
    .from(documents)
    .innerJoin(projects, eq(documents.projectId, projects.id))
    .where(and(...conditions))
    .orderBy(...orderingFor(input.sort))
    .limit(input.limit);
};

export const countDocuments = async (
  exec: Executor,
  filters: DocumentFilters,
): Promise<number> => {
  const [row] = await exec
    .select({ total: count() })
    .from(documents)
    .innerJoin(projects, eq(documents.projectId, projects.id))
    .where(and(...filterConditions(filters)));
  return row?.total ?? 0;
};

export const findDocumentById = async (
  exec: Executor,
  id: string,
): Promise<DocumentRow | null> => {
  const [row] = await exec
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);
  return row ?? null;
};

export const insertDocument = async (
  exec: Executor,
  values: DocumentInsert,
): Promise<DocumentRow> => {
  const [row] = await exec.insert(documents).values(values).returning();
  if (row === undefined) {
    throw new Error("document insert returned no row");
  }
  return row;
};

export const updateDocument = async (
  exec: Executor,
  id: string,
  patch: Partial<DocumentInsert>,
): Promise<DocumentRow | null> => {
  const [row] = await exec
    .update(documents)
    .set(patch)
    .where(eq(documents.id, id))
    .returning();
  return row ?? null;
};

/**
 * Appends a snapshot. Always called inside the same transaction as the write it
 * describes — the unique index on `(document_id, version)` is what makes a
 * duplicated snapshot a hard failure rather than silent history corruption.
 */
export const insertDocumentVersion = async (
  exec: Executor,
  values: {
    documentId: string;
    projectId: string;
    version: number;
    snapshot: Record<string, unknown>;
    actor: "teacher" | "ai" | "system";
    note: string | null;
  },
): Promise<DocumentVersionRow> => {
  const [row] = await exec.insert(documentVersions).values(values).returning();
  if (row === undefined) {
    throw new Error("document version insert returned no row");
  }
  return row;
};

export const listDocumentVersions = async (
  exec: Executor,
  documentId: string,
): Promise<DocumentVersionRow[]> =>
  exec
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.version));
