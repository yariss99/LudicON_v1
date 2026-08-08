/**
 * PostgreSQL schema.
 *
 * The domain package owns the vocabulary; this file owns its physical shape.
 * Where a domain union is stable enough to be worth database-level integrity it
 * becomes a `pgEnum`, and `SCHEMA_ENUMS_MATCH_DOMAIN` at the bottom of this file
 * is a compile-time proof that the two never drift apart — adding a value to
 * `AssetKind` without adding a migration becomes a type error, not a
 * constraint violation discovered in production.
 */
import type {
  CompletionState,
  DesignScore,
  LessonSectionId,
  PlannedMaterial,
  ValidationReport,
} from "@ludicon/domain";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  ACTOR_VALUES,
  ASSET_KIND_VALUES,
  COMPLETION_STATE_VALUES,
  DISCIPLINE_VALUES,
  GRADE_LEVEL_VALUES,
  LESSON_SECTION_VALUES,
  LIFECYCLE_STATUS_VALUES,
  PROJECT_COLOR_VALUES,
  PROJECT_STATE_VALUES,
  SCHEMA_ENUMS_MATCH_DOMAIN,
} from "./enums.js";

export const actorEnum = pgEnum("actor", ACTOR_VALUES);
export const disciplineEnum = pgEnum("discipline", DISCIPLINE_VALUES);
export const lifecycleStatusEnum = pgEnum(
  "lifecycle_status",
  LIFECYCLE_STATUS_VALUES,
);
export const assetKindEnum = pgEnum("asset_kind", ASSET_KIND_VALUES);
export const gradeLevelEnum = pgEnum("grade_level", GRADE_LEVEL_VALUES);
export const projectStateEnum = pgEnum("project_state", PROJECT_STATE_VALUES);
export const projectColorEnum = pgEnum("project_color", PROJECT_COLOR_VALUES);
export const lessonSectionEnum = pgEnum(
  "lesson_section",
  LESSON_SECTION_VALUES,
);
export const completionStateEnum = pgEnum(
  "completion_state",
  COMPLETION_STATE_VALUES,
);

/** Re-exported so importing the schema is enough to enforce the drift check. */
export { SCHEMA_ENUMS_MATCH_DOMAIN };

/** Columns every mutable row carries. Kept as a helper, not a base table. */
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/* -------------------------------------------------------------------------- */
/* Teachers                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The local projection of an identity owned by Clerk. `id` is the Clerk user
 * id, so the identity provider stays the source of truth for credentials while
 * every foreign key in this database stays local and enforceable.
 */
