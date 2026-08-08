/**
 * HTTP wire contracts — one schema per request/response shape, shared verbatim
 * by the API (which validates against them) and the web app (which infers its
 * types from them).
 *
 * Nothing here redefines a domain shape. Every entity comes from
 * `@ludicon/domain`; this module only describes how those entities are framed
 * by a request: which subset, which filters, which page.
 */
import {
  AssetKind,
  DocumentId,
  documentSchema,
  GradeLevel,
  LessonPlan,
  LessonPlanId,
  LessonPlanPatch,
  LifecycleStatus,
  Project,
  ProjectDraft,
  ProjectId,
  ProjectPatch,
  ProjectState,
  Resource,
  ResourceId,
} from "@ludicon/domain";
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Cursor pagination, not offset pagination: the Desk is a live surface where
 * items are created while a teacher scrolls, and OFFSET would silently skip or
 * repeat rows. The cursor is opaque to the client by design.
 */
export const PageQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().min(1).max(512).optional(),
});
export type PageQuery = z.infer<typeof PageQuery>;

export function pageOf<TItem extends z.ZodType>(item: TItem) {
  return z.object({
    items: z.array(item),
    /** `null` means this is the last page. */
    nextCursor: z.string().min(1).nullable(),
    /** Total matching rows, for "24 materiale" style counters. */
    total: z.number().int().nonnegative(),
  });
}

export type Page<TItem> = {
  items: TItem[];
  nextCursor: string | null;
  total: number;
};

/** Shared list ordering vocabulary. */
export const SortOrder = z.enum(["recent", "created", "title"]);
export type SortOrder = z.infer<typeof SortOrder>;

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export const ProjectParams = z.object({ projectId: ProjectId });
export type ProjectParams = z.infer<typeof ProjectParams>;

export const ProjectListQuery = PageQuery.extend({
  state: ProjectState.optional(),
  grade: GradeLevel.optional(),
  subject: z.string().min(1).max(120).optional(),
  /** Query strings carry booleans as text; `stringbool` decodes "true"/"1"/"yes". */
  favorite: z.stringbool().optional(),
  archived: z.stringbool().default(false),
  search: z.string().min(1).max(200).optional(),
  sort: SortOrder.default("recent"),
});
export type ProjectListQuery = z.infer<typeof ProjectListQuery>;

export const ProjectListResponse = pageOf(Project);
export type ProjectListResponse = z.infer<typeof ProjectListResponse>;

export const ProjectResponse = z.object({ project: Project });
export type ProjectResponse = z.infer<typeof ProjectResponse>;

/**
 * `ownerId` is never accepted from the client — it comes from the session.
 *
 * The exported type is the *parsed* shape, with the draft's defaults applied,
 * because that is what a handler receives from `c.req.valid("json")`. Clients
 * building a request body get the looser input type from the schema itself.
 */
export const CreateProjectBody = ProjectDraft;
export type CreateProjectBody = z.infer<typeof CreateProjectBody>;

export const UpdateProjectBody = ProjectPatch;
export type UpdateProjectBody = z.infer<typeof UpdateProjectBody>;

/**
 * Deleting a project deletes everything it owns — lesson design, documents,
 * version snapshots and library entries. `ProjectPatch` cannot express that,
 * and neither can `archived`: putting away and throwing away are different
 * answers and the interface must be able to offer both.
 */
export const DeleteProjectResponse = z.object({
  deleted: z.literal(true),
  id: ProjectId,
});
export type DeleteProjectResponse = z.infer<typeof DeleteProjectResponse>;

/* -------------------------------------------------------------------------- */
/* Lesson plans                                                               */
/* -------------------------------------------------------------------------- */

export const LessonPlanParams = z.object({ lessonPlanId: LessonPlanId });
export type LessonPlanParams = z.infer<typeof LessonPlanParams>;

export const LessonPlanResponse = z.object({ lessonPlan: LessonPlan });
export type LessonPlanResponse = z.infer<typeof LessonPlanResponse>;

/**
 * The approval fields are deliberately not patchable — `LessonPlanPatch` no
 * longer carries them at all. Approval is a distinct, audited transition
 * through `POST /lesson-plans/:id/approve`, never a field write; a gate that a
 * stray PATCH can open is not a gate.
 */
export const UpdateLessonPlanBody = LessonPlanPatch;
export type UpdateLessonPlanBody = z.infer<typeof UpdateLessonPlanBody>;

export const ApproveLessonPlanBody = z.object({
  /** Optional teacher note recorded with the approval, for the audit trail. */
  note: z.string().max(500).optional(),
});
export type ApproveLessonPlanBody = z.infer<typeof ApproveLessonPlanBody>;

export const ApproveLessonPlanResponse = z.object({
  lessonPlan: LessonPlan,
  project: Project,
});
export type ApproveLessonPlanResponse = z.infer<
  typeof ApproveLessonPlanResponse
