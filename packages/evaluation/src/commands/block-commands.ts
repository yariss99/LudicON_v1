import type { AnswerEntry } from "../model/answer-key.js";
import type { Block } from "../model/blocks.js";
import type { BlockId } from "../model/identifiers.js";
import type { EvaluationProject } from "../model/project.js";
import type { BlockParent } from "../model/queries.js";
import {
  blockOrderOf,
  collectSubtree,
  findSectionOfColumn,
  locateBlock,
} from "../model/queries.js";
import {
  clampIndex,
  insertAt,
  pickEntries,
  removeAt,
  withEntries,
  withEntry,
  withoutEntries,
} from "./collections.js";
import { unchanged, type Command } from "./types.js";

/**
 * Block commands.
 *
 * All five go through `withBlockOrder`, which is the only place in the package
 * that knows a block can hang off either a column or a free frame. Writing that
 * branch once means `addBlock` into a cover frame and `addBlock` into a body
 * column are literally the same code path — the rejected alternative, a second
 * family of `addFreeBlock`/`moveFreeBlock` commands, would have doubled the
 * surface and guaranteed the two halves drift.
 *
 * Removal CASCADES. A frame owns its children, so deleting it deletes them, and
 * the inverse restores the whole subtree together with any answer-key entries
 * that went with it. Leaving orphans in `document.blocks` was the other option:
 * they are invisible, they survive every save, and they turn up months later as
 * an answer key with entries for questions nobody can find.
 */

const withBlockOrder = (
  document: EvaluationProject,
  parent: BlockParent,
  nextOrder: (order: readonly BlockId[]) => readonly BlockId[],
): EvaluationProject | undefined => {
  if (parent.kind === "free") {
    const frame = document.blocks[parent.blockId];
    if (!frame || frame.kind !== "free") return undefined;
    return {
      ...document,
      blocks: withEntry(document.blocks, parent.blockId, {
        ...frame,
        blockOrder: [...nextOrder(frame.blockOrder)],
      }),
    };
  }

  const section = findSectionOfColumn(document, parent.columnId);
  if (!section) return undefined;

  return {
    ...document,
    sections: withEntry(document.sections, section.id, {
      ...section,
      columns: section.columns.map((column) =>
        column.id === parent.columnId
          ? { ...column, blockOrder: [...nextOrder(column.blockOrder)] }
          : column,
      ),
    }),
  };
};

export const addBlock = (
  parent: BlockParent,
  index: number,
  block: Block,
): Command => {
  const label = "Adaugă element";
  return {
    label,
    apply: (document) => {
      const reordered = withBlockOrder(document, parent, (order) =>
        insertAt(order, index, block.id),
      );
      if (!reordered) return unchanged(document, label);

      return {
        next: {
          ...reordered,
          blocks: withEntry(reordered.blocks, block.id, block),
        },
        inverse: removeBlock(block.id),
      };
    },
  };
};

export const removeBlock = (blockId: BlockId): Command => {
  const label = "Șterge element";
  return {
    label,
    apply: (document) => {
      const location = locateBlock(document, blockId);
      if (!location) return unchanged(document, label);

      const subtree = collectSubtree(document, blockId);
      const removedBlocks = pickEntries(document.blocks, subtree);
      const removedAnswers = pickEntries(document.answerKey, subtree);

      const reordered = withBlockOrder(document, location.parent, (order) =>
        removeAt(order, location.index),
      );
      if (!reordered) return unchanged(document, label);

      return {
        next: {
          ...reordered,
          blocks: withoutEntries(reordered.blocks, subtree),
          answerKey: withoutEntries(reordered.answerKey, subtree),
        },
        inverse: restoreBlocks(
          location.parent,
          location.index,
          blockId,
          removedBlocks,
          removedAnswers,
        ),
      };
    },
  };
};

/**
 * The inverse of a removal: puts the captured subtree back at its original
 * index, answer-key entries included.
 *
 * Exported because a paste is structurally the same operation, and because a
 * command that exists only as somebody else's inverse is a command nobody can
 * test directly.
 */
export const restoreBlocks = (
  parent: BlockParent,
  index: number,
  rootId: BlockId,
  blocks: Readonly<Record<BlockId, Block>>,
  answers: Readonly<Record<BlockId, AnswerEntry>>,
): Command => {
  const label = "Restaurează element";
  return {
    label,
    apply: (document) => {
      const reordered = withBlockOrder(document, parent, (order) =>
        insertAt(order, index, rootId),
      );
      if (!reordered) return unchanged(document, label);

      return {
        next: {
          ...reordered,
          blocks: withEntries(reordered.blocks, blocks),
          answerKey: withEntries(reordered.answerKey, answers),
        },
        inverse: removeBlock(rootId),
      };
    },
  };
};

/**
 * Replaces a block wholesale rather than patching fields.
 *
 * A typed partial patch over a discriminated union is either unsound — a patch
 * that changes `kind` but not the fields that go with it — or a per-kind command
 * family. Whole replacement is exactly invertible, because the inverse carries
 * the previous value, and one block is a small enough diff that nothing is lost.
 */
export const updateBlock = (block: Block): Command => {
  const label = "Modifică element";
  return {
    label,
    apply: (document) => {
      const previous = document.blocks[block.id];
      if (!previous) return unchanged(document, label);

      return {
        next: {
          ...document,
          blocks: withEntry(document.blocks, block.id, block),
        },
        inverse: updateBlock(previous),
      };
    },
  };
};

/**
 * Moves a block between containers, or within one.
 *
 * Semantics are always "detach, then insert", which is what makes the inverse a
 * plain `moveBlock` with the two addresses swapped: within one column, moving
 * index 0 to index 2 leaves the block at 2, and moving 2 back to 0 restores the
 * original order exactly.
 *
 * The cycle guard is not decoration. Dropping a frame inside itself would
 * detach a subtree from every page while leaving it in `document.blocks`,
 * producing a document that parses, renders nothing, and cannot be undone —
 * the container it came from is inside the thing that vanished.
 */
export const moveBlock = (
  from: BlockParent,
  fromIndex: number,
  to: BlockParent,
  toIndex: number,
): Command => {
  const label = "Mută element";
  return {
    label,
    apply: (document) => {
      const sourceOrder = blockOrderOf(document, from);
      const blockId = sourceOrder?.[fromIndex];
      if (!blockId) return unchanged(document, label);

      if (
        to.kind === "free" &&
        collectSubtree(document, blockId).includes(to.blockId)
      ) {
        return unchanged(document, label);
      }

      const detached = withBlockOrder(document, from, (order) =>
        removeAt(order, fromIndex),
      );
      if (!detached) return unchanged(document, label);

      const targetOrder = blockOrderOf(detached, to);
      if (!targetOrder) return unchanged(document, label);
      const insertIndex = clampIndex(toIndex, targetOrder.length);

      const attached = withBlockOrder(detached, to, (order) =>
        insertAt(order, insertIndex, blockId),
      );
      if (!attached) return unchanged(document, label);

      return {
        next: attached,
        inverse: moveBlock(to, insertIndex, from, fromIndex),
      };
    },
  };
};
