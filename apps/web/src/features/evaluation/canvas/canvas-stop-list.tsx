import type { RefObject } from "react";

import type { EditorSelection } from "../editor-store";
import { EVALUATION_COPY } from "../copy";
import type { CanvasRoving } from "./use-canvas-roving";

/**
 * The paper's one tab stop, and the sheets and pieces it names.
 *
 * A mirror of the document in the accessibility tree — one `option` per stop —
 * rather than roles and ids written onto the blocks themselves. That is the
 * whole reason this file exists: `document-renderer.tsx` is a pure function of
 * the model and is also the print and PDF renderer, so an `id`, a `role` or an
 * `aria-selected` added there would travel to the printed sheet, and the
 * renderer would have to start taking props about a selection that does not
 * exist on paper. Mirroring costs one hidden element per piece and keeps that
 * contract exactly as it was.
 *
 * `aria-activedescendant` is what makes one tab stop able to say where it is.
 * The alternative — moving real DOM focus between the mirrored options — would
 * put `:focus-visible` on an element inside the canvas on every arrow press,
 * and `theme.css` paints that as a `--muted` fill. Here the only element that
 * ever takes focus is this one, and it is clipped to nothing, so the tint lands
 * on a box a millimetre across that no one can see. What the teacher sees is
 * the ring the overlay draws over the paper.
 *
 * ## Why it is `fixed` rather than the usual absolutely-positioned sr-only box
 *
 * This lives inside the canvas scroller. An absolutely positioned hidden box
 * sits at the surface's top-left — the top-left of the first sheet — and the
 * browser scrolls a newly focused element into view, so tabbing onto the paper
 * while looking at page 2 threw the view back to the top of page 1. A fixed box
 * has the viewport as its containing block, so there is nothing to scroll it
 * into and the paper stays where the teacher left it.
 *
 * The keyboard sentence is a sibling, not a child. A paragraph inside
 * `role="listbox"` is a child of the wrong type and screen readers are entitled
 * to drop it or to read it as an option; `aria-describedby` reaches it from
 * outside without claiming it is one of the stops.
 */

export interface CanvasStopListProps {
  roving: CanvasRoving;
  /** What the store currently holds, which is what `aria-selected` reports. */
  selection: EditorSelection;
  /**
   * The element itself, so the overlay can hand focus back to the paper after a
   * control that removes itself — see `selection-toolbar.tsx`.
   */
  stopsRef: RefObject<HTMLDivElement | null>;
}

/** Clipped to nothing, still in the accessibility tree, still focusable. */
const HIDDEN =
  "fixed m-[-1px] size-px overflow-hidden border-0 p-0 whitespace-nowrap [clip-path:inset(50%)]";

export function CanvasStopList({
  roving,
  selection,
  stopsRef,
}: CanvasStopListProps) {
  const { stops, active, optionId, hintId } = roving;

  return (
    <>
      <p id={hintId} className={HIDDEN}>
        {EVALUATION_COPY.paperKeys}
      </p>

      <div
        ref={stopsRef}
        data-canvas-stops
        role="listbox"
        tabIndex={0}
        aria-label={EVALUATION_COPY.paperStops}
        aria-describedby={hintId}
        aria-activedescendant={active ? optionId(active.id) : undefined}
        className={`pointer-events-auto ${HIDDEN}`}
        onKeyDown={roving.onKeyDown}
        onFocus={roving.onFocus}
        onBlur={roving.onBlur}
      >
        {stops.map((stop) => (
          <div
            key={stop.id}
            id={optionId(stop.id)}
            role="option"
            aria-selected={stop.id === selection}
          >
            {stop.label}
          </div>
        ))}
      </div>
    </>
  );
}
