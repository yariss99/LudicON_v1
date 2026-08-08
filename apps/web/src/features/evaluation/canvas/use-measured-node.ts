import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * Where a rendered node sits inside its container.
 *
 * This is what lets the canvas draw a selection outline without the renderer
 * knowing anything about selection. The renderer emits `data-block-id`; the
 * overlay asks this hook where that id ended up; the outline is an absolutely
 * positioned box at those coordinates. The alternative — passing `selected`
 * down into the block — is one prop and it costs the whole property that makes
 * the renderer reusable for print.
 *
 * `useLayoutEffect`, not `useEffect`: the measurement has to happen in the same
 * frame the document changed, or the outline is drawn one frame behind and
 * visibly slides into place after every edit.
 *
 * A `ResizeObserver` on the container covers everything that moves the node
 * without changing the dependencies — a font finishing loading, the panel being
 * dragged narrower, an image arriving. Observing the node itself would miss the
 * case that matters most: a block above it growing, which moves this one
 * without resizing it.
 */

export interface MeasuredRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

const sameRect = (a: MeasuredRect | null, b: MeasuredRect | null): boolean =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height);

export function useMeasuredNode(
  containerRef: RefObject<HTMLElement | null>,
  selector: string | null,
  /** Anything that can move the node: the document, the zoom, the mode. */
  changes: readonly unknown[],
): MeasuredRect | null {
  const [rect, setRect] = useState<MeasuredRect | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || selector === null) {
      setRect((current) => (current === null ? current : null));
      return;
    }

    const measure = () => {
      const node = container.querySelector(selector);
      if (!node) {
        setRect((current) => (current === null ? current : null));
        return;
      }

      const outer = container.getBoundingClientRect();
      const inner = node.getBoundingClientRect();
      const next: MeasuredRect = {
        left: inner.left - outer.left,
        top: inner.top - outer.top,
        width: inner.width,
        height: inner.height,
      };
      setRect((current) => (sameRect(current, next) ? current : next));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, selector, ...changes]);

  return rect;
}
