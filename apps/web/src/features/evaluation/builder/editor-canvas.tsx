import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { BlockId, PageId, SectionId } from "@ludicon/evaluation";
import { Button, ScrollArea, Slider } from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import type { RenderMode } from "../canvas/block-view";
import { DocumentRenderer } from "../canvas/document-renderer";
import { EditorOverlay } from "../canvas/editor-overlay";
import { useEditor, useEditorStore } from "../editor-context";
import { openPage, select } from "../editor-store";

/**
 * The working surface: the paper, plus the one layer over it that responds.
 *
 * Selection is EVENT DELEGATION on the wrapper, reading the `data-*` attributes
 * the renderer emits, rather than an `onClick` on every block. Handlers inside
 * blocks would be the third thing that made the renderer impure — after
 * selection state and hover styling — and this way a block kind added next
 * slice is selectable without anyone remembering to wire it.
 *
 * `closest` resolves the nearest container, so a click on a heading selects the
 * heading and a click on the white space beside it selects the row it sits in.
 * That is the behaviour of every document editor and it falls out of the DOM
 * nesting for free.
 *
 * Zoom lives here as view state rather than in the store. It is a property of
 * this screen, not of the paper — two teachers opening the same document should
 * not inherit each other's magnification — so putting it in the document store
 * would make it a candidate for autosave, which it must never be.
 *
 * ## The pointer hands over to the keyboard
 *
 * A click also moves focus onto the paper's tab stop, so a teacher who clicked
 * a paragraph can carry straight on with the arrow keys. Without it the two
 * halves of the same gesture live in different places: the store knows what was
 * chosen, the keyboard is still parked wherever it was last, and the first
 * ArrowDown jumps somewhere unrelated. It costs nothing to a mouse user —
 * `:focus-visible` does not match a pointer press, so nothing is painted.
 */

const ZOOM_STEPS = { min: 50, max: 150, step: 5, actual: 100 } as const;

export interface EditorCanvasProps {
  mode: RenderMode;
}