export const teachers = pgTable(
  "teachers",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id"),
    // Nullable: a session token does not carry an email, so the row is created
    // on first use from the token alone and enriched later by a Clerk webhook.
    // Postgres does not treat NULLs as equal, so the unique index still holds.
    email: text("email"),
    displayName: text("display_name").notNull().default(""),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("teachers_email_key").on(table.email),
    index("teachers_organization_id_idx").on(table.organizationId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    organizationId: text("organization_id"),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    subject: text("subject").notNull(),
    grade: gradeLevelEnum("grade").notNull(),
    /** What the teacher set out to make. Was a prefix on `title` until now. */
    intendedKind: assetKindEnum("intended_kind")
      .notNull()
      .default("lesson_plan"),
    plannedMaterials: jsonb("planned_materials")
      .$type<PlannedMaterial[]>()
      .notNull()
      .default([]),
    color: projectColorEnum("color").notNull().default("blue"),
    state: projectStateEnum("state").notNull().default("discovery"),
    favorite: boolean("favorite").notNull().default(false),
    archived: boolean("archived").notNull().default(false),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    // The Desk's default query: this teacher's live projects, most recent first.
    index("projects_owner_updated_idx").on(
      table.ownerId,
      table.updatedAt,
      table.id,
    ),
    index("projects_owner_state_idx").on(table.ownerId, table.state),
    index("projects_organization_id_idx").on(table.organizationId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Evaluation papers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * One A4 evaluation paper: the printable document and the barem that marks it.
 *
 * **The whole document is ONE `jsonb` column, not four tables.** `pages`,
 * `sections`, `blocks` and `answerKey` are flat records in the model, which
 * looks like an invitation to normalise them the way `pedagogical_blocks`
 * normalises a lesson design. Four reasons it is the wrong shape here:
 *
 *  - the client's write is the WHOLE document. `DataProvider.put` replaces a
 *    record at an id; the command layer produces a new document per edit and
 *    emits no field diff. Split across tables, every autosave becomes a diff of
 *    four row sets — or a delete-and-reinsert of every block on the paper —
 *    where this is one `UPDATE`;
 *  - the consistency unit is the document. `pageOrder`, `sectionOrder` and
 *    `blockOrder` are arrays that must agree with three id-keyed records, and
 *    `model/project.ts` is explicit that the command layer maintains that, not
 *    the type. Tables would enforce a DIFFERENT integrity — foreign keys per
 *    row, order arrays still opaque — so the database and the model would
 *    disagree about which documents are valid;
 *  - the leaves are opaque on purpose. `ExerciseBlock.config` and
 *    `AnswerEntry.answer` are `unknown`, owned by the exercise registry, so a
 *    `blocks` table would buy typed columns for `id` and `kind` and hold the
 *    rest as `jsonb` regardless;
 *  - nothing queries across papers at block granularity. Every read is "this
 *    paper" or "this teacher's papers", and a relational split would pay four
 *    joins per open for a question no caller asks.
 *
 * The columns beside it are a PROJECTION of the document, existing only to be
 * filtered and ordered by. They are derived at the single write site
 * (`toEvaluationProjectRow`) and never read back into a response — the document
 * is the one source of truth on the way out. That is the honest version of the
 * redundancy: it cannot drift while there is exactly one writer, and if a second
 * one ever appears, this is the comment that says why there must not be.
 *
 * Revisit the shape when a query has to address a block across papers, or when
 * two people edit one paper at once — a whole-document replace is last-write-
 * wins, and that is the real ceiling on this design rather than the column type.
 */
export const evaluationProjects = pgTable(
  "evaluation_projects",
  {
    // Text, not uuid: the id is minted in the browser by
    // `createEvaluationProject` before the paper has ever been sent, and
    // `EvaluationProjectId` is a 1..128 string rather than a uuid. Same reason
    // `pedagogical_blocks.id` is text — the client's id IS the identity.
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    /** Lets a future reader find papers an older parser wrote. */
    schemaVersion: integer("schema_version").notNull().default(1),
    /** Projection of `meta.title`. Empty until the teacher names the paper. */
    title: text("title").notNull().default(""),
    /** Projections of `meta.discipline` / `meta.grade`, both nullable there. */
    discipline: disciplineEnum("discipline"),
    grade: gradeLevelEnum("grade"),
    archived: boolean("archived").notNull().default(false),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    /**
     * The `EvaluationProject`, verbatim.
     *
     * Deliberately NOT `$type<EvaluationProject>()`. That would be a claim the
     * database cannot keep — nothing stops a row from predating a schema change
     * — and it would let a handler return unparsed jsonb wearing the document's
     * type. `unknown` forces the `EvaluationProject.parse` in the service,
     * which is the only thing that can actually make the claim true.
     */
    document: jsonb("document").notNull(),
    ...timestamps,
  },
  (table) => [
    // The studio's default query: this teacher's papers, most recent first.
    // Ends in `id` because the keyset cursor compares `(sortKey, id)` as a pair.
    index("evaluation_projects_owner_updated_idx").on(
      table.ownerId,
      table.updatedAt,
      table.id,
    ),
    // The active/archive split, which is the only other list the studio renders.
    index("evaluation_projects_owner_archived_idx").on(
      table.ownerId,
      table.archived,
      table.updatedAt,
    ),
  ],
);

/* -------------------------------------------------------------------------- */
/* Lesson plans                                                               */
/* -------------------------------------------------------------------------- */

/**
 * One lesson design per project, enforced by a unique index rather than by
 * convention. `approvedAt` is the approval gate: null means nothing downstream
 * may be generated.
 */
export const lessonPlans = pgTable(
  "lesson_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    subject: text("subject").notNull(),
    grade: text("grade").notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(45),
    completion: jsonb("completion")
      .$type<Partial<Record<LessonSectionId, CompletionState>>>()
      .notNull()
      .default({}),
    score: jsonb("score").$type<DesignScore>(),
    validation: jsonb("validation").$type<ValidationReport>(),
    status: lifecycleStatusEnum("status").notNull().default("draft"),
    version: integer("version").notNull().default(0),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: text("approved_by").references(() => teachers.id, {
      onDelete: "set null",
    }),
    approvalNote: text("approval_note"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("lesson_plans_project_id_key").on(table.projectId),
    index("lesson_plans_approved_at_idx").on(table.approvedAt),
  ],
);

export const pedagogicalBlocks = pgTable(
  "pedagogical_blocks",
  {
    // Text, not uuid: blocks are authored on the canvas and carry the id the
    // client gave them, so dragging a block does not change its identity.
    id: text("id").primaryKey(),
    lessonPlanId: uuid("lesson_plan_id")
      .notNull()
      .references(() => lessonPlans.id, { onDelete: "cascade" }),
    section: lessonSectionEnum("section").notNull(),
    title: text("title").notNull(),
    purpose: text("purpose").notNull().default(""),
    estimatedMinutes: integer("estimated_minutes"),
    objectives: jsonb("objectives").$type<string[]>().notNull().default([]),
    competencies: jsonb("competencies").$type<string[]>().notNull().default([]),
    strategy: text("strategy").notNull().default(""),
    resources: jsonb("resources").$type<string[]>().notNull().default([]),
    notes: text("notes").notNull().default(""),
    status: lifecycleStatusEnum("status").notNull().default("draft"),
    /** `order` is reserved in SQL; the column is named explicitly. */
    orderIndex: integer("order_index").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("pedagogical_blocks_plan_section_idx").on(
      table.lessonPlanId,
      table.section,
      table.orderIndex,
    ),
  ],
);

/* -------------------------------------------------------------------------- */
/* Documents                                                                  */
/* -------------------------------------------------------------------------- */

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    lessonPlanId: uuid("lesson_plan_id").references(() => lessonPlans.id, {
      onDelete: "set null",
    }),
    kind: assetKindEnum("kind").notNull(),
    status: lifecycleStatusEnum("status").notNull().default("draft"),
    version: integer("version").notNull().default(0),
    title: text("title").notNull(),
    subject: text("subject").notNull(),
    grade: text("grade").notNull(),
    body: jsonb("body").$type<Record<string, unknown>>().notNull().default({}),
    validation: jsonb("validation").$type<ValidationReport>(),
    createdBy: actorEnum("created_by").notNull().default("teacher"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("documents_project_updated_idx").on(
      table.projectId,
      table.updatedAt,
      table.id,
    ),
    index("documents_project_kind_idx").on(table.projectId, table.kind),
    index("documents_lesson_plan_id_idx").on(table.lessonPlanId),
    index("documents_status_idx").on(table.status),
  ],
);

/**
 * Append-only snapshots. Written in the same transaction as the document they
 * describe, so a version can never exist for a state that was never persisted —
 * and a persisted state can never lack its version row.
 */
export const documentVersions = pgTable(
  "document_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    actor: actorEnum("actor").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("document_versions_document_version_key").on(
      table.documentId,
      table.version,
    ),
    index("document_versions_project_id_idx").on(table.projectId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Library                                                                    */
/* -------------------------------------------------------------------------- */

export const resources = pgTable(
  "resources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    documentId: uuid("document_id").references(() => documents.id, {
      onDelete: "set null",
    }),
    kind: assetKindEnum("kind").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    subject: text("subject").notNull().default(""),
    grade: text("grade").notNull().default(""),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    status: lifecycleStatusEnum("status").notNull().default("draft"),
    openedAt: timestamp("opened_at", { withTimezone: true }),
    reuseCount: integer("reuse_count").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("resources_owner_updated_idx").on(
      table.ownerId,
      table.updatedAt,
      table.id,
    ),
    index("resources_owner_kind_idx").on(table.ownerId, table.kind),
    index("resources_project_id_idx").on(table.projectId),
    index("resources_title_idx").on(table.title),
  ],
);

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    ...timestamps,
  },
  (table) => [index("collections_owner_id_idx").on(table.ownerId)],
);

