/**
 * Evaluation paper business rules.
 *
 * The service owns ownership checks, transactions and the row-to-document
 * mapping. Routes below it deal only in HTTP; the repository above it deals only
 * in SQL.
 *
 * Two rules are load-bearing and are stated once, here, because nothing else
 * enforces them:
 *
 *  1. **The document is the only source of truth on the way out.** `toDocument`
 *     parses the `jsonb` column and reads no other column. The projected
 *     columns exist to be filtered and ordered by; the alternative — merging
 *     them back over the parsed document "in case they disagree" — would make
 *     two sources of every fact and a silent winner between them.
 *  2. **The projection is derived at ONE site.** `toRow` is the only place a
 *     column is computed from a document, so `title`, `discipline`, `grade` and
 *     `archived` cannot be written to disagree with the paper they describe.
 *     Postgres generated columns were the rejected alternative: they would make
 *     drift impossible rather than merely unreachable, at the cost of an
 *     expression per enum cast in the migration and a column drizzle-kit cannot
 *     round-trip cleanly — a real trade, taken this way because there is exactly
 *     one writer and it is fifteen lines long.
 */
import type {
  EvaluationProjectListQuery,
  Page,
  PutEvaluationProjectBody,
} from "@ludicon/contracts";
import type { Timestamp } from "@ludicon/domain";
import { nowTimestamp } from "@ludicon/domain";
import { EvaluationProject } from "@ludicon/evaluation";

import type { AuthContext } from "../../context.js";
import type { Database } from "../../db/client.js";
import type {
  EvaluationProjectInsert,
  EvaluationProjectRow,
} from "../../db/schema.js";
import {
  InternalError,
  NotFoundError,
  ValidationFailedError,
} from "../../lib/errors.js";
import { decodeCursor, takePage } from "../../lib/pagination.js";
import { requireOwnership } from "../../middleware/auth.js";
import { ensureTeacher } from "../teachers/repository.js";
import * as repository from "./repository.js";

const toTimestamp = (value: Date): Timestamp => value.toISOString();

/**
 * Column to document.
 *
 * A stored paper that no longer parses is an `INTERNAL`, not a
 * `VALIDATION_FAILED`: the teacher did nothing wrong, this service wrote a
 * document its own schema rejects. Returning it unparsed was the alternative and
 * it is worse than a 500 — an unreadable document that arrives looking readable
 * fails in the canvas, three layers from the row that caused it.
 */
const toDocument = (row: EvaluationProjectRow): EvaluationProject => {
  const parsed = EvaluationProject.safeParse(row.document);
  if (!parsed.success) {
    throw new InternalError(
      "stored evaluation paper does not match its schema",
      {
        context: { evaluationProjectId: row.id, issues: parsed.error.issues },
      },
    );
  }
  return parsed.data;
};

/**
 * Document to row. The single derivation site named in this file's header.
 *
 * Every column is read off the document it is stored beside, including the two
 * timestamps — `put` has already made those authoritative, so taking them from
 * anywhere else would reintroduce the disagreement this function exists to make
 * impossible.
 */
const toRow = (document: EvaluationProject): EvaluationProjectInsert => ({
  id: document.id,
  ownerId: document.ownerId,
  schemaVersion: document.schemaVersion,
  title: document.meta.title,
  discipline: document.meta.discipline,
  grade: document.meta.grade,
  archived: document.archived,
  archivedAt:
    document.archivedAt === null ? null : new Date(document.archivedAt),
  document,
  createdAt: new Date(document.createdAt),
  updatedAt: new Date(document.updatedAt),
});

