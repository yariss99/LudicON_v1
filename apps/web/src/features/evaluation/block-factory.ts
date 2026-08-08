import {
  BlockId,
  ColumnId,
  columnsForLayout,
  createBlankPage,
  SectionId,
  SectionStyle,
  type AnyExerciseDefinition,
  type Block,
  type BlockKind,
  type ExerciseBlock,
  type Page,
  type Section,
  type SectionLayout,
  collectSubtree,
  isContainerBlock,
  type AnswerEntry,
  type EvaluationProject,
} from "@ludicon/evaluation";

/**
 * Fresh pieces, with fresh ids.
 *
 * The model package deliberately cannot mint an id — it has no `crypto` in its
 * `lib`, and a factory that read a global would stop being pure — so every
 * `newId` in this feature comes from here, and here is the only place in the
 * feature that calls `crypto.randomUUID`. One source means an undo that
 * restores a removed subtree restores it under the ids the answer key and every
 * order array still name.
 *
 * New blocks are EMPTY rather than seeded with sample text. A paragraph that
 * arrives saying "Text nou" is text the teacher has to delete before they can
 * write, and it makes `isBlockEmpty` — which the checklist reads — answer no
 * for a block nobody has written yet.
 */

export const newId = (): string => crypto.randomUUID();

/**
 * The pieces that can be made from a KIND ALONE.
 *
 * `exercise` is placeable now — the library has a whole group of them — but it
 * is not in this union, and the distinction is the point rather than an
 * omission. Every other block kind fully determines the block: "paragraph" is
 * one thing. An exercise additionally carries an `exerciseType` naming a
 * registry entry, so "add an exercise" is not an answerable request; "add an
 * Alegere cu un răspuns" is. `newExerciseBlock` below therefore takes the
 * definition rather than a kind, and the library's exercise group is built from
 * the registry rather than from a list of kinds.
 *
 * Widening this union instead would have meant `newBlock("exercise")` returning
 * a block with an empty `exerciseType` — a question of no kind, which renders
 * as nothing and validates as broken the moment it is added.
 *
 * `free` is absent because a frame is placed by dragging on the cover, which
 * this slice does not do.
 */
export type PieceKind = Exclude<BlockKind, "exercise" | "free">;

export const PIECE_ORDER: readonly PieceKind[] = [
  "heading",
  "paragraph",
  "list",
  "quote",
  "image",
  "divider",
  "spacer",
  "table",
  "callout",
  "answerSpace",
];

/** An empty cell, used to shape a starter table. */
const emptyCell = () => ({ content: [], colSpan: 1, rowSpan: 1 });

export const newBlock = (kind: PieceKind): Block => {
  const id = BlockId.parse(newId());

  switch (kind) {
    case "heading":
      return { id, kind: "heading", level: "h2", content: [] };
    case "paragraph":
      return { id, kind: "paragraph", content: [] };
    case "list":
      // One empty row, so the teacher sees where the list starts.
      return { id, kind: "list", listStyle: "bullet", items: [[]], startAt: 1 };
    case "quote":
      return { id, kind: "quote", content: [], attribution: "" };
    case "image":
      return {
        id,
        kind: "image",
        src: "",
        alt: "",
        caption: [],
        widthMm: null,
        heightMm: null,
        fit: "contain",
        align: "center",
      };
    case "divider":
      return { id, kind: "divider", dividerStyle: "solid", thicknessMm: 0.3 };
    case "spacer":
      return { id, kind: "spacer", heightMm: 8 };
    case "table":
      return {
        id,
        kind: "table",
        headerRow: true,
        rows: [
          { cells: [emptyCell(), emptyCell()] },
          { cells: [emptyCell(), emptyCell()] },
        ],
        columnWidths: [],
        bordered: true,
      };
    case "callout":
      return { id, kind: "callout", tone: "info", title: "", content: [] };
    case "answerSpace":
      return {
        id,
        kind: "answerSpace",
        answerStyle: "lines",
        lines: 3,
        lineGapMm: 9,
        heightMm: null,
      };
  }
};

/**
 * A fresh question of one type, at the type's own starting configuration.
 *
 * The config is a DEEP COPY of the definition's `defaults`. The registry hands
 * out the same object to every caller, and although every edit in this feature
 * replaces rather than mutates, sharing it would mean one missed spread turns
 * into every exercise of that type on every open paper changing at once — a bug
 * that is invisible until it is catastrophic. A clone costs microseconds at the
 * one moment a teacher presses a button.
 *
 * No barem entry is created here, and `exercises/exercise-actions.ts` explains
 * why: guessing an answer produces a barem that prints, looks deliberate, and
 * marks a class wrongly.
 */
