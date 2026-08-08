import { z } from "zod";
import {
  DocumentId,
  LessonPlanId,
  ProjectId,
  Timestamp,
  VersionId,
} from "../primitives/identifiers.js";
import {
  Actor,
  AssetKind,
  LifecycleStatus,
  ValidationReport,
} from "../primitives/shared.js";

/**
 * ONE document envelope.
 *
 * The pre-refactor tree repeated this 14-field header five times — as
 * LessonDocument, AssessmentDocument, StoryDocument, GameDocument and
 * PresentationDocument — differing only in their ~8 body fields (and one
 * gratuitous inconsistency where PresentationDocument made `lessonId`
 * optional while the other four required it).
 *
 * Concrete documents are now `DocumentEnvelope & { body: <specific> }`,
 * produced by `documentSchema()` below.
 */
export const DocumentEnvelope = z.object({
  id: DocumentId,
  projectId: ProjectId,
  lessonPlanId: LessonPlanId.nullable(),
  kind: AssetKind,
  status: LifecycleStatus,
  /** Monotonic, incremented on each persisted change. Drives version history. */
  version: z.number().int().nonnegative(),
  title: z.string().min(1).max(300),
  subject: z.string().min(1).max(120),
  grade: z.string().min(1).max(60),
  validation: ValidationReport.nullable(),
  createdAt: Timestamp,
  updatedAt: Timestamp,
  publishedAt: Timestamp.nullable(),
  createdBy: Actor,
});
export type DocumentEnvelope = z.infer<typeof DocumentEnvelope>;

/**
 * Builds a concrete document schema from a body schema.
 *
 * `documentSchema(LessonPlanBody)` replaces what used to be a hand-written
 * 14-field interface per asset type.
 */
export function documentSchema<TBody extends z.ZodType>(body: TBody) {
  return DocumentEnvelope.extend({ body });
}

export type Document<TBody> = DocumentEnvelope & { body: TBody };

/**
 * ONE version snapshot wrapper.
 *
 * Replaces seven identical copies (LessonVersion, AssessmentVersion,
 * StoryVersion, GameVersion, PresentationVersion, ResourceVersion,
 * ArtifactVersion) that differed only in the name of their foreign key.
 */
export function versionSchema<TSnapshot extends z.ZodType>(
  snapshot: TSnapshot,
) {
  return z.object({
    id: VersionId,
    documentId: DocumentId,
    projectId: ProjectId,
    version: z.number().int().nonnegative(),
    snapshot,
    createdAt: Timestamp,
    actor: Actor,
    note: z.string().max(500).optional(),
  });
}

export type Version<TSnapshot> = {
  id: VersionId;
  documentId: DocumentId;
  projectId: ProjectId;
  version: number;
  snapshot: TSnapshot;
  createdAt: Timestamp;
  actor: Actor;
  note?: string;
};

/**
 * A body-agnostic view of a document.
 *
 * Surfaces that list every kind at once — the library, the project workspace,
 * and the cascade that deletes a project's contents — cannot parse against one
 * body schema. `z.unknown()` accepts any body while still validating the
 * fourteen-field envelope all of them share.
 */
export const AnyDocument = DocumentEnvelope.extend({ body: z.unknown() });
export type AnyDocument = z.infer<typeof AnyDocument>;

/** The same, for version snapshots. */
export const AnyVersion = versionSchema(AnyDocument);
export type AnyVersion = z.infer<typeof AnyVersion>;
