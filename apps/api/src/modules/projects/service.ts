/**
 * Project business rules.
 *
 * The service owns ownership checks, transactions and the row-to-domain
 * mapping. Routes below it deal only in HTTP; repositories above it deal only
 * in SQL.
 */
import type { Page, ProjectListQuery } from "@ludicon/contracts";
import type {
  Project,
  ProjectDraft,
  ProjectPatch,
  Timestamp,
} from "@ludicon/domain";
import { ProjectId, TeacherId } from "@ludicon/domain";

import type { AuthContext } from "../../context.js";
import type { Database } from "../../db/client.js";
import type { ProjectInsert, ProjectRow } from "../../db/schema.js";
import { NotFoundError, ValidationFailedError } from "../../lib/errors.js";
import { decodeCursor, takePage } from "../../lib/pagination.js";
import { requireOwnership } from "../../middleware/auth.js";
import { ensureTeacher } from "../teachers/repository.js";
import * as repository from "./repository.js";

const toTimestamp = (value: Date): Timestamp => value.toISOString();

/**
 * Row to domain entity.
 *
 * Ids are branded, so they are parsed rather than assigned: the parse is both
 * the conversion and a guarantee that a malformed id never enters the domain.
 */
const toProject = (row: ProjectRow): Project => ({
  id: ProjectId.parse(row.id),
  ownerId: TeacherId.parse(row.ownerId),
  title: row.title,
  description: row.description,
  subject: row.subject,
  grade: row.grade,
  intendedKind: row.intendedKind,
  plannedMaterials: row.plannedMaterials,
  color: row.color,
  state: row.state,
  favorite: row.favorite,
  archived: row.archived,
  archivedAt: row.archivedAt === null ? null : toTimestamp(row.archivedAt),
  createdAt: toTimestamp(row.createdAt),
  updatedAt: toTimestamp(row.updatedAt),
});

const cursorKeyFor = (
  sort: repository.ProjectSort,
  row: ProjectRow,
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

export type ProjectService = ReturnType<typeof createProjectService>;

export const createProjectService = (db: Database) => {
  /**
   * Loads a project and proves the caller owns it.
   *
   * A missing row and a row owned by someone else are deliberately distinct:
   * the caller already knows the id it asked for, so `NOT_FOUND` leaks nothing,
   * and `FORBIDDEN` is the honest answer for a shared link.
   */
  const loadOwned = async (
    auth: AuthContext,
    projectId: string,
  ): Promise<ProjectRow> => {
    const row = await repository.findProjectById(db, projectId);
    if (row === null) {
      throw new NotFoundError("project", projectId);
    }
    requireOwnership(auth, {
      kind: "project",
      id: row.id,
      ownerId: row.ownerId,
    });
    return row;
  };

  return {
    /** Exposed so sibling services can reuse the ownership check. */
    loadOwned,

    list: async (
      auth: AuthContext,
      query: ProjectListQuery,
    ): Promise<Page<Project>> => {
      const filters: repository.ProjectFilters = {
        ownerId: auth.userId,
        state: query.state,
        grade: query.grade,
        subject: query.subject,
        favorite: query.favorite,
        archived: query.archived,
        search: query.search,
      };

      const [rows, total] = await Promise.all([
        repository.listProjects(db, {
          ...filters,
          sort: query.sort,
          // One extra row, purely to learn whether another page exists.
          limit: query.limit + 1,
          cursor: decodeCursor(query.cursor),
        }),
        repository.countProjects(db, filters),
      ]);

      const page = takePage(rows, query.limit, (row) => ({
        k: cursorKeyFor(query.sort, row),
        id: row.id,
      }));

      return {
        items: page.items.map(toProject),
        nextCursor: page.nextCursor,
        total,
      };
    },

    get: async (auth: AuthContext, projectId: string): Promise<Project> =>
      toProject(await loadOwned(auth, projectId)),

    /**
     * Creating a project also materialises the teacher row it points at. Both
     * happen in one transaction so a failed insert cannot leave a teacher
     * record behind for an account that never created anything.
     */
    create: async (
      auth: AuthContext,
      draft: ProjectDraft,
    ): Promise<Project> => {
      const row = await db.transaction(async (tx) => {
        await ensureTeacher(tx, {
          id: auth.userId,
          organizationId: auth.orgId,
        });
        const values: ProjectInsert = {
          ownerId: auth.userId,
          organizationId: auth.orgId,
          title: draft.title,
          description: draft.description,
          subject: draft.subject,
          grade: draft.grade,
          intendedKind: draft.intendedKind,
          plannedMaterials: draft.plannedMaterials,
          color: draft.color,
          state: draft.state,
          favorite: draft.favorite,
          archived: draft.archived,
        };
        return repository.insertProject(tx, values);
      });
      return toProject(row);
    },

    update: async (
      auth: AuthContext,
      projectId: string,
      patch: ProjectPatch,
    ): Promise<Project> => {
      await loadOwned(auth, projectId);

      const values: Partial<ProjectInsert> = {
        ...(patch.title === undefined ? {} : { title: patch.title }),
        ...(patch.description === undefined
          ? {}
          : { description: patch.description }),
        ...(patch.subject === undefined ? {} : { subject: patch.subject }),
        ...(patch.grade === undefined ? {} : { grade: patch.grade }),
        ...(patch.intendedKind === undefined
          ? {}
          : { intendedKind: patch.intendedKind }),
        ...(patch.plannedMaterials === undefined
          ? {}
          : { plannedMaterials: patch.plannedMaterials }),
        ...(patch.color === undefined ? {} : { color: patch.color }),
        ...(patch.state === undefined ? {} : { state: patch.state }),
        ...(patch.favorite === undefined ? {} : { favorite: patch.favorite }),
        ...(patch.archived === undefined ? {} : { archived: patch.archived }),
      };

      if (Object.keys(values).length === 0) {
        throw new ValidationFailedError("patch contained no writable fields");
      }

      const row = await repository.updateProject(db, projectId, values);
      if (row === null) {
        throw new NotFoundError("project", projectId);
      }
      return toProject(row);
    },

    /**
     * A hard delete. Every dependent row — lesson design, blocks, documents,
     * versions — is removed by `ON DELETE CASCADE` rather than by a sequence of
     * statements that could half-succeed.
     */
    remove: async (auth: AuthContext, projectId: string): Promise<void> => {
      await loadOwned(auth, projectId);
      const deleted = await repository.deleteProject(db, projectId);
      if (!deleted) {
        throw new NotFoundError("project", projectId);
      }
    },
  };
};
