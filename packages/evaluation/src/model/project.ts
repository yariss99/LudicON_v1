import { Discipline, GradeLevel, TeacherId, Timestamp } from "@ludicon/domain";
import { z } from "zod";
import { DEFAULT_THEME } from "../theme/default-theme.js";
import { Theme } from "../theme/theme.js";
import { AnswerEntry } from "./answer-key.js";
import { Block } from "./blocks.js";
import {
  BlockId,
  EvaluationProjectId,
  PageId,
  SectionId,
} from "./identifiers.js";
import { Page, PageSetup } from "./page.js";
import { Section } from "./section.js";

/**
 * An evaluation project: one A4 paper for pupils, plus the barem that marks it.
 *
 * The document is NORMALISED — `pages`, `sections` and `blocks` are flat records
 * keyed by id, and containment is expressed as arrays of ids. The obvious
 * alternative, a tree of nested children, was rejected for three reasons that
 * all show up in the editor:
 *
 *  - selection is O(1) here and O(depth) in a tree, and the canvas resolves the
 *    selected block on every pointer move;
 *  - a move is a change to two arrays; in a tree it is a splice of two subtrees,
 *    which means rewriting every ancestor of both;
 *  - an undo diff is one record entry and one array; in a tree it is the whole
 *    branch, so the 100-entry history would hold 100 copies of the document.
 *
 * The cost is that referential integrity is not enforced by the type — a
 * `pageOrder` entry can point at a page that is not in `pages`. That is what
 * `../validation` and the command layer are for: mutations go through
 * invertible commands that maintain both sides, never through field writes.
 */

/**
 * Bumped when a stored document can no longer be read by the current parser.
 * Additive changes — a new block kind, a new theme token — do not bump it,
 * because an old document still parses; only a rename or a removal does.
 */
export const EVALUATION_SCHEMA_VERSION = 1;

/**
 * `discipline` and `grade` are NULLABLE, unlike `@ludicon/domain`'s `Project`
 * where they are required.
 *
 * A teacher opens a blank paper and starts typing questions; forcing them to
 * pick a discipline before the document can exist is the kind of gate the
 * product does not put in front of people. Nullable also makes the "you have
 * not chosen a discipline" validation issue reachable — with a required field
 * that check could never fire, and a check that cannot fire is a lie in the
 * checklist the teacher is reading.
 *
 * The same reasoning applies to `title`: it defaults to empty rather than
 * `min(1)`, and the validator asks for it before printing.
 */
export const EvaluationMeta = z.object({
  title: z.string().max(200).default(""),
  description: z.string().max(2000).default(""),
  discipline: Discipline.nullable().default(null),
  grade: GradeLevel.nullable().default(null),
  durationMinutes: z.number().int().min(0).max(600).default(50),
  /** Printed on the paper when set; falls back to the owner's name in the app. */
  author: z.string().max(200).nullable().default(null),
});
export type EvaluationMeta = z.infer<typeof EvaluationMeta>;

export const EvaluationProject = z.object({
  id: EvaluationProjectId,
  ownerId: TeacherId,
  schemaVersion: z.number().int().positive().default(EVALUATION_SCHEMA_VERSION),
  meta: EvaluationMeta.prefault({}),
  theme: Theme.default(DEFAULT_THEME),
  pageSetup: PageSetup.prefault({}),
  /** Print order. The single source of truth for "which page is page 2". */
  pageOrder: z.array(PageId).default([]),
  pages: z.record(PageId, Page).default({}),
  sections: z.record(SectionId, Section).default({}),
  blocks: z.record(BlockId, Block).default({}),
  /** Keyed by the exercise block's id — see `./answer-key.ts`. */
  answerKey: z.record(BlockId, AnswerEntry).default({}),
  archived: z.boolean().default(false),
  /** When it was put away. `null` whenever `archived` is false. */
  archivedAt: Timestamp.nullable().default(null),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});
export type EvaluationProject = z.infer<typeof EvaluationProject>;

/**
 * Stamps the modification time.
 *
 * Commands deliberately do NOT do this themselves — see
 * `../commands/types.ts`. A command that read the clock would produce a
 * different document every time it ran, so its inverse could never restore the
 * original and undo would drift a timestamp per step. Time enters at the
 * persistence boundary, once, here.
 */
export const touch = (
  document: EvaluationProject,
  at: Timestamp,
): EvaluationProject => ({ ...document, updatedAt: at });

/**
 * Puts a paper away, keeping everything it owns. Mirrors
 * `@ludicon/domain#archiveProject`: archiving is the answer to "not now", not
 * to "never", and it is a transition rather than a field write so `archived`
 * and `archivedAt` cannot end up disagreeing.
 */
export const archiveEvaluation = (
  document: EvaluationProject,
  at: Timestamp,
): EvaluationProject => ({
  ...document,
  archived: true,
  archivedAt: at,
  updatedAt: at,
});

export const restoreEvaluation = (
  document: EvaluationProject,
  at: Timestamp,
): EvaluationProject => ({
  ...document,
  archived: false,
  archivedAt: null,
  updatedAt: at,
});

export const setSchemaVersion = (
  document: EvaluationProject,
  version: number,
): EvaluationProject => ({ ...document, schemaVersion: version });
