import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import type { EvaluationProject } from "@ludicon/evaluation";

import {
  openPage,
  select,
  type EditorSelection,
  type EditorStore,
} from "../editor-store";
import {
  canvasStops,
  stopIndex,
  stopSelector,
  type CanvasStop,
  type CanvasStopId,
} from "./canvas-stops";

/**
 * One tab stop for the whole paper, and the arrow keys inside it.
 *
 * A ROVING TABINDEX, not a tabbable block per piece. Making every heading and
 * paragraph focusable is the two-line version of this fix and it is the wrong
 * one twice over. It puts the teacher through every piece on every sheet before
 * Tab can reach the library — forty presses on a two-page paper — and it makes
 * the block itself the focused element, which is precisely what
 * `theme.css`'s `:focus-visible` rule would then paint a `--muted` band across.
 * That band is on the sheet the teacher prints. So the tab stop is a single
 * element the teacher never sees, the arrows move a cursor inside it, and the
 * indicator is drawn over the paper by the overlay — never by the block.
 *
 * ## Focused and selected are two different things, on purpose
 *
 * The arrows move focus; Enter or Space commits it to the store as the
 * selection. That separation is what makes the keyboard usable at all: it lets
 * a teacher travel past six pieces to reach the seventh without the inspector,
 * the action bar and the page rail all changing under them six times. It is
 * also the reason `aria-activedescendant` exists as a pattern, and why this
 * reaches for it rather than moving DOM focus between mirrored elements.
 *
 * Selection made with the POINTER flows back the other way, so a teacher who
 * clicks a paragraph and then presses ArrowDown carries on from the paragraph
 * they clicked rather than from wherever the keyboard was left last.
 *
 * ## The edges do not wrap
 *
 * ArrowDown on the last piece stays there. Wrapping to the top of a two-page
 * paper is a jump of a full screen with no scroll to explain it, and the
 * teacher's next press then walks the wrong way. Clamping is also what the
 * up/down buttons already do — they disable at the ends — so the two ways of
 * moving agree about where the list stops.
 *
 * Escape gives up the SELECTION and leaves focus on the paper, rather than
 * blurring. Blurring was written first and it is a trap: focus lands on the
 * body, so the next Tab restarts from the top of the page and the teacher has
 * to walk the whole toolbar again to reach the settings of the piece they were
 * just on. Leaving focus where it is means Escape releases the paper and Tab
 * carries on into the panel beside it, which is what "leave" has to mean for a
 * keyboard.
 */

export interface CanvasRoving {
  readonly stops: readonly CanvasStop[];
  /** The stop the arrows are standing on. Never null while the paper has one. */
  readonly active: CanvasStop | null;
  /** The same stop, but only while the paper actually holds keyboard focus. */
  readonly focused: CanvasStop | null;
  readonly optionId: (id: CanvasStopId) => string;
  readonly hintId: string;
  readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  readonly onFocus: () => void;
  readonly onBlur: () => void;
}

export interface CanvasRovingOptions {
  readonly document: EvaluationProject;
  readonly selection: EditorSelection;
  readonly store: EditorStore;
  /** The surface the renderer drew into, for scrolling a stop into view. */
  readonly containerRef: RefObject<HTMLElement | null>;
}

