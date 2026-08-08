import { useLayoutEffect, useState, type RefObject } from "react";

import type { MeasuredRect } from "./use-measured-node";

/**
 * Whether the action bar has to go below the piece instead of above it.
 *
 * The question is asked of the SCROLLER, not of the surface, and that is the
 * whole fix. `rect.top` is measured against the stack of sheets, which is
 * itself scrolled: a piece 900px down the paper has `rect.top === 900` whether
 * the teacher is looking at the top of the sheet or has scrolled it under the
 * frame's top edge. The old test — `rect.top < barHeight + gap` — therefore
 * only ever fired for pieces in the first 60px of page 1, and selecting
 * anything else near the top of the FRAME drew a bar above the visible area:
 * off-screen, unclickable, with nothing to say the selection had a toolbar at
 * all.
 *
 * Two conditions, not one. Flipping the bar downwards has to be a repair, not a
 * trade: a piece at the very bottom of the frame is clipped above AND below, and
 * moving the bar there would swap one invisible toolbar for another. When
 * neither end fits the bar stays above, because a bar clipped at the top still
 * shows its lower edge and still tells the teacher where to scroll.
 *
 * Recomputed on scroll, because scrolling is exactly what changes the answer
 * without changing the document, the zoom or the selection — the three things
 * `useMeasuredNode` already watches. `ResizeObserver` on the scroller covers the
 * fourth: dragging the panel beside it shorter.
 */

export interface BarPlacementOptions {
  /** The surface the overlay draws into — `rect` is relative to this. */
  readonly containerRef: RefObject<HTMLElement | null>;
  /** The element that actually scrolls. */
  readonly viewportRef: RefObject<HTMLElement | null>;
  readonly rect: MeasuredRect | null;
  readonly barHeight: number;
  readonly gap: number;
}

export function useBarBelow({
  containerRef,
  viewportRef,
  rect,
  barHeight,
  gap,
}: BarPlacementOptions): boolean {
  const [below, setBelow] = useState(false);

  /**
   * `useLayoutEffect` for the same reason `useMeasuredNode` uses it: the bar is
   * positioned from this answer, and computing it a frame late means the bar is
   * painted once in the wrong place and then jumps.
   */
  useLayoutEffect(() => {
    const container = containerRef.current;
    const viewport = viewportRef.current;
    if (!container || !viewport || !rect) {
      setBelow(false);
      return;
    }

    const measure = () => {
      const frame = viewport.getBoundingClientRect();
      const surface = container.getBoundingClientRect();
      const top = surface.top - frame.top + rect.top;
      const bottom = top + rect.height;

      const clippedAbove = top - gap - barHeight < 0;
      const fitsBelow = bottom + gap + barHeight <= frame.height;
      setBelow(clippedAbove && fitsBelow);
    };

    measure();

    viewport.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);

    return () => {
      viewport.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [containerRef, viewportRef, rect, barHeight, gap]);

  return below;
}