export function EditorCanvas({ mode }: EditorCanvasProps) {
  const store = useEditorStore();
  const document = useEditor((state) => state.document);
  const currentPageId = useEditor((state) => state.currentPageId);
  const [zoomPercent, setZoomPercent] = useState(75);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  /**
   * The rail is a navigator, so choosing a sheet has to arrive at it.
   *
   * All the sheets are rendered in one column, so `currentPageId` moved the
   * highlight in the rail and nothing else: pressing "Pagina 2" left the
   * teacher looking at the cover, which is the strongest possible signal that a
   * control is broken.
   *
   * `block: "nearest"` is doing real work here and is not a default worth
   * skipping past: it scrolls only when the sheet is not already on screen. So
   * clicking a piece — which also sets the current page — moves nothing, and
   * the rule that the canvas never jumps under the teacher's hand survives.
   *
   * The scroll is instant. Motion in this product is capped at 250ms and a
   * smooth scroll cannot be given a duration, so the honest choice is no
   * animation rather than one that ignores the cap.
   *
   * The first run is skipped. A sheet is taller than the frame, so "nearest"
   * on mount means "start", and the paper opened with its top margin scrolled
   * off — 40px of movement before the teacher had touched anything. This
   * reacts to a change of sheet, which is the only thing it is for.
   */
  const shownPageId = useRef(currentPageId);
  useEffect(() => {
    if (shownPageId.current === currentPageId) return;
    shownPageId.current = currentPageId;
    surfaceRef.current
      ?.querySelector(`[data-page-id="${CSS.escape(currentPageId)}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [currentPageId]);

  const onPick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (mode === "preview") return;
      const target = event.target as HTMLElement;

      /**
       * The overlay's own controls sit inside this container, so their clicks
       * bubble here too. Without this guard, pressing "mai sus" ran the move
       * and then immediately cleared the selection — the button reached is
       * inside no page, no row and no piece, which is the "clicked the
       * background" case. Measured, not theorised: it is why the inline text
       * field appeared and vanished in the same frame.
       */
      if (target.closest("[data-editor-overlay]")) return;

      /**
       * `preventScroll`, because the stop is a clipped box: without it the
       * browser would scroll to bring a one-pixel element into view and take
       * the paper with it, on every click.
       */
      surfaceRef.current
        ?.querySelector<HTMLElement>("[data-canvas-stops]")
        ?.focus({ preventScroll: true });

      const page = target.closest<HTMLElement>("[data-page-id]");
      const pageId = page?.dataset.pageId;
      if (pageId) openPage(store, PageId.parse(pageId));

      const block = target.closest<HTMLElement>("[data-block-id]");
      if (block?.dataset.blockId) {
        select(store, BlockId.parse(block.dataset.blockId));
        return;
      }

      const section = target.closest<HTMLElement>("[data-section-id]");
      if (section?.dataset.sectionId) {
        select(store, SectionId.parse(section.dataset.sectionId));
        return;
      }

      select(store, pageId ? PageId.parse(pageId) : null);
    },
    [mode, store],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-studio-canvas">
      {/**
       * `axis="both"`, and the row inside it is `w-fit min-w-full`.
       *
       * A sheet is 794 CSS pixels at 100% and does not shrink to fit; at 1024px
       * with two panels beside it, it is wider than the space left for it. A
       * plain `justify-center` row then centres content it cannot contain,
       * which pushes the left-hand margin out past the start of the scrollable
       * area where nothing can reach it — measured at 1024×800, where 105px of
       * the page was unreachable and no scrollbar existed to say so.
       *
       * `w-fit` lets the row grow to the sheet so both margins stay inside the
       * scrollable width; `min-w-full` keeps it filling the frame so that
       * `justify-center` still centres a sheet that does fit.
       */}
      <ScrollArea
        axis="both"
        viewportRef={viewportRef}
        className="min-h-0 flex-1"
      >
        <div className="flex w-fit min-w-full justify-center px-8 py-10">
          {/* `relative` is the coordinate space the overlay measures against. */}
          <div ref={surfaceRef} className="relative" onClick={onPick}>
            <DocumentRenderer
              document={document}
              theme={document.theme}
              mode={mode}
              zoom={zoomPercent / 100}
            />
            {mode === "edit" ? (
              <EditorOverlay
                containerRef={surfaceRef}
                viewportRef={viewportRef}
                zoom={zoomPercent / 100}
              />
            ) : null}
          </div>
        </div>
      </ScrollArea>

      <div className="flex shrink-0 items-center gap-3 border-t border-border bg-surface px-4 py-2">
        <span className="shrink-0 text-sm text-muted-foreground">
          {EVALUATION_COPY.zoom}
        </span>
        <Slider
          className="max-w-56"
          value={[zoomPercent]}
          min={ZOOM_STEPS.min}
          max={ZOOM_STEPS.max}
          step={ZOOM_STEPS.step}
          thumbLabels={[EVALUATION_COPY.zoom]}
          onValueChange={([next]) => setZoomPercent(next ?? zoomPercent)}
        />
        {/**
         * The readout is the way back to 100%.
         *
         * A slider whose only route to a round number is landing on it by hand
         * is a slider a teacher fights; the number was already printed here and
         * was already the thing they look at, so it is the control. Its width is
         * fixed because "75%" and "100%" do not measure the same, and a readout
         * that resizes drags its own neighbours sideways as the thumb moves.
         */}
        <Button
          variant="ghost"
          size="sm"
          aria-label={EVALUATION_COPY.zoomActual}
          className="w-16 shrink-0 justify-center px-0 text-sm font-normal tabular-nums text-muted-foreground"
          onClick={() => setZoomPercent(ZOOM_STEPS.actual)}
        >
          {zoomPercent}%
        </Button>
      </div>
    </div>
  );
}
