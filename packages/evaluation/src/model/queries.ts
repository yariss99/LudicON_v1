import { z } from "zod";
import {
  Block,
  BlockKind,
  childBlockIds,
  ExerciseBlock,
  isBlockEmpty,
  isExerciseBlock,
} from "./blocks.js";
import { BlockId, ColumnId, PageId, SectionId } from "./identifiers.js";
import type { Page } from "./page.js";
import type { EvaluationProject } from "./project.js";
import type { Column, Section } from "./section.js";

/**
 * Read-only traversal of the normalised document.
 *
 * Normalisation buys cheap mutation and pays for it here: anything that wants to
 * see the document as a tree has to walk the id graph. Concentrating that walk
 * in one module means the commands, the validator, the renderer and the
 * paginator all agree on what "the blocks of page 2, in reading order" means —
 * which they would not if each rebuilt the walk locally.
 *
 * Every function tolerates a dangling id and skips it rather than throwing. A
 * document mid-edit legitimately has a moment where an order array names a
 * record that is about to arrive, and a traversal that threw there would make
 * the editor crash on a race the user cannot see. `../validation` is where
 * dangling ids are reported.
 */

/**
 * Where a block hangs. There are exactly two containers — a section's column,
 * and a free frame — so the parent is a two-member union rather than a bare
 * `ColumnId`.
 *
 * This generalises what a column-only address could express. `moveBlock` takes
 * two of these; moving between columns is the `kind: "column"` case on both
 * sides, and dragging something into a cover-page frame is the other.
 */
export type BlockParent =
  | { readonly kind: "column"; readonly columnId: ColumnId }
  | { readonly kind: "free"; readonly blockId: BlockId };

export const columnParent = (columnId: ColumnId): BlockParent => ({
  kind: "column",
  columnId,
});

export const freeParent = (blockId: BlockId): BlockParent => ({
  kind: "free",
  blockId,
});

export const sameParent = (left: BlockParent, right: BlockParent): boolean =>
  left.kind === "column" && right.kind === "column"
    ? left.columnId === right.columnId
    : left.kind === "free" && right.kind === "free"
      ? left.blockId === right.blockId
      : false;

export type BlockLocation = {
  readonly parent: BlockParent;
  readonly index: number;
};

export const pagesInOrder = (document: EvaluationProject): Page[] =>
  document.pageOrder
    .map((pageId) => document.pages[pageId])
    .filter((page): page is Page => page !== undefined);

export const sectionsOfPage = (
  document: EvaluationProject,
  page: Page,
): Section[] =>
  page.sectionOrder
    .map((sectionId) => document.sections[sectionId])
    .filter((section): section is Section => section !== undefined);

export const pageOfSection = (
  document: EvaluationProject,
  sectionId: SectionId,
): Page | undefined =>
  pagesInOrder(document).find((page) => page.sectionOrder.includes(sectionId));

export const findSectionOfColumn = (
  document: EvaluationProject,
  columnId: ColumnId,
): Section | undefined =>
  Object.values(document.sections).find((section) =>
    section.columns.some((column) => column.id === columnId),
  );

export const findColumnById = (
  document: EvaluationProject,
  columnId: ColumnId,
): Column | undefined =>
  findSectionOfColumn(document, columnId)?.columns.find(
    (column) => column.id === columnId,
  );

/** The child order of a container, or `undefined` if the container is gone. */
export const blockOrderOf = (
  document: EvaluationProject,
  parent: BlockParent,
): readonly BlockId[] | undefined => {
  if (parent.kind === "free") {
    const frame = document.blocks[parent.blockId];
    return frame && frame.kind === "free" ? frame.blockOrder : undefined;
  }
  return findColumnById(document, parent.columnId)?.blockOrder;
};

/**
 * Where a block currently hangs, by scanning every container.
 *
 * Linear in the number of containers, which is bounded by the number of columns
 * on a handful of A4 pages. A reverse index (`blockId -> parent`) was the
 * rejected alternative: it would be a fourth structure to keep in sync across
 * every command, and the class of bug it introduces — an index that disagrees
 * with the document — is much worse than the scan it saves.
 */
export const locateBlock = (
  document: EvaluationProject,
  blockId: BlockId,
): BlockLocation | undefined => {
  for (const section of Object.values(document.sections)) {
    for (const column of section.columns) {
      const index = column.blockOrder.indexOf(blockId);
      if (index >= 0) return { parent: columnParent(column.id), index };
    }
  }

  for (const block of Object.values(document.blocks)) {
    if (block.kind !== "free") continue;
    const index = block.blockOrder.indexOf(blockId);
    if (index >= 0) return { parent: freeParent(block.id), index };
  }

  return undefined;
};

