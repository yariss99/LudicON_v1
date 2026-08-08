import { z } from "zod";
import {
  DocumentId,
  ProjectId,
  ResourceId,
  TeacherId,
  Timestamp,
} from "../primitives/identifiers.js";
import { AssetKind, LifecycleStatus } from "../primitives/shared.js";

/** A library item: something generated, uploaded, or shared into the teacher's collection. */
export const Resource = z.object({
  id: ResourceId,
  ownerId: TeacherId,
  projectId: ProjectId.nullable(),
  /**
   * The artifact this shelf entry stands for.
   *
   * `null` for something uploaded or shared in from outside. When it is set,
   * the library opens the real document instead of describing a second one —
   * the database has carried this column since the first migration; the domain
   * simply had not modelled it.
   */
  documentId: DocumentId.nullable().default(null),
  kind: AssetKind,
  title: z.string().min(1).max(300),
  summary: z.string().max(1000).default(""),
  subject: z.string().max(120).default(""),
  grade: z.string().max(60).default(""),
  tags: z.array(z.string().max(60)).default([]),
  status: LifecycleStatus.default("draft"),
  /** Usage signals, used for "continue working" and recommendations. */
  openedAt: Timestamp.nullable().default(null),
  reuseCount: z.number().int().nonnegative().default(0),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});
export type Resource = z.infer<typeof Resource>;

export const ResourcePatch = Resource.omit({
  id: true,
  ownerId: true,
  createdAt: true,
}).partial();
export type ResourcePatch = z.infer<typeof ResourcePatch>;

/** Collections are the Desk's shelves — a curated grouping, not a folder. */
export const Collection = z.object({
  id: z.string().min(1),
  ownerId: TeacherId,
  label: z.string().min(1).max(120),
  resourceIds: z.array(ResourceId).default([]),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});
export type Collection = z.infer<typeof Collection>;