export const newExerciseBlock = (
  definition: AnyExerciseDefinition,
): ExerciseBlock => ({
  id: BlockId.parse(newId()),
  kind: "exercise",
  exerciseType: definition.type,
  config: structuredClone(definition.defaults),
  prompt: [],
  points: 1,
  layoutId: null,
});

export const newSection = (layout: SectionLayout): Section => ({
  id: SectionId.parse(newId()),
  layout,
  style: SectionStyle.parse({}),
  columns: columnsForLayout(layout, () => ColumnId.parse(newId())),
});

/**
 * Rebuilds a section's columns for a new layout, keeping the blocks.
 *
 * Every block that was in a column that no longer exists lands in the last
 * surviving column rather than being dropped. Dropping them would be a
 * destructive change behind a control that reads as cosmetic — the teacher
 * chose "two columns", not "delete the third column's work".
 */
export const relaidSection = (
  section: Section,
  layout: SectionLayout,
): Section => {
  const columns = columnsForLayout(layout, () => ColumnId.parse(newId()));
  const lastIndex = columns.length - 1;

  const filled = columns.map((column, index) => ({
    ...column,
    blockOrder: [...(section.columns[index]?.blockOrder ?? [])],
  }));

  const orphans = section.columns
    .slice(columns.length)
    .flatMap((column) => column.blockOrder);

  const last = filled[lastIndex];
  if (last && orphans.length > 0) {
    filled[lastIndex] = {
      ...last,
      blockOrder: [...last.blockOrder, ...orphans],
    };
  }

  return { ...section, layout, columns: filled };
};

/** A body page with one full-width row, ready to receive pieces. */
export const newPage = (): { page: Page; section: Section } =>
  createBlankPage(newId);

/**
 * A block and everything under it, under fresh ids.
 *
 * Cloning cannot be a structural copy. Ids are the document's only addressing:
 * `blockOrder` names children by id, `answerKey` is keyed by the exercise's own
 * id, and a `free` frame carries its children in `blockOrder` the same way a
 * column does. Reusing an id would make the copy and the original the same
 * block seen twice — the second `blockOrder` entry would render the first
 * block's content, and marking one barem would mark both.
 *
 * So every id in the subtree is reminted and every reference is rewritten
 * through the same map. The map is built in full before any rewriting, because
 * a frame's `blockOrder` can name a child that appears later in the walk.
 *
 * The answer key travels with it. An exercise whose copy had no barem entry
 * would print in the pupil's paper and be missing from the teacher's, which is
 * the failure the answer-key-outside-the-page-tree design exists to prevent —
 * a duplicate is a new question, and a new question needs its own answer.
 *
 * Returns the pieces `restoreBlocks` wants rather than mutating anything: the
 * command layer owns insertion, and this owns identity.
 */
export const cloneSubtree = (
  document: EvaluationProject,
  rootId: BlockId,
): {
  rootId: BlockId;
  blocks: Record<BlockId, Block>;
  answers: Record<BlockId, AnswerEntry>;
} | null => {
  const ids = collectSubtree(document, rootId);
  if (ids.length === 0) return null;

  const remap = new Map<BlockId, BlockId>();
  for (const id of ids) remap.set(id, BlockId.parse(newId()));

  const blocks: Record<BlockId, Block> = {};
  const answers: Record<BlockId, AnswerEntry> = {};

  for (const id of ids) {
    const source = document.blocks[id];
    const fresh = remap.get(id);
    if (!source || !fresh) continue;

    blocks[fresh] = isContainerBlock(source)
      ? {
          ...source,
          id: fresh,
          blockOrder: source.blockOrder.map(
            (child) => remap.get(child) ?? child,
          ),
        }
      : { ...source, id: fresh };

    const answer = document.answerKey[id];
    if (answer) answers[fresh] = answer;
  }

  const freshRoot = remap.get(rootId);
  return freshRoot ? { rootId: freshRoot, blocks, answers } : null;
};

/**
 * A row and its pieces, under fresh ids.
 *
 * Columns are reminted too. A column id addresses a `BlockParent`, so two rows
 * sharing one would make a drop into the copy land in the original.
 */
export const cloneSection = (
  document: EvaluationProject,
  section: Section,
): {
  section: Section;
  blocks: Record<BlockId, Block>;
  answers: Record<BlockId, AnswerEntry>;
} => {
  const blocks: Record<BlockId, Block> = {};
  const answers: Record<BlockId, AnswerEntry> = {};

  const columns = section.columns.map((column) => ({
    ...column,
    id: ColumnId.parse(newId()),
    blockOrder: column.blockOrder.flatMap((blockId) => {
      const cloned = cloneSubtree(document, blockId);
      if (!cloned) return [];
      Object.assign(blocks, cloned.blocks);
      Object.assign(answers, cloned.answers);
      return [cloned.rootId];
    }),
  }));

  return {
    section: { ...section, id: SectionId.parse(newId()), columns },
    blocks,
    answers,
  };
};
