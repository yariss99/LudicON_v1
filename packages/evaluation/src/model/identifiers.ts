import { z } from "zod";

/**
 * Branded ids for the evaluation document.
 *
 * Every brand string here is prefixed `Evaluation*` even where the exported
 * name is short. `@ludicon/domain` already exports a `BlockId` — for the
 * pedagogical blocks of a lesson design — and those two kinds of block share
 * nothing but a word. Branding both as `"BlockId"` would make them structurally
 * interchangeable, so a lesson block id could be handed to `removeBlock` on an
 * evaluation paper and compile. That is the exact class of bug branding exists
 * to catch, so the brands diverge while the call-site names stay short.
 *
 * The `brandedId` helper is copied from
 * `packages/domain/src/primitives/identifiers.ts` rather than imported: it is
 * private there, and widening that package's public API to share six lines
 * would couple two packages for no gain.
 */
function brandedId<TBrand extends string>(brand: TBrand) {
  return z
    .string()
    .min(1)
    .max(128)
    .brand<TBrand>()
    .describe(`${brand} identifier`);
}

export const EvaluationProjectId = brandedId("EvaluationProjectId");
export const PageId = brandedId("EvaluationPageId");
export const SectionId = brandedId("EvaluationSectionId");
export const ColumnId = brandedId("EvaluationColumnId");
export const BlockId = brandedId("EvaluationBlockId");

export type EvaluationProjectId = z.infer<typeof EvaluationProjectId>;
export type PageId = z.infer<typeof PageId>;
export type SectionId = z.infer<typeof SectionId>;
export type ColumnId = z.infer<typeof ColumnId>;
export type BlockId = z.infer<typeof BlockId>;
