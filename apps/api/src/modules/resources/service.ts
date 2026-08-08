/**
 * Library business rules.
 *
 * Resources are owned directly, so ownership is a filter on every query and a
 * check on every read — there is no path that returns a row the caller does not
 * own.
 */
import type {
  Page,
  ResourceListQuery,
  ResourceSearchQuery,
} from "@ludicon/contracts";
import type { Resource, Timestamp } from "@ludicon/domain";
import { DocumentId, ProjectId, ResourceId, TeacherId } from "@ludicon/domain";

import type { AuthContext } from "../../context.js";
import type { Database } from "../../db/client.js";
import type { ResourceRow } from "../../db/schema.js";
import { NotFoundError } from "../../lib/errors.js";
import { decodeCursor, takePage } from "../../lib/pagination.js";
import { requireOwnership } from "../../middleware/auth.js";
import * as repository from "./repository.js";

const toTimestamp = (value: Date): Timestamp => value.toISOString();

const toResource = (row: ResourceRow): Resource => ({
  id: ResourceId.parse(row.id),
  ownerId: TeacherId.parse(row.ownerId),
  projectId: row.projectId === null ? null : ProjectId.parse(row.projectId),
  documentId: row.documentId === null ? null : DocumentId.parse(row.documentId),
  kind: row.kind,
  title: row.title,
  summary: row.summary,
  subject: row.subject,
  grade: row.grade,
  tags: row.tags,
  status: row.status,
  openedAt: row.openedAt === null ? null : toTimestamp(row.openedAt),
  reuseCount: row.reuseCount,
  createdAt: toTimestamp(row.createdAt),
  updatedAt: toTimestamp(row.updatedAt),
});

const cursorKeyFor = (
  sort: repository.ResourceSort,
  row: ResourceRow,
): string => {
  switch (sort) {
    case "recent":
      return toTimestamp(row.updatedAt);
    case "created":
      return toTimestamp(row.createdAt);
    case "title":
      return row.title;
  }
};

export type ResourceService = ReturnType<typeof createResourceService>;

export const createResourceService = (db: Database) => {
  const page = async (
    filters: repository.ResourceFilters,
    sort: repository.ResourceSort,
    limit: number,
    cursor: string | undefined,
  ): Promise<Page<Resource>> => {
    const [rows, total] = await Promise.all([
      repository.listResources(db, {
        ...filters,
        sort,
        limit: limit + 1,
        cursor: decodeCursor(cursor),
      }),
      repository.countResources(db, filters),
    ]);

    const taken = takePage(rows, limit, (row) => ({
      k: cursorKeyFor(sort, row),
      id: row.id,
    }));
    return {
      items: taken.items.map(toResource),
      nextCursor: taken.nextCursor,
      total,
    };
  };

  return {
    list: async (
      auth: AuthContext,
      query: ResourceListQuery,
    ): Promise<Page<Resource>> =>
      page(
        {
          ownerId: auth.userId,
          kind: query.kind,
          status: query.status,
          projectId: query.projectId,
          subject: query.subject,
          grade: query.grade,
          tag: query.tag,
        },
        query.sort,
        query.limit,
        query.cursor,
      ),

    /**
     * Search is list with a term, not a separate engine. Keeping it on the same
     * query path means a filter added to one is available to the other.
     */
    search: async (
      auth: AuthContext,
      query: ResourceSearchQuery,
    ): Promise<Page<Resource>> =>
      page(
        {
          ownerId: auth.userId,
          kind: query.kind,
          subject: query.subject,
          grade: query.grade,
          search: query.q,
        },
        "recent",
        query.limit,
        query.cursor,
      ),

    get: async (auth: AuthContext, resourceId: string): Promise<Resource> => {
      const row = await repository.findResourceById(db, resourceId);
      if (row === null) {
        throw new NotFoundError("resource", resourceId);
      }
      requireOwnership(auth, {
        kind: "resource",
        id: row.id,
        ownerId: row.ownerId,
      });
      return toResource(row);
    },
  };
};
