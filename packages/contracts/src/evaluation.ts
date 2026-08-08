/**
 * Wire contracts for the A4 evaluation paper.
 *
 * The document schema is IMPORTED from `@ludicon/evaluation`, never restated.
 * Restating it here was the obvious alternative and it is the exact mistake this
 * package exists to prevent: the browser, the PDF worker and the API would each
 * hold an opinion about what a paper is, and the first divergence would show up
 * as a paper that saves and then fails to open. One schema, three readers.
 *
 * The transport is a whole-document REPLACE at a client-chosen id, so this file
 * declares a `Put…Body` and no `Create…`/`Patch…` pair. That is a property of
 * the model rather than a preference: `createEvaluationProject` mints the id in
 * the browser before the document has ever been sent, and every edit goes
 * through the command layer, which yields a new whole document rather than a
 * field diff. A POST that assigned a second identity, or a PATCH over fields the
 * command layer never emits, would both be endpoints the client cannot use.
 *
 * The three server-owned fields are OMITTED from the request body rather than
 * ignored by the service. Zod strips unknown keys, so a client that sends its
 * own `ownerId` has it dropped at the boundary — "never accepted from the
 * client" becomes structural instead of a rule someone has to keep remembering
 * in the service layer.
 */
import { Discipline, GradeLevel, TeacherId } from "@ludicon/domain";
import { EvaluationProject, EvaluationProjectId } from "@ludicon/evaluation";
import { z } from "zod";

import { PageQuery, pageOf, SortOrder } from "./http.js";

export const EvaluationProjectParams = z.object({
  evaluationProjectId: EvaluationProjectId,
});
export type EvaluationProjectParams = z.infer<typeof EvaluationProjectParams>;

/**
 * `archived` is OPTIONAL here and defaults to `false` on `ProjectListQuery`.
 *
 * The divergence is deliberate. The papers list has an archive view that shows
 * both — `EvaluationProjectRepository.listAll` — and a default of `false` would
 * make that view unreachable over HTTP while looking like it worked, since a
 * filtered list is indistinguishable from a short one. Absent means "both".
 *
 * `ownerId` can only ever NARROW: the service intersects it with the session, so
 * asking for another teacher's papers returns an empty page rather than theirs.
 * It is accepted at all because `listForOwner` passes it, and a filter the
 * server silently drops is the failure mode `api-surface.ts` documents.
 */
export const EvaluationProjectListQuery = PageQuery.extend({
  ownerId: TeacherId.optional(),
  discipline: Discipline.optional(),
  grade: GradeLevel.optional(),
  /** Query strings carry booleans as text; `stringbool` decodes "true"/"1"/"yes". */
  archived: z.stringbool().optional(),
  sort: SortOrder.default("recent"),
});
export type EvaluationProjectListQuery = z.infer<
  typeof EvaluationProjectListQuery
>;

export const EvaluationProjectListResponse = pageOf(EvaluationProject);
export type EvaluationProjectListResponse = z.infer<
  typeof EvaluationProjectListResponse
>;

export const EvaluationProjectResponse = z.object({
  evaluationProject: EvaluationProject,
});
export type EvaluationProjectResponse = z.infer<
  typeof EvaluationProjectResponse
>;

/**
 * The document as a client may send it.
 *
 * `id` stays IN the body even though the URL already carries it. Two statements
 * of one fact, reconciled loudly: the service refuses a body whose id disagrees
 * with the path instead of picking a winner. Omitting it was the alternative,
 * and it turns "the client addressed the wrong paper" — a real bug, since the id
 * is also the key every client-side cache is filed under — into a silent
 * write at whichever id the URL happened to hold.
 *
 * `ownerId`, `createdAt` and `updatedAt` are the server's to decide. `ownerId`
 * comes from the session; `createdAt` is the first write's clock and is
 * preserved verbatim on every later one; `updatedAt` is stamped here because the
 * API is now the persistence boundary the model's `touch` talks about.
 */
export const PutEvaluationProjectBody = EvaluationProject.omit({
  ownerId: true,
  createdAt: true,
  updatedAt: true,
});
export type PutEvaluationProjectBody = z.infer<typeof PutEvaluationProjectBody>;

/**
 * Deleting a paper takes everything it contains with it, because everything it
 * contains is INSIDE it: pages, sections, blocks and the barem are fields of one
 * row, and no other table carries an `EvaluationProjectId`. There is no cascade
 * to get wrong here, which is why this response says `deleted` and not
 * `deletedCount`.
 */
export const DeleteEvaluationProjectResponse = z.object({
  deleted: z.literal(true),
  id: EvaluationProjectId,
});
export type DeleteEvaluationProjectResponse = z.infer<
  typeof DeleteEvaluationProjectResponse
>;
