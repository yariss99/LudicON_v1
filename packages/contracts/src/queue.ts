/**
 * Queue contracts.
 *
 * The API enqueues, the worker dequeues, and neither imports the other. This
 * module is the only thing they share, so a payload change is a compile error
 * on both sides rather than a runtime surprise in production.
 *
 * `JobPayload` is discriminated on `name` so a worker can `switch (job.name)`
 * and have the compiler prove the switch is exhaustive.
 */
import {
  AssetKind,
  DocumentId,
  LessonPlanId,
  ProjectId,
  TeacherId,
  Timestamp,
} from "@ludicon/domain";
import { z } from "zod";

import { ApiError } from "./errors.js";

/* -------------------------------------------------------------------------- */
/* Queues                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Redis key namespaces. Prefixed so LudicON's queues can share a Redis instance
 * with anything else without a key collision.
 */
export const QUEUE_NAMES = {
  GENERATE_MATERIALS: "ludicon.generate-materials",
  EXPORT_DOCUMENT: "ludicon.export-document",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const JOB_NAMES = {
  GENERATE_MATERIALS: "generate_materials",
  EXPORT_DOCUMENT: "export_document",
} as const;

export const JobName = z.enum([
  JOB_NAMES.GENERATE_MATERIALS,
  JOB_NAMES.EXPORT_DOCUMENT,
]);
export type JobName = z.infer<typeof JobName>;

/** Which queue carries which job. */
export const QUEUE_FOR_JOB: Readonly<Record<JobName, QueueName>> =
  Object.freeze({
    [JOB_NAMES.GENERATE_MATERIALS]: QUEUE_NAMES.GENERATE_MATERIALS,
    [JOB_NAMES.EXPORT_DOCUMENT]: QUEUE_NAMES.EXPORT_DOCUMENT,
  });

/* -------------------------------------------------------------------------- */
/* Job payloads                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Produce materials for an approved lesson design.
 *
 * `lessonPlanId` is required, not optional: the approval gate lives on the
 * lesson design, so a generation job that cannot name its design cannot be
 * authorised. The API refuses to enqueue one before `approvedAt` is set.
 */
export const GenerateMaterialsJob = z.object({
  projectId: ProjectId,
  lessonPlanId: LessonPlanId,
  kinds: z.array(AssetKind).min(1).max(20),
  requestedBy: TeacherId,
  requestedAt: Timestamp,
  /** Echoed into worker logs so a job traces back to the originating request. */
  requestId: z.string().min(1).max(128).optional(),
});
export type GenerateMaterialsJob = z.infer<typeof GenerateMaterialsJob>;

export const ExportFormat = z.enum(["pdf", "docx", "html", "markdown"]);
export type ExportFormat = z.infer<typeof ExportFormat>;

export const ExportDocumentJob = z.object({
  documentId: DocumentId,
  format: ExportFormat,
  requestedBy: TeacherId,
  requestedAt: Timestamp,
  requestId: z.string().min(1).max(128).optional(),
});
export type ExportDocumentJob = z.infer<typeof ExportDocumentJob>;

export const GenerateMaterialsPayload = z.object({
  name: z.literal(JOB_NAMES.GENERATE_MATERIALS),
  data: GenerateMaterialsJob,
});
export type GenerateMaterialsPayload = z.infer<typeof GenerateMaterialsPayload>;

export const ExportDocumentPayload = z.object({
  name: z.literal(JOB_NAMES.EXPORT_DOCUMENT),
  data: ExportDocumentJob,
});
export type ExportDocumentPayload = z.infer<typeof ExportDocumentPayload>;

export const JobPayload = z.discriminatedUnion("name", [
  GenerateMaterialsPayload,
  ExportDocumentPayload,
]);
export type JobPayload = z.infer<typeof JobPayload>;

/** Maps a job name to its payload type, for typed producers. */
export type JobDataFor<TName extends JobName> = Extract<
  JobPayload,
  { name: TName }
>["data"];

/* -------------------------------------------------------------------------- */
/* Job results                                                                */
/* -------------------------------------------------------------------------- */

export const JobCompleted = z.object({
  outcome: z.literal("completed"),
  name: JobName,
  finishedAt: Timestamp,
  /** Documents created or rewritten by this job. */
  documentIds: z.array(DocumentId).default([]),
});
export type JobCompleted = z.infer<typeof JobCompleted>;

/**
 * A failed job still carries a teacher-safe `ApiError`, because the failure
 * surfaces in the interface as a notification. The stack trace stays in the
 * worker's logs.
 */
export const JobFailed = z.object({
  outcome: z.literal("failed"),
  name: JobName,
  finishedAt: Timestamp,
  error: ApiError,
});
export type JobFailed = z.infer<typeof JobFailed>;

/** Nothing to do — e.g. every requested material already exists and is current. */
export const JobSkipped = z.object({
  outcome: z.literal("skipped"),
  name: JobName,
  finishedAt: Timestamp,
  reason: z.string().min(1).max(300),
});
export type JobSkipped = z.infer<typeof JobSkipped>;

export const JobResult = z.discriminatedUnion("outcome", [
  JobCompleted,
  JobFailed,
  JobSkipped,
]);
export type JobResult = z.infer<typeof JobResult>;
