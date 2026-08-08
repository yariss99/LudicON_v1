import type { AnswerEntry } from "../model/answer-key.js";
import type { Block } from "../model/blocks.js";
import type { BlockId, PageId, SectionId } from "../model/identifiers.js";
import type { Page } from "../model/page.js";
import type { EvaluationProject } from "../model/project.js";
import { blockIdsOfPage, sectionsOfPage } from "../model/queries.js";
import type { Section } from "../model/section.js";
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
 * Page commands.
 *
 * `addPage` takes a page rather than inventing one. A command that minted ids
 * would not be replayable — undo restores the page it removed, by id, and a
 * redo that generated fresh ids would resurrect a different page than the one
 * the answer key and every order array still refer to. Ids come from the
 * caller's injected generator; `createBlankPage` in `../model/factory.ts` is the
 * convenience that builds the usual pair.
 *
 * Removing the last page is refused rather than allowed. A document with no
 * pages has nowhere to put the next block, so the editor would have to special-
 * case an unreachable state that only exists because a command permitted it.
 */

export const addPage = (
  index: number,
  page: Page,
  sections: Readonly<Record<SectionId, Section>> = {},
): Command => {
  const label = "Adaugă pagină";
  return {
    label,
    apply: (document) => ({
      next: {
        ...document,
        pageOrder: insertAt(document.pageOrder, index, page.id),
        pages: withEntry(document.pages, page.id, page),
        sections: withEntries(document.sections, sections),
      },
      inverse: removePage(page.id),
    }),
  };
};

export const removePage = (pageId: PageId): Command => {
  const label = "Șterge pagină";
  return {
    label,
    apply: (document) => {
      const page = document.pages[pageId];
      if (!page || document.pageOrder.length <= 1) {
        return unchanged(document, label);
      }

      const index = document.pageOrder.indexOf(pageId);
      if (index < 0) return unchanged(document, label);

      const sectionIds = page.sectionOrder;
      const blockIds = blockIdsOfPage(document, page);
      const removedSections = pickEntries(document.sections, sectionIds);
      const removedBlocks = pickEntries(document.blocks, blockIds);
      const removedAnswers = pickEntries(document.answerKey, blockIds);

      return {
        next: {
          ...document,
          pageOrder: removeAt(document.pageOrder, index),
          pages: withoutEntries(document.pages, [pageId]),
          sections: withoutEntries(document.sections, sectionIds),
          blocks: withoutEntries(document.blocks, blockIds),
          answerKey: withoutEntries(document.answerKey, blockIds),
        },
        inverse: restorePage(
          index,
          page,
          removedSections,
          removedBlocks,
          removedAnswers,
        ),
      };
    },
  };
};

export const restorePage = (
  index: number,
  page: Page,
  sections: Readonly<Record<SectionId, Section>>,
  blocks: Readonly<Record<BlockId, Block>>,
  answers: Readonly<Record<BlockId, AnswerEntry>>,
): Command => {
  const label = "Restaurează pagină";
  return {
    label,
    apply: (document) => ({
      next: {
        ...document,
        pageOrder: insertAt(document.pageOrder, index, page.id),
        pages: withEntry(document.pages, page.id, page),
        sections: withEntries(document.sections, sections),
        blocks: withEntries(document.blocks, blocks),
        answerKey: withEntries(document.answerKey, answers),
      },
      inverse: removePage(page.id),
    }),
  };
};

export const movePage = (fromIndex: number, toIndex: number): Command => {
  const label = "Mută pagină";
  return {
    label,
    apply: (document) => {
      const pageId = document.pageOrder[fromIndex];
      if (!pageId) return unchanged(document, label);

      const detached = removeAt(document.pageOrder, fromIndex);
      const insertIndex = Math.max(0, Math.min(toIndex, detached.length));

      return {
        next: {
          ...document,
          pageOrder: insertAt(detached, insertIndex, pageId),
        },
        inverse: movePage(insertIndex, fromIndex),
      };
    },
  };
};

/**
 * Replaces a page's own settings — its background, its overrides, and whether
 * it permits free placement.
 *
 * `sectionOrder` travels with it, so callers must pass the current one through.
 * Splitting "settings" from "order" into two commands was the rejected
 * alternative: two commands means two history entries for what a teacher
 * experienced as one change, and undo would then need pressing twice.
 */
export const updatePage = (page: Page): Command => {
  const label = "Modifică pagina";
  return {
    label,
    apply: (document) => {
      const previous = document.pages[page.id];
      if (!previous) return unchanged(document, label);

      return {
        next: { ...document, pages: withEntry(document.pages, page.id, page) },
        inverse: updatePage(previous),
      };
    },
  };
};

/**
 * The sections a page would take with it if removed. Exported so the editor can
 * say "această pagină conține 3 secțiuni" before asking for confirmation.
 */
export const sectionsRemovedWithPage = (
  document: EvaluationProject,
  pageId: PageId,
): Section[] => {
  const page = document.pages[pageId];
  return page ? sectionsOfPage(document, page) : [];
};