/** A block id and everything it contains, the root first. */
export const collectSubtree = (
  document: EvaluationProject,
  rootId: BlockId,
): BlockId[] => {
  const collected: BlockId[] = [];
  const pending: BlockId[] = [rootId];
  const seen = new Set<string>();

  while (pending.length > 0) {
    const current = pending.shift();
    if (current === undefined || seen.has(current)) continue;
    seen.add(current);
    collected.push(current);

    const block = document.blocks[current];
    if (block) pending.push(...childBlockIds(block));
  }

  return collected;
};

/** Every block id on one page, in reading order, frames' children included. */
export const blockIdsOfPage = (
  document: EvaluationProject,
  page: Page,
): BlockId[] =>
  sectionsOfPage(document, page)
    .flatMap((section) => section.columns)
    .flatMap((column) => column.blockOrder)
    .flatMap((blockId) => collectSubtree(document, blockId));

export const pageOfBlock = (
  document: EvaluationProject,
  blockId: BlockId,
): Page | undefined =>
  pagesInOrder(document).find((page) =>
    blockIdsOfPage(document, page).includes(blockId),
  );

export const resolveBlocks = (
  document: EvaluationProject,
  ids: readonly BlockId[],
): Block[] =>
  ids
    .map((id) => document.blocks[id])
    .filter((block): block is Block => block !== undefined);

/** Every block in the document, in print order. */
export const blocksInReadingOrder = (document: EvaluationProject): Block[] =>
  pagesInOrder(document).flatMap((page) =>
    resolveBlocks(document, blockIdsOfPage(document, page)),
  );

export const exerciseBlocks = (document: EvaluationProject): ExerciseBlock[] =>
  blocksInReadingOrder(document).filter(isExerciseBlock);

/**
 * The paper's total, as printed for the pupil.
 *
 * Read off the blocks, whereas `answerKeyPoints` reads off the barem. They are
 * two different documents and both are shown to a human, so both are computed
 * from their own source and `validateProject` reports any disagreement rather
 * than one of them silently winning.
 */
export const paperPoints = (document: EvaluationProject): number =>
  exerciseBlocks(document).reduce((sum, block) => sum + block.points, 0);

/**
 * How many blocks of each kind the document holds.
 *
 * Sparse by nature — a paper with no tables has no `table` key at all — so the
 * schema for it is `z.partialRecord`, not `z.record`, which Zod 4 makes
 * exhaustive over an enum.
 */
export const BlockKindCounts = z.partialRecord(
  BlockKind,
  z.number().int().nonnegative(),
);
export type BlockKindCounts = z.infer<typeof BlockKindCounts>;

export const blockKindCounts = (
  document: EvaluationProject,
): BlockKindCounts => {
  const counts: BlockKindCounts = {};
  for (const block of Object.values(document.blocks)) {
    counts[block.kind] = (counts[block.kind] ?? 0) + 1;
  }
  return counts;
};

/**
 * Whether the paper would print nothing worth reading.
 *
 * A document seeded by `createEvaluationProject` and never touched is empty by
 * this definition — its title heading and description paragraph carry no text —
 * which is what makes the "empty document" issue fire when it should. A
 * document with no blocks at all is covered by the same expression, since
 * `every` on an empty array is true.
 */
export const isEmptyDocument = (document: EvaluationProject): boolean =>
  Object.values(document.blocks).every((block) => isBlockEmpty(block));

/** Order-array entries that name a record which is not there. */
export const danglingIds = (
  document: EvaluationProject,
): {
  readonly pages: readonly PageId[];
  readonly sections: readonly SectionId[];
  readonly blocks: readonly BlockId[];
} => {
  const pages = document.pageOrder.filter((id) => !document.pages[id]);

  const sections = Object.values(document.pages)
    .flatMap((page) => page.sectionOrder)
    .filter((id) => !document.sections[id]);

  const fromColumns = Object.values(document.sections)
    .flatMap((section) => section.columns)
    .flatMap((column) => column.blockOrder);
  const fromFrames = Object.values(document.blocks).flatMap((block) =>
    childBlockIds(block),
  );
  const blocks = [...fromColumns, ...fromFrames].filter(
    (id) => !document.blocks[id],
  );

  return { pages, sections, blocks };
};
