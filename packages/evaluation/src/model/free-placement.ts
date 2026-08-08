import type { FreeBlock } from "./blocks.js";
import { isFreeBlock } from "./blocks.js";
import type { BlockId, PageId } from "./identifiers.js";
import type { Page } from "./page.js";
import type { EvaluationProject } from "./project.js";
import { blockIdsOfPage, pagesInOrder } from "./queries.js";

/**
 * The one placement rule the document model enforces: a free block is legal
 * only on a page that says so.
 *
 * Absolute coordinates and reflowing content contradict each other. A free
 * block does not move when the section above it gains a line, so on a body page
 * it silently ends up on top of the pupil's answer space — and nobody sees it
 * until the paper is printed. The cover is the one page where nothing reflows,
 * which is why it is the one page where placing by eye is safe.
 *
 * Making this a per-page permission rather than a global editor mode is what
 * keeps that guarantee in the document. A mode lives in the app's state, so a
 * document produced under it carries no record of the rule and a later importer
 * has no way to check it. `allowsFreePlacement` travels with the file.
 */

/** The predicate the rule is written in terms of. */
export const canHostFreeBlocks = (page: Page): boolean =>
  page.allowsFreePlacement;

export type IllegalFreeBlock = {
  readonly blockId: BlockId;
  readonly pageId: PageId;
};

/**
 * Every free block sitting on a page that forbids it.
 *
 * Returns the offenders rather than a boolean so the validator can name each
 * one and the editor can select it — "something is wrong somewhere" is not a
 * message a teacher can act on.
 */
export const illegalFreeBlocks = (
  document: EvaluationProject,
): readonly IllegalFreeBlock[] =>
  pagesInOrder(document)
    .filter((page) => !canHostFreeBlocks(page))
    .flatMap((page) =>
      blockIdsOfPage(document, page)
        .filter((blockId) => {
          const block = document.blocks[blockId];
          return block !== undefined && isFreeBlock(block);
        })
        .map((blockId) => ({ blockId, pageId: page.id })),
    );

/**
 * Whether this specific frame is where it is allowed to be.
 *
 * A frame that is not attached to any page at all counts as legal: it is
 * unreachable, so it prints nothing, and reporting it here would duplicate the
 * dangling-reference issue that `danglingIds` already raises.
 */
export const isFreeBlockPlacementLegal = (
  document: EvaluationProject,
  frame: FreeBlock,
): boolean => {
  const page = pagesInOrder(document).find((candidate) =>
    blockIdsOfPage(document, candidate).includes(frame.id),
  );
  return page === undefined || canHostFreeBlocks(page);
};
