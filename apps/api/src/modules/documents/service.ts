/**
 * Document business rules.
 *
 * Two things are load-bearing here:
 *
 *   1. **The approval gate.** Creating a document, and enqueueing a generation
 *      job, both go through `requireApprovedForGeneration`. There is no path to
 *      a generated material that does not pass it.
 *   2. **Document and snapshot are one write.** Every state change writes the
 *      document row and its version row in a single transaction, so history can
 *      never disagree with the present.
 */
import type {
  CreateDocumentBody,
  DocumentListQuery,
  DocumentRecord,
  GenerateMaterialsResponse,
  Page,
  PublishDocumentBody,
  UpdateDocumentBody,
} from "@ludicon/contracts";
import type { AssetKind, Timestamp } from "@ludicon/domain";
import {
  DocumentId,
  LessonPlanId,
  nowTimestamp,
  ProjectId,
} from "@ludicon/domain";

import type { AuthContext } from "../../context.js";
import type { Database, Executor } from "../../db/client.js";
import type { DocumentInsert, DocumentRow } from "../../db/schema.js";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import { decodeCursor, takePage } from "../../lib/pagination.js";
import { requireOwnership } from "../../middleware/auth.js";
import type { QueueProducer } from "../../queue/producer.js";
import type { LessonPlanService } from "../lesson-plans/service.js";
import type { ProjectService } from "../projects/service.js";
import * as repository from "./repository.js";

const toTimestamp = (value: Date): Timestamp => value.toISOString();

const toDocument = (row: DocumentRow): DocumentRecord => ({
  id: DocumentId.parse(row.id),
  projectId: ProjectId.parse(row.projectId),
  lessonPlanId:
    row.lessonPlanId === null ? null : LessonPlanId.parse(row.lessonPlanId),
  kind: row.kind,
  status: row.status,
  version: row.version,
  title: row.title,
  subject: row.subject,
  grade: row.grade,
  body: row.body,
  validation: row.validation ?? null,
  createdBy: row.createdBy,
  createdAt: toTimestamp(row.createdAt),
  updatedAt: toTimestamp(row.updatedAt),
  publishedAt: row.publishedAt === null ? null : toTimestamp(row.publishedAt),
});

/** What a version row preserves: everything a teacher could restore. */
const snapshotOf = (row: DocumentRow): Record<string, unknown> => ({
  kind: row.kind,
  status: row.status,
  version: row.version,
  title: row.title,
  subject: row.subject,
  grade: row.grade,
  body: row.body,
  validation: row.validation,
});

