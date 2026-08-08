import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import {
  BLOCK_KIND_LABEL,
  columnParent,
  pagesInOrder,
  sectionsOfPage,
  type BlockId,
  type BlockParent,
  type EvaluationProject,
  type PageId,
  type SectionId,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../copy";

/**
 * Where a piece can be picked up, and where it can be put down — measured off
 * the rendered sheet, never rendered into it.
 *
 * `document-renderer.tsx` is a pure function of the model and is also the print
 * and PDF renderer. A `useDraggable` ref inside `section-view.tsx` would put
 * `role="button"` and a `data-dnd` attribute on the teacher's printed paper,
 * and the renderer would start taking props about a drag that does not exist on
 * paper. So the drag layer does what the selection outline already does: it
 * reads the `data-block-id` / `data-column-id` / `data-section-id` /
 * `data-page-id` attributes the model already justifies emitting, and builds
 * its own boxes over the top.
 *
 * ## A drop target is a SEAM, not a container
 *
 * The obvious model is "the column is the droppable, work out the index from
 * the pointer". It was rejected because the index then lives in a mouse-maths
 * function that has to be right, and the drop indicator has to be derived from
 * it a second time — two places to disagree about where the piece is going.
 *
 * A seam is the gap itself: a container with three pieces has four of them, and
 * seam `k` means "before whatever is at `k`". Each one is a real droppable with
 * a real rectangle, so the collision picks a seam directly, the indicator is
 * drawn at that seam's own coordinates, and there is exactly one answer to
 * "where will this land". `dropBlock` in `../document-actions.ts` turns the
 * seam into the index `moveBlock` wants, which is the only arithmetic left.
 *
 * ## Structure from the model, coordinates from the DOM
 *
 * Which seams exist is walked from the document, for the same reason
 * `canvas-stops.ts` walks it: the DOM can only be read after a render, so a
 * list built from `querySelectorAll` describes the document as it was one frame
 * ago. Only the coordinates come from the DOM, because only the browser knows
 * how tall a paragraph turned out.
 */

export interface TargetRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** How tall the band around a seam is, in screen pixels. */
const SEAM_BAND = 20;

/** A page with no rows still needs somewhere to drop one. */
const EMPTY_PAGE_INSET = 0.08;

export interface BlockSeam {
  readonly id: string;
  readonly kind: "blockSeam";
  readonly parent: BlockParent;
  readonly index: number;
  readonly rect: TargetRect;
}

export interface SectionSeam {
  readonly id: string;
  readonly kind: "sectionSeam";
  readonly pageId: PageId;
  readonly index: number;
  readonly rect: TargetRect;
}

export type Seam = BlockSeam | SectionSeam;

export interface DragHandle {
  readonly id: string;
  readonly kind: "block" | "section";
  readonly blockId?: BlockId;
  readonly sectionId?: SectionId;
  readonly pageId: PageId;
  /** Romanian, shown on the chip that follows the pointer. */
  readonly label: string;
  readonly rect: TargetRect;
}

export interface DragTargets {
  readonly handles: readonly DragHandle[];
  readonly seams: readonly Seam[];
}

const NOTHING: DragTargets = Object.freeze({ handles: [], seams: [] });

const band = (
  left: number,
  centreY: number,
  width: number,
  height = SEAM_BAND,
): TargetRect => ({
  left,
  top: centreY - height / 2,
  width,
  height,
});

/**
 * A cheap identity for a whole measurement.
 *
 * The hook re-runs on every document change, every zoom change and every
 * container resize, and each run builds fresh objects. Setting state
 * unconditionally would re-render the overlay forever, since the new array is
 * never `===` the old one. Rounding to whole pixels also stops a half-pixel
 * reflow — a scrollbar appearing, a font settling — from counting as a change.
 */
const signature = (targets: DragTargets): string =>
  [...targets.handles, ...targets.seams]
    .map((one) => {
      const r = one.rect;
      return `${one.id}:${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.height)}`;
    })
    .join("|");

export function useDragTargets(
  containerRef: RefObject<HTMLElement | null>,
  document: EvaluationProject,
  /** Anything that moves the paper without changing it. */
  zoom: number,
  enabled: boolean,
): DragTargets {
  const [targets, setTargets] = useState<DragTargets>(NOTHING);

  /**
   * The surface is not there yet on the first pass, and this is why.
   *
   * React's commit walks the tree bottom-up: a CHILD's layout effect runs
   * before its PARENT's ref is attached. This hook lives in the overlay, which
   * is a child of the very `<div ref={surfaceRef}>` it measures inside, so on
   * mount `containerRef.current` is still `null` — and since the other
   * dependencies do not change by themselves, a plain early return meant the
   * paper was measured exactly never. Symptom: no drag boxes at all, on a first
   * load, that appeared the moment anything triggered a re-render.
   *
   * `useMeasuredNode` shares the shape and is accidentally safe: its selector
   * is `null` until something is selected, so its first real run is always
   * later. This one has no such trigger, so it needs its own.
   *
   * A PASSIVE effect runs after the commit is finished and every ref is
   * attached, so it is the earliest honest moment to say "now there is a
   * surface". It costs one extra frame on mount and nothing afterwards: every
   * later run — an edit, a zoom — is the synchronous pre-paint measurement,
   * which is what stops the boxes lagging a frame behind the paper.
   */
  const [surfaceReady, setSurfaceReady] = useState(false);
  useEffect(() => {
    if (containerRef.current !== null) setSurfaceReady(true);
  }, [containerRef]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) {
      setTargets((current) => (current === NOTHING ? current : NOTHING));
      return;
    }

    const measure = () => {
      const next = readTargets(container, document);
      setTargets((current) =>
        signature(current) === signature(next) ? current : next,
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, surfaceReady, document, zoom, enabled]);

  return targets;
}

/**
 * One pass over the paper.
 *
 * Split out of the hook so it is an ordinary function of a container and a
 * document — the part worth reading on its own, and the part a future test can
 * drive against a fixture without a React tree.
 */
const readTargets = (
  container: HTMLElement,
  document: EvaluationProject,
): DragTargets => {
  const outer = container.getBoundingClientRect();

  const rectOf = (selector: string): TargetRect | null => {
    const node = container.querySelector(selector);
    if (!node) return null;
    const inner = node.getBoundingClientRect();
    return {
      left: inner.left - outer.left,
      top: inner.top - outer.top,
      width: inner.width,
      height: inner.height,
    };
  };

  const handles: DragHandle[] = [];
  const seams: Seam[] = [];

  for (const page of pagesInOrder(document)) {
    const pageRect = rectOf(`[data-page-id="${CSS.escape(page.id)}"]`);
    if (!pageRect) continue;

    const sections = sectionsOfPage(document, page);
    const sectionRects = sections.map((section) =>
      rectOf(`[data-section-id="${CSS.escape(section.id)}"]`),
    );

    collectSectionSeams(page.id, pageRect, sectionRects, seams);

    sections.forEach((section, sectionIndex) => {
      const sectionRect = sectionRects[sectionIndex];
      if (!sectionRect) return;

      handles.push({
        id: `section-${section.id}`,
        kind: "section",
        sectionId: section.id,
        pageId: page.id,
        label: EVALUATION_COPY.dragRow,
        rect: sectionRect,
      });

      for (const column of section.columns) {
        const columnRect = rectOf(
          `[data-column-id="${CSS.escape(column.id)}"]`,
        );
        if (!columnRect) continue;

        /**
         * Aligned to `blockOrder`, holes and all.
         *
         * Filtering the misses out was the first version and it is a
         * correctness bug rather than a tidiness one: a seam's index IS the
         * index `moveBlock` inserts at, so a column whose second piece failed
         * to measure would number every seam after it one too low and drop
         * pieces one place off. A hole costs a missing drag handle; a shifted
         * index costs a wrong document.
         */
        const blockRects = column.blockOrder.map((blockId) =>
          rectOf(`[data-block-id="${CSS.escape(blockId)}"]`),
        );

        column.blockOrder.forEach((blockId, position) => {
          const block = document.blocks[blockId];
          const rect = blockRects[position];
          if (!block || !rect) return;
          handles.push({
            id: `block-${blockId}`,
            kind: "block",
            blockId,
            pageId: page.id,
            label: EVALUATION_COPY.dragPiece(BLOCK_KIND_LABEL[block.kind]),
            rect,
          });
        });

        collectBlockSeams(
          columnParent(column.id),
          columnRect,
          blockRects,
          seams,
        );
      }
    });
  }

  return { handles, seams };
};

/**
 * The gaps inside one column.
 *
 * An empty column gets a single seam the size of the whole column rather than a
 * 20px band: it is the one case where the teacher is aiming at a container
 * rather than at a gap between two things, and `section-view.tsx` already
 * reserves a visible 14mm box there for exactly that reason.
 *
 * Between two pieces the seam sits at the MIDPOINT of the gap, not at the
 * bottom edge of the piece above. Blocks carry margins, so those two are
 * several millimetres apart, and a caret drawn tight under the previous
 * paragraph reads as belonging to it rather than to the space below.
 *
 * `blockRects` may contain holes and its LENGTH is authoritative — it is the
 * container's order, so seam `k` is the index `moveBlock` will insert at. A
 * hole is filled by looking outward for the nearest piece that did measure,
 * which puts the seam somewhere sensible rather than at the top of the column.
 */
const collectBlockSeams = (
  parent: BlockParent,
  columnRect: TargetRect,
  blockRects: readonly (TargetRect | null)[],
  into: Seam[],
): void => {
  const key = parent.kind === "column" ? parent.columnId : parent.blockId;

  if (blockRects.length === 0) {
    into.push({
      id: `seam-${key}-0`,
      kind: "blockSeam",
      parent,
      index: 0,
      rect: columnRect,
    });
    return;
  }

  /** The nearest measured piece at or before `from`, walking backwards. */
  const lastAbove = (from: number): TargetRect | null => {
    for (let i = from; i >= 0; i -= 1) {
      const rect = blockRects[i];
      if (rect) return rect;
    }
    return null;
  };

  const firstBelow = (from: number): TargetRect | null => {
    for (let i = from; i < blockRects.length; i += 1) {
      const rect = blockRects[i];
      if (rect) return rect;
    }
    return null;
  };

  for (let index = 0; index <= blockRects.length; index += 1) {
    const above = lastAbove(index - 1);
    const below = firstBelow(index);

    const centreY =
      above === null
        ? (below?.top ?? columnRect.top)
        : below === null
          ? above.top + above.height
          : (above.top + above.height + below.top) / 2;

    into.push({
      id: `seam-${key}-${index}`,
      kind: "blockSeam",
      parent,
      index,
      rect: band(columnRect.left, centreY, columnRect.width),
    });
  }
};

/** The same, one rank up: the gaps between the rows of one sheet. */
const collectSectionSeams = (
  pageId: PageId,
  pageRect: TargetRect,
  sectionRects: readonly (TargetRect | null)[],
  into: Seam[],
): void => {
  const present = sectionRects.filter((rect): rect is TargetRect => !!rect);

  if (present.length === 0) {
    const inset = pageRect.width * EMPTY_PAGE_INSET;
    into.push({
      id: `rowseam-${pageId}-0`,
      kind: "sectionSeam",
      pageId,
      index: 0,
      rect: {
        left: pageRect.left + inset,
        top: pageRect.top + pageRect.height * EMPTY_PAGE_INSET,
        width: pageRect.width - inset * 2,
        height: pageRect.height * (1 - EMPTY_PAGE_INSET * 2),
      },
    });
    return;
  }

  /**
   * The seams span the measure the rows themselves occupy, not the sheet.
   * A caret running the full 210mm would cross the margins, which is exactly
   * where a row can never go.
   */
  const left = Math.min(...present.map((rect) => rect.left));
  const right = Math.max(...present.map((rect) => rect.left + rect.width));

  sectionRects.forEach((rect, index) => {
    if (!rect) return;
    into.push({
      id: `rowseam-${pageId}-${index}`,
      kind: "sectionSeam",
      pageId,
      index,
      rect: band(left, rect.top, right - left),
    });
  });

  const last = present.at(-1);
  if (!last) return;
  into.push({
    id: `rowseam-${pageId}-${sectionRects.length}`,
    kind: "sectionSeam",
    pageId,
    index: sectionRects.length,
    rect: band(left, last.top + last.height, right - left),
  });
};
