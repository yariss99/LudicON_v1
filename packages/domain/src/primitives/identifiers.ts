import { z } from "zod";

/**
 * Branded id types.
 *
 * The pre-refactor codebase used bare `string` for every id, which let a
 * `projectId` be passed where a `lessonId` was expected with no compiler
 * complaint. Branding costs nothing at runtime and makes those swaps errors.
 */
function brandedId<TBrand extends string>(brand: TBrand) {
  return z
    .string()
    .min(1)
    .max(128)
    .brand<TBrand>()
    .describe(`${brand} identifier`);
}

export const TeacherId = brandedId("TeacherId");
export const ProjectId = brandedId("ProjectId");
export const LessonPlanId = brandedId("LessonPlanId");
export const DocumentId = brandedId("DocumentId");
export const VersionId = brandedId("VersionId");
export const ResourceId = brandedId("ResourceId");
export const BlockId = brandedId("BlockId");
export const OrganizationId = brandedId("OrganizationId");

export type TeacherId = z.infer<typeof TeacherId>;
export type ProjectId = z.infer<typeof ProjectId>;
export type LessonPlanId = z.infer<typeof LessonPlanId>;
export type DocumentId = z.infer<typeof DocumentId>;
export type VersionId = z.infer<typeof VersionId>;
export type ResourceId = z.infer<typeof ResourceId>;
export type BlockId = z.infer<typeof BlockId>;
export type OrganizationId = z.infer<typeof OrganizationId>;

/** ISO-8601 instant. Stored as a string so it survives JSON round-trips unchanged. */
export const Timestamp = z.iso
  .datetime({ offset: true })
  .describe("ISO-8601 timestamp");
export type Timestamp = z.infer<typeof Timestamp>;

export const nowTimestamp = (): Timestamp =>
  new Date().toISOString() as Timestamp;