const cursorKeyFor = (
  sort: repository.DocumentSort,
  row: DocumentRow,
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

export type DocumentServiceDeps = {
  db: Database;
  projects: ProjectService;
  lessonPlans: LessonPlanService;
  queue: QueueProducer;
};

export type DocumentService = ReturnType<typeof createDocumentService>;

export const createDocumentService = ({
  db,
  projects,
  lessonPlans,
  queue,
}: DocumentServiceDeps) => {
  /** Documents inherit ownership from their project. */
  const loadOwned = async (
    auth: AuthContext,
    documentId: string,
  ): Promise<DocumentRow> => {
    const row = await repository.findDocumentById(db, documentId);
    if (row === null) {
      throw new NotFoundError("document", documentId);
    }
    const project = await projects.loadOwned(auth, row.projectId);
    requireOwnership(auth, {
      kind: "document",
      id: row.id,
      ownerId: project.ownerId,
    });
    return row;
  };

  /**
   * Writes the next state of a document and its snapshot atomically.
   *
   * Centralised so no future call site can persist a change and forget the
   * history entry — the two are the same operation, not two operations that
   * usually happen together.
   */
  const writeRevision = async (
    exec: Executor,
    current: DocumentRow,
    patch: Partial<DocumentInsert>,
    note: string | null,
  ): Promise<DocumentRow> => {
    const nextVersion = current.version + 1;
    const updated = await repository.updateDocument(exec, current.id, {
      ...patch,
      version: nextVersion,
    });
    if (updated === null) {
      throw new NotFoundError("document", current.id);
    }
    await repository.insertDocumentVersion(exec, {
      documentId: updated.id,
      projectId: updated.projectId,
      version: nextVersion,
      snapshot: snapshotOf(updated),
      actor: "teacher",
      note,
    });
    return updated;
  };

  return {
    list: async (
      auth: AuthContext,
      query: DocumentListQuery,
    ): Promise<Page<DocumentRecord>> => {
      const filters: repository.DocumentFilters = {
        ownerId: auth.userId,
        projectId: query.projectId,
        lessonPlanId: query.lessonPlanId,
        kind: query.kind,
        status: query.status,
      };

      const [rows, total] = await Promise.all([
        repository.listDocuments(db, {
          ...filters,
          sort: query.sort,
          limit: query.limit + 1,
          cursor: decodeCursor(query.cursor),
        }),
        repository.countDocuments(db, filters),
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
      documentId: string,
    ): Promise<DocumentRecord> => toDocument(await loadOwned(auth, documentId)),

    /**
     * Creating a material is gated.
     *
     * A document is an artefact *of* an approved design. Allowing one to be
     * created against an unapproved project would be the approval gate with a
     * hole in it, so the same precondition that guards bulk generation guards
     * the single-document path.
     */
    create: async (
      auth: AuthContext,
      body: CreateDocumentBody,
    ): Promise<DocumentRecord> => {
      const approved = await lessonPlans.requireApprovedForGeneration(
        auth,
        body.projectId,
      );

      return db.transaction(async (tx) => {
        const inserted = await repository.insertDocument(tx, {
          projectId: approved.project.id,
          // A document with no explicit design still belongs to the approved one.
          lessonPlanId: body.lessonPlanId ?? approved.lessonPlan.id,
          kind: body.kind,
          status: "draft",
          version: 1,
          title: body.title,
          subject: body.subject,
          grade: body.grade,
          body: body.body,
          createdBy: "teacher",
        });

        await repository.insertDocumentVersion(tx, {
          documentId: inserted.id,
          projectId: inserted.projectId,
          version: inserted.version,
          snapshot: snapshotOf(inserted),
          actor: "teacher",
          note: null,
        });

        return toDocument(inserted);
      });
    },

    update: async (
      auth: AuthContext,
      documentId: string,
      patch: UpdateDocumentBody,
    ): Promise<DocumentRecord> => {
      const current = await loadOwned(auth, documentId);

      if (current.status === "archived") {
        throw new ConflictError("archived documents cannot be edited", {
          context: { documentId },
        });
      }

      const updated = await db.transaction((tx) =>
        writeRevision(
          tx,
          current,
          {
            ...(patch.title === undefined ? {} : { title: patch.title }),
            ...(patch.status === undefined ? {} : { status: patch.status }),
            ...(patch.body === undefined ? {} : { body: patch.body }),
          },
          patch.note ?? null,
        ),
      );

      return toDocument(updated);
    },

    publish: async (
      auth: AuthContext,
      documentId: string,
      body: PublishDocumentBody,
    ): Promise<DocumentRecord> => {
      const current = await loadOwned(auth, documentId);

      if (current.status === "published") {
        // Already where the teacher wanted it; re-publishing is not a failure.
        return toDocument(current);
      }

      const updated = await db.transaction((tx) =>
        writeRevision(
          tx,
          current,
          { status: "published", publishedAt: new Date() },
          body.note ?? null,
        ),
      );

      return toDocument(updated);
    },

    /**
     * Bulk generation.
     *
     * The API's whole responsibility is the gate and the enqueue: it proves the
     * design is approved, then hands the work to the worker. Nothing is
     * generated on the request path.
     */
    generate: async (
      auth: AuthContext,
      projectId: string,
      kinds: AssetKind[],
      requestId: string | undefined,
    ): Promise<GenerateMaterialsResponse> => {
      const approved = await lessonPlans.requireApprovedForGeneration(
        auth,
        projectId,
      );

      const jobId = await queue.enqueueGenerateMaterials({
        projectId: ProjectId.parse(approved.project.id),
        lessonPlanId: LessonPlanId.parse(approved.lessonPlan.id),
        kinds,
        requestedBy: auth.userId,
        requestedAt: nowTimestamp(),
        ...(requestId === undefined ? {} : { requestId }),
      });

      return { jobId, queued: kinds };
    },
  };
};