export function useCanvasRoving({
  document,
  selection,
  store,
  containerRef,
}: CanvasRovingOptions): CanvasRoving {
  const listId = useId();
  const [activeId, setActiveId] = useState<CanvasStopId | null>(null);
  const [hasFocus, setHasFocus] = useState(false);

  const stops = useMemo(() => canvasStops(document), [document]);

  /**
   * Where to stand when the id is gone — see `stopIndex`.
   *
   * Recorded in an effect rather than during render: a ref written while
   * rendering is a value React may compute twice and keep once, and the whole
   * point of this one is that it remembers a position across the render in
   * which that position stopped existing.
   */
  const lastIndex = useRef(0);
  const index = stopIndex(stops, activeId, lastIndex.current);
  useEffect(() => {
    if (index >= 0) lastIndex.current = index;
  }, [index]);

  const active = index >= 0 ? (stops[index] ?? null) : null;

  // The pointer's selection is also the keyboard's position.
  useEffect(() => {
    if (selection !== null) setActiveId(selection);
  }, [selection]);

  /**
   * …and so is a press that chooses what was already chosen.
   *
   * The effect above watches a VALUE, so it does nothing when the teacher
   * clicks the piece that is already selected — and that is a real sequence:
   * arrow away from the selection to look at something, then click back onto
   * it. The selection never changed, so the keyboard cursor stayed where the
   * arrows had left it, and the next press moved from a place the teacher had
   * stopped thinking about. Watching the PRESS instead of the value covers both.
   *
   * A native listener on the surface, rather than folding this into
   * `editor-canvas.tsx`'s click handler, because the alternative is to hoist
   * this hook up there — and that component renders the paper. It would then
   * have to subscribe to the selection, and `DocumentRenderer` would re-run on
   * every click, which is the one cost the whole overlay design exists to avoid.
   *
   * `queueMicrotask` because this fires while the event is still bubbling
   * towards React's root listener, so the store has not been told yet. By the
   * time the microtask runs the dispatch is over and `store.state` is current.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const follow = () =>
      queueMicrotask(() => {
        const chosen = store.state.selection;
        if (chosen !== null) setActiveId(chosen);
      });

    container.addEventListener("click", follow);
    return () => container.removeEventListener("click", follow);
  }, [containerRef, store]);

  /**
   * Moving brings the piece on screen, and only ever by the shortest amount.
   *
   * `block: "nearest"` for the same reason the pages rail uses it: a sheet is
   * taller than the frame, so "start" or "center" would re-scroll the paper on
   * every press even when the next piece is already in plain sight.
   */
  const moveTo = useCallback(
    (nextIndex: number) => {
      const next = stops[nextIndex];
      if (!next) return;
      setActiveId(next.id);
      containerRef.current
        ?.querySelector(stopSelector(next))
        ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    },
    [stops, containerRef],
  );

  /**
   * Choosing opens the sheet first, then selects.
   *
   * In that order, because `openPage` clears the selection when the sheet
   * changes — it has to, so that an outline is never left pointing at a page
   * the teacher has scrolled away from. Selecting first would therefore select
   * and immediately deselect, and the only symptom would be an action bar that
   * flickers once when arrowing onto a new sheet.
   */
  const choose = useCallback(() => {
    if (!active) return;
    openPage(store, active.pageId);
    select(store, active.id);
  }, [active, store]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (stops.length === 0) return;

      switch (event.key) {
        // Both axes move by one. The pieces are a single column of reading
        // order, not a grid, so left and right have nothing else to mean — and
        // a teacher who tries the other pair should not find it dead.
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          moveTo(Math.min(index + 1, stops.length - 1));
          return;
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          moveTo(Math.max(index - 1, 0));
          return;
        case "Home":
          event.preventDefault();
          moveTo(0);
          return;
        case "End":
          event.preventDefault();
          moveTo(stops.length - 1);
          return;
        case "Enter":
        case " ":
          // Space would otherwise scroll the paper a screenful, which is the
          // browser default this control is standing in front of.
          event.preventDefault();
          choose();
          return;
        case "Escape":
          event.preventDefault();
          select(store, null);
          return;
        default:
          return;
      }
    },
    [stops.length, index, moveTo, choose, store],
  );

  const onFocus = useCallback(() => setHasFocus(true), []);
  const onBlur = useCallback(() => setHasFocus(false), []);

  const optionId = useCallback(
    (id: CanvasStopId) => `${listId}stop-${id}`,
    [listId],
  );

  return {
    stops,
    active,
    focused: hasFocus ? active : null,
    optionId,
    hintId: `${listId}keys`,
    onKeyDown,
    onFocus,
    onBlur,
  };
}
