/**
 * Relational metadata for Drizzle's query API.
 *
 * Split from `schema.ts` so the table definitions stay readable on their own:
 * one file answers "what does the database look like", this one answers "how do
 * the tables reach each other". `db/client.ts` passes both to `drizzle()` as a
 * single schema object.
 *
 * These declarations are for the relational query builder only — the actual
 * referential integrity lives in the `.references()` clauses on the columns.
 */
import { relations } from "drizzle-orm";

import {
  collectionItems,
  collections,
  documents,
  documentVersions,
  evaluationProjects,
  lessonPlans,
  pedagogicalBlocks,
  projects,
  resources,
  teachers,
} from "./schema.js";

export const teachersRelations = relations(teachers, ({ many }) => ({
  projects: many(projects),
  evaluationProjects: many(evaluationProjects),
  resources: many(resources),
  collections: many(collections),
}));

/**
 * An evaluation paper reaches exactly one other table.
 *
 * Everything it contains — pages, sections, blocks, the barem — lives inside its
 * own `document` column, so there is nothing else to declare here. That is the
 * relational statement of what `schema.ts` argues for at length, and if this
 * ever grows a `many(...)`, the single-jsonb decision has been reversed.
 */
export const evaluationProjectsRelations = relations(
  evaluationProjects,
  ({ one }) => ({
    owner: one(teachers, {
      fields: [evaluationProjects.ownerId],
      references: [teachers.id],
    }),
  }),
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(teachers, {
    fields: [projects.ownerId],
    references: [teachers.id],
  }),
  lessonPlan: one(lessonPlans),
  documents: many(documents),
  resources: many(resources),
}));

export const lessonPlansRelations = relations(lessonPlans, ({ one, many }) => ({
  project: one(projects, {
    fields: [lessonPlans.projectId],
    references: [projects.id],
  }),
  approver: one(teachers, {
    fields: [lessonPlans.approvedBy],
    references: [teachers.id],
  }),
  blocks: many(pedagogicalBlocks),
  documents: many(documents),
}));

export const pedagogicalBlocksRelations = relations(
  pedagogicalBlocks,
  ({ one }) => ({
    lessonPlan: one(lessonPlans, {
      fields: [pedagogicalBlocks.lessonPlanId],
      references: [lessonPlans.id],
    }),
  }),
);

export const documentsRelations = relations(documents, ({ one, many }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
  lessonPlan: one(lessonPlans, {
    fields: [documents.lessonPlanId],
    references: [lessonPlans.id],
  }),
  versions: many(documentVersions),
}));

export const documentVersionsRelations = relations(
  documentVersions,
  ({ one }) => ({
    document: one(documents, {
      fields: [documentVersions.documentId],
      references: [documents.id],
    }),
    project: one(projects, {
      fields: [documentVersions.projectId],
      references: [projects.id],
    }),
  }),
);

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  owner: one(teachers, {
    fields: [resources.ownerId],
    references: [teachers.id],
  }),
  project: one(projects, {
    fields: [resources.projectId],
    references: [projects.id],
  }),
  document: one(documents, {
    fields: [resources.documentId],
    references: [documents.id],
  }),
  collectionItems: many(collectionItems),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  owner: one(teachers, {
    fields: [collections.ownerId],
    references: [teachers.id],
  }),
  items: many(collectionItems),
}));

export const collectionItemsRelations = relations(
  collectionItems,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionItems.collectionId],
      references: [collections.id],
    }),
    resource: one(resources, {
      fields: [collectionItems.resourceId],
      references: [resources.id],
    }),
  }),
);
