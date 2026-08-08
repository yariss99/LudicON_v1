import {
  BLOCK_KIND_LABEL,
  collectSubtree,
  pagesInOrder,
  sectionsOfPage,
  type BlockId,
  type EvaluationProject,
  type PageId,
  type SectionId,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../copy";

/**
 * Everything on the paper the teacher can arrive at, in reading order.
 *
 * Derived from the DOCUMENT, not from the DOM. Walking
 * `container.querySelectorAll("[data-block-id],[data-section-id]")` would give
 * the same order for free and is the shorter version, and it is wrong for one
 * reason that matters: it can only be read after a render, so the first arrow
 * press after an edit walks a list that describes the previous document. The
 * model is available in the same tick the command was applied, so the order the
 * keyboard walks and the order the renderer draws cannot drift apart.
 *
 * The list is FLAT and includes all three ranks — sheet, row, piece — in the
 * order they nest. That is the same hierarchy the pointer already exposes:
 * clicking a heading selects the heading, clicking the white space beside it
 * selects the row it sits in, clicking the margin selects the sheet. A tree
 * widget with expand/collapse was the rejected alternative; it would give the
 * keyboard a mental model of the paper that the pointer does not have, and the
 * teacher would have to learn two.
 *
 * Every stop carries the sheet it lives on, worked out while walking rather
 * than looked up later with `pageOfBlock`. The rail highlights that sheet when
 * a stop is chosen, and the lookup would rescan every page's subtree to
 * rediscover a fact this walk already had in hand.
 *
 * Spacers are stops even though the renderer marks them `aria-hidden`. A spacer
 * is a piece a teacher deliberately placed and can select with the pointer;
 * being invisible on the printed page is not a reason to be unreachable in the
 * editor, and it is the one piece whose only route to its own settings is
 * selecting it.
 */

export type CanvasStopId = BlockId | SectionId | PageId;

/** The three ranks, named exactly as `resolveSelection` names them. */
export type CanvasStopKind = "page" | "section" | "block";

export interface CanvasStop {
  readonly id: CanvasStopId;
  readonly kind: CanvasStopKind;
  /** The sheet this stop is on — itself, for a page stop. */
  readonly pageId: PageId;
  /** What a screen reader announces: "Pagina 1 din 2", "Rând", "Piesă: Titlu". */
  readonly label: string;
}

/**
 * How a stop is found in what the renderer drew.
 *
 * The renderer emits `data-page-id` / `data-section-id` / `data-block-id` and
 * nothing else about selection, so this one function is the whole bridge
 * between the model's ids and the pixels the overlay measures. It is shared by
 * the outline, the focus ring and the scroll-into-view rather than written
 * three times, because three copies of a `CSS.escape` ternary is three places
 * to forget the escaping.
 *
 * Takes the shape rather than `CanvasStop`, so `ResolvedSelection` — which has
 * the same two fields under the same names — can be passed straight in.
 */
export const stopSelector = (target: {
  readonly kind: CanvasStopKind;
  readonly id: string;
}): string =>
  target.kind === "block"
    ? `[data-block-id="${CSS.escape(target.id)}"]`
    : target.kind === "section"
      ? `[data-section-id="${CSS.escape(target.id)}"]`
      : `[data-page-id="${CSS.escape(target.id)}"]`;

export const canvasStops = (
  document: EvaluationProject,
): readonly CanvasStop[] => {
  const pages = pagesInOrder(document);

  return pages.flatMap((page, index): CanvasStop[] => [
    {
      id: page.id,
      kind: "page",
      pageId: page.id,
      label: EVALUATION_COPY.pageOf(index + 1, pages.length),
    },
    ...sectionsOfPage(document, page).flatMap((section): CanvasStop[] => [
      {
        id: section.id,
        kind: "section",
        pageId: page.id,
        label: EVALUATION_COPY.selectedRow,
      },
      ...section.columns
        .flatMap((column) => column.blockOrder)
        .flatMap((blockId) => collectSubtree(document, blockId))
        .flatMap((blockId): CanvasStop[] => {
          // A subtree id that no longer resolves is skipped rather than
          // labelled "Piesă: Paragraf" by default: an unreachable stop that
          // announces the wrong kind is worse than one stop fewer.
          const block = document.blocks[blockId];
          if (!block) return [];
          return [
            {
              id: blockId,
              kind: "block",
              pageId: page.id,
              label: EVALUATION_COPY.selectedPiece(
                BLOCK_KIND_LABEL[block.kind],
              ),
            },
          ];
        }),
    ]),
  ]);
};

/**
 * Where an id sits in the list, and where to land when it has gone.
 *
 * Removing a piece and undoing an insert both delete the thing the keyboard was
 * standing on, and the honest answer is not "jump to the top": it is "stay
 * where you were in the list", which is what the teacher's eye is already
 * doing. `fallback` is the last index this list reported, clamped, so deleting
 * the third piece leaves the keyboard on whatever is third now.
 */
export const stopIndex = (
  stops: readonly CanvasStop[],
  id: CanvasStopId | null,
  fallback: number,
): number => {
  if (stops.length === 0) return -1;
  const found = stops.findIndex((stop) => stop.id === id);
  if (found >= 0) return found;
  return Math.min(Math.max(fallback, 0), stops.length - 1);
};
