import type { AnswerEntry } from "../model/answer-key.js";
import type { Block } from "../model/blocks.js";
import type { BlockId, PageId, SectionId } from "../model/identifiers.js";
import type { EvaluationProject } from "../model/project.js";
import { collectSubtree, pageOfSection } from "../model/queries.js";
import type { Section } from "../model/section.js";
import { sectionBlockIds } from "../model/section.js";
import {
  insertAt,
  pickEntries,
  removeAt,
  withEntries,
  withEntry,
  withoutEntries,
} from "./collections.js";
import { unchanged, type Command } from "./types.js";

/**
 * Section commands.
 *
 * A section removal cascades exactly as far as a block removal does, and for
 * the same reason: the section owns its columns, the columns own their blocks,
 * and a block that no page can reach is a block that will never be found again.
 * The inverse therefore carries three captured things — the section itself,
 * every block underneath it, and the answer-key entries for the exercises among
 * them — because restoring only the section would put back an empty shell.
 */

const withSectionOrder = (
  document: EvaluationProject,
  pageId: PageId,
  nextOrder: (order: readonly SectionId[]) => readonly SectionId[],
): EvaluationProject | undefined => {
  const page = document.pages[pageId];
  if (!page) return undefined;

  return {
    ...document,
    pages: withEntry(document.pages, pageId, {
      ...page,
      sectionOrder: [...nextOrder(page.sectionOrder)],
    }),
  };
};

/** Every block id under a section, frames' children included. */
const sectionSubtree = (
  document: EvaluationProject,
  section: Section,
): BlockId[] =>
  sectionBlockIds(section).flatMap((blockId) =>
    collectSubtree(document, blockId),
  );

export const addSection = (
  pageId: PageId,
  index: number,
  section: Section,
): Command => {
  const label = "Adaugă secțiune";
  return {
    label,
    apply: (document) => {
      const reordered = withSectionOrder(document, pageId, (order) =>
        insertAt(order, index, section.id),
      );
      if (!reordered) return unchanged(document, label);

      return {
        next: {
          ...reordered,
          sections: withEntry(reordered.sections, section.id, section),
        },
        inverse: removeSection(section.id),
      };
    },
  };
};

export const removeSection = (sectionId: SectionId): Command => {
  const label = "Șterge secțiune";
  return {
    label,
    apply: (document) => {
      const section = document.sections[sectionId];
      const page = pageOfSection(document, sectionId);
      if (!section || !page) return unchanged(document, label);

      const index = page.sectionOrder.indexOf(sectionId);
      const subtree = sectionSubtree(document, section);
      const removedBlocks = pickEntries(document.blocks, subtree);
      const removedAnswers = pickEntries(document.answerKey, subtree);

      const reordered = withSectionOrder(document, page.id, (order) =>
        removeAt(order, index),
      );
      if (!reordered) return unchanged(document, label);

      return {
        next: {
          ...reordered,
          sections: withoutEntries(reordered.sections, [sectionId]),
          blocks: withoutEntries(reordered.blocks, subtree),
          answerKey: withoutEntries(reordered.answerKey, subtree),
        },
        inverse: restoreSection(
          page.id,
          index,
          section,
          removedBlocks,
          removedAnswers,
        ),
      };
    },
  };
};

export const restoreSection = (
  pageId: PageId,
  index: number,
  section: Section,
  blocks: Readonly<Record<BlockId, Block>>,
  answers: Readonly<Record<BlockId, AnswerEntry>>,
): Command => {
  const label = "Restaurează secțiune";
  return {
    label,
    apply: (document) => {
      const reordered = withSectionOrder(document, pageId, (order) =>
        insertAt(order, index, section.id),
      );
      if (!reordered) return unchanged(document, label);

      return {
        next: {
          ...reordered,
          sections: withEntry(reordered.sections, section.id, section),
          blocks: withEntries(reordered.blocks, blocks),
          answerKey: withEntries(reordered.answerKey, answers),
        },
        inverse: removeSection(section.id),
      };
    },
  };
};

/**
 * Moves a section, possibly to another page.
 *
 * Same "detach, then insert" semantics as `moveBlock`, so the inverse is the
 * mirrored call with the clamped destination index the move actually used.
 */
export const moveSection = (
  fromPageId: PageId,
  fromIndex: number,
  toPageId: PageId,
  toIndex: number,
): Command => {
  const label = "Mută secțiune";
  return {
    label,
    apply: (document) => {
      const sourcePage = document.pages[fromPageId];
      const sectionId = sourcePage?.sectionOrder[fromIndex];
      if (!sectionId) return unchanged(document, label);

      const detached = withSectionOrder(document, fromPageId, (order) =>
        removeAt(order, fromIndex),
      );
      if (!detached) return unchanged(document, label);

      const targetPage = detached.pages[toPageId];
      if (!targetPage) return unchanged(document, label);
      const insertIndex = Math.max(
        0,
        Math.min(toIndex, targetPage.sectionOrder.length),
      );

      const attached = withSectionOrder(detached, toPageId, (order) =>
        insertAt(order, insertIndex, sectionId),
      );
      if (!attached) return unchanged(document, label);

      return {
        next: attached,
        inverse: moveSection(toPageId, insertIndex, fromPageId, fromIndex),
      };
    },
  };
};

/**
 * Replaces a section wholesale — layout, style and columns together.
 *
 * Changing a layout means rebuilding the columns to match it, and those two
 * have to land in one step or `columnsMatchLayout` is briefly false and the
 * renderer briefly wrong. One command, one consistent state.
 */
export const updateSection = (section: Section): Command => {
  const label = "Modifică secțiune";
  return {
    label,
    apply: (document) => {
      const previous = document.sections[section.id];
      if (!previous) return unchanged(document, label);

      return {
        next: {
          ...document,
          sections: withEntry(document.sections, section.id, section),
        },
        inverse: updateSection(previous),
      };
    },
  };
};