>;

/* -------------------------------------------------------------------------- */
/* Documents                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A document body is opaque at the transport layer: its shape depends on
 * `kind`, and the per-kind schemas belong to the generation modules rather than
 * to the wire contract. Keeping it opaque here stops the HTTP layer from
 * becoming a second, drifting copy of the asset taxonomy.
 */
export const DocumentBody = z.record(z.string().min(1), z.unknown());
export type DocumentBody = z.infer<typeof DocumentBody>;

export const DocumentRecord = documentSchema(DocumentBody);
export type DocumentRecord = z.infer<typeof DocumentRecord>;

export const DocumentParams = z.object({ documentId: DocumentId });
export type DocumentParams = z.infer<typeof DocumentParams>;

export const DocumentListQuery = PageQuery.extend({
  projectId: ProjectId.optional(),
  lessonPlanId: LessonPlanId.optional(),
  kind: AssetKind.optional(),
  status: LifecycleStatus.optional(),
  sort: SortOrder.default("recent"),
});
export type DocumentListQuery = z.infer<typeof DocumentListQuery>;

export const DocumentListResponse = pageOf(DocumentRecord);
export type DocumentListResponse = z.infer<typeof DocumentListResponse>;

export const DocumentResponse = z.object({ document: DocumentRecord });
export type DocumentResponse = z.infer<typeof DocumentResponse>;

export const CreateDocumentBody = z.object({
  projectId: ProjectId,
  lessonPlanId: LessonPlanId.nullable().default(null),
  kind: AssetKind,
  title: z.string().min(1).max(300),
  subject: z.string().min(1).max(120),
  grade: z.string().min(1).max(60),
  body: DocumentBody.default({}),
});
export type CreateDocumentBody = z.infer<typeof CreateDocumentBody>;

export const UpdateDocumentBody = z.object({
  title: z.string().min(1).max(300).optional(),
  status: LifecycleStatus.optional(),
  body: DocumentBody.optional(),
  /** Recorded on the version snapshot this edit produces. */
  note: z.string().max(500).optional(),
});
export type UpdateDocumentBody = z.infer<typeof UpdateDocumentBody>;

export const PublishDocumentBody = z.object({
  note: z.string().max(500).optional(),
});
export type PublishDocumentBody = z.infer<typeof PublishDocumentBody>;

/**
 * Bulk generation. Gated server-side on the lesson design's approval — see
 * `APPROVAL_REQUIRED` in `./errors.ts`.
 */
export const GenerateMaterialsBody = z.object({
  kinds: z.array(AssetKind).min(1).max(20),
});
export type GenerateMaterialsBody = z.infer<typeof GenerateMaterialsBody>;

export const GenerateMaterialsResponse = z.object({
  jobId: z.string().min(1),
  queued: z.array(AssetKind),
});
export type GenerateMaterialsResponse = z.infer<
  typeof GenerateMaterialsResponse
>;

/* -------------------------------------------------------------------------- */
/* Resources                                                                  */
/* -------------------------------------------------------------------------- */

export const ResourceParams = z.object({ resourceId: ResourceId });
export type ResourceParams = z.infer<typeof ResourceParams>;

export const ResourceListQuery = PageQuery.extend({
  kind: AssetKind.optional(),
  status: LifecycleStatus.optional(),
  projectId: ProjectId.optional(),
  subject: z.string().min(1).max(120).optional(),
  grade: z.string().min(1).max(60).optional(),
  tag: z.string().min(1).max(60).optional(),
  sort: SortOrder.default("recent"),
});
export type ResourceListQuery = z.infer<typeof ResourceListQuery>;

export const ResourceSearchQuery = PageQuery.extend({
  q: z.string().min(1).max(200),
  kind: AssetKind.optional(),
  subject: z.string().min(1).max(120).optional(),
  grade: z.string().min(1).max(60).optional(),
});
export type ResourceSearchQuery = z.infer<typeof ResourceSearchQuery>;

export const ResourceListResponse = pageOf(Resource);
export type ResourceListResponse = z.infer<typeof ResourceListResponse>;

export const ResourceResponse = z.object({ resource: Resource });
export type ResourceResponse = z.infer<typeof ResourceResponse>;

/* -------------------------------------------------------------------------- */
/* Operational endpoints                                                      */
/* -------------------------------------------------------------------------- */

export const HealthResponse = z.object({
  status: z.literal("ok"),
  uptimeSeconds: z.number().nonnegative(),
});
export type HealthResponse = z.infer<typeof HealthResponse>;

export const ReadyResponse = z.object({
  status: z.enum(["ready", "degraded"]),
  checks: z.object({ database: z.enum(["up", "down"]) }),
});
export type ReadyResponse = z.infer<typeof ReadyResponse>;