const cursorKeyFor = (
  sort: repository.EvaluationProjectSort,
  row: EvaluationProjectRow,
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

const emptyPage = <TItem>(): Page<TItem> => ({
  items: [],
  nextCursor: null,
  total: 0,
});

export type PutEvaluationProjectResult = {
  evaluationProject: EvaluationProject;
  /** Drives 201 vs 200. An idempotent PUT has to be able to say which it did. */
  created: boolean;
};

export type EvaluationProjectService = ReturnType<
  typeof createEvaluationProjectService
>;

export const createEvaluationProjectService = (db: Database) => {
  /**
   * Loads a paper and proves the caller owns it.
   *
   * A missing row and a row owned by someone else stay distinct for the same
   * reason they do in `modules/projects`: the caller already knows the id it
   * asked for, so `NOT_FOUND` leaks nothing, and `FORBIDDEN` is the honest
   * answer for a link someone shared.
   */
  const loadOwned = async (
    auth: AuthContext,
    evaluationProjectId: string,
  ): Promise<EvaluationProjectRow> => {
    const row = await repository.findEvaluationProjectById(
      db,
      evaluationProjectId,
    );
    if (row === null) {
      throw new NotFoundError("evaluation project", evaluationProjectId);
    }
    requireOwnership(auth, {
      kind: "evaluation project",
      id: row.id,
      ownerId: row.ownerId,
    });
    return row;
  };

  return {
    loadOwned,

    list: async (
      auth: AuthContext,
      query: EvaluationProjectListQuery,
    ): Promise<Page<EvaluationProject>> => {
      // `ownerId` can only narrow. Asking for somebody else's papers is answered
      // with an empty page rather than a 403: the filter is legitimate, the
      // answer is simply that the caller has none of theirs.
      if (query.ownerId !== undefined && query.ownerId !== auth.userId) {
        return emptyPage();
      }

      const filters: repository.EvaluationProjectFilters = {
        ownerId: auth.userId,
        discipline: query.discipline,
        grade: query.grade,
        archived: query.archived,
      };

      const [rows, total] = await Promise.all([
        repository.listEvaluationProjects(db, {
          ...filters,
          sort: query.sort,
          // One extra row, purely to learn whether another page exists.
          limit: query.limit + 1,
          cursor: decodeCursor(query.cursor),
        }),
        repository.countEvaluationProjects(db, filters),
      ]);

      const page = takePage(rows, query.limit, (row) => ({
        k: cursorKeyFor(query.sort, row),
        id: row.id,
      }));

      return {
        items: page.items.map(toDocument),
        nextCursor: page.nextCursor,
        total,
      };
    },

    get: async (
      auth: AuthContext,
      evaluationProjectId: string,
    ): Promise<EvaluationProject> =>
      toDocument(await loadOwned(auth, evaluationProjectId)),

    /**
     * Insert or replace the whole paper at the id the client minted.
     *
     * The read and the write share one transaction so a concurrent PUT cannot
     * land between them, and the repository's `setWhere` guard is the backstop
     * for the one case the read cannot see: a row created by another teacher
     * after we looked and found nothing.
     *
     * `updatedAt` is stamped here because the API is now the persistence
     * boundary that `EvaluationProject#touch` describes — a client clock would
     * make "most recent first" mean "whoever's laptop is furthest ahead".
     */
    put: async (
      auth: AuthContext,
      evaluationProjectId: string,
      body: PutEvaluationProjectBody,
    ): Promise<PutEvaluationProjectResult> => {
      if (body.id !== evaluationProjectId) {
        throw new ValidationFailedError(
          "evaluation paper id in the body disagrees with the path",
          {
            details: { target: "json", fields: ["id"] },
            context: { pathId: evaluationProjectId, bodyId: body.id },
          },
        );
      }

      // `archived` and `archivedAt` are two fields that must agree — the model
      // keeps them in step through `archiveEvaluation`/`restoreEvaluation`, and
      // a raw whole-document write is exactly the path that goes around those.
      if (body.archived === (body.archivedAt === null)) {
        throw new ValidationFailedError(
          "archived and archivedAt disagree on the incoming paper",
          {
            details: { target: "json", fields: ["archived", "archivedAt"] },
            context: {
              archived: body.archived,
              archivedAt: body.archivedAt,
            },
          },
        );
      }

      const now = nowTimestamp();

      const { row, created } = await db.transaction(async (tx) => {
        const existing = await repository.findEvaluationProjectById(
          tx,
          evaluationProjectId,
        );

        if (existing === null) {
          // Only the insert path needs the teacher row: a paper that already
          // exists is proof that its owner's row does too, because the foreign
          // key would not have let it be written otherwise. Calling this
          // unconditionally is what `modules/projects` does, and it is affordable
          // there because a project is created once — a paper is PUT on every
          // autosave, and an extra upsert per keystroke pause is not free.
          await ensureTeacher(tx, {
            id: auth.userId,
            organizationId: auth.orgId,
          });
        } else {
          requireOwnership(auth, {
            kind: "evaluation project",
            id: existing.id,
            ownerId: existing.ownerId,
          });
        }

        const document: EvaluationProject = {
          ...body,
          ownerId: auth.userId,
          createdAt: existing === null ? now : toTimestamp(existing.createdAt),
          updatedAt: now,
        };

        const stored = await repository.upsertEvaluationProject(
          tx,
          toRow(document),
        );
        if (stored === null) {
          // Only reachable when a row for this id appeared under a different
          // owner between the read above and this write.
          throw new NotFoundError("evaluation project", evaluationProjectId);
        }
        return { row: stored, created: existing === null };
      });

      return { evaluationProject: toDocument(row), created };
    },

    /**
     * A hard delete, and it needs no cascade.
     *
     * Everything a paper owns is a field of its own row, and no other table
     * carries an `EvaluationProjectId`. The day that stops being true — a
     * paper's images in their own table, say — this is the method that has to
     * grow a transaction, not the caller.
     */
    remove: async (
      auth: AuthContext,
      evaluationProjectId: string,
    ): Promise<void> => {
      await loadOwned(auth, evaluationProjectId);
      const deleted = await repository.deleteEvaluationProject(
        db,
        evaluationProjectId,
      );
      if (!deleted) {
        throw new NotFoundError("evaluation project", evaluationProjectId);
      }
    },
  };
};