/**
 * The domain models a collection's contents as an ordered id list. Persisting
 * it as a join table keeps the reference an actual foreign key, so deleting a
 * resource cannot leave a dangling id inside a JSON array.
 */
export const collectionItems = pgTable(
  "collection_items",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    addedAt: timestamp("added_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.collectionId, table.resourceId] }),
    index("collection_items_collection_position_idx").on(
      table.collectionId,
      table.position,
    ),
  ],
);

/* -------------------------------------------------------------------------- */
/* Row types                                                                  */
/* -------------------------------------------------------------------------- */

export type TeacherRow = typeof teachers.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type ProjectInsert = typeof projects.$inferInsert;
export type EvaluationProjectRow = typeof evaluationProjects.$inferSelect;
export type EvaluationProjectInsert = typeof evaluationProjects.$inferInsert;
export type LessonPlanRow = typeof lessonPlans.$inferSelect;
export type LessonPlanInsert = typeof lessonPlans.$inferInsert;
export type PedagogicalBlockRow = typeof pedagogicalBlocks.$inferSelect;
export type PedagogicalBlockInsert = typeof pedagogicalBlocks.$inferInsert;
export type DocumentRow = typeof documents.$inferSelect;
export type DocumentInsert = typeof documents.$inferInsert;
export type DocumentVersionRow = typeof documentVersions.$inferSelect;
export type ResourceRow = typeof resources.$inferSelect;
