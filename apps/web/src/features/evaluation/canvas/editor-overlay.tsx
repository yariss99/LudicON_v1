import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { BLOCK_KIND_LABEL, type BlockId } from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../copy";
import { replaceBlock } from "../document-actions";
import { useEditor, useEditorStore } from "../editor-context";
import { resolveSelection } from "../editor-store";
import { BlockTextEditor, isEditableBlock } from "./block-text-editor";
import { CanvasDragLayer } from "./canvas-dnd";
import { CanvasStopList } from "./canvas-stop-list";
import { stopSelector } from "./canvas-stops";
import { SelectionToolbar } from "./selection-toolbar";
import { useBarBelow } from "./use-bar-placement";
import { useCanvasRoving } from "./use-canvas-roving";
import { useMeasuredNode, type MeasuredRect } from "./use-measured-node";

/**
 * Everything the teacher can touch, drawn on top of the paper.
 *
 * The outlines, the action bar, the text field and the keyboard's one tab stop
 * live here rather than inside the blocks because `document-renderer.tsx` has
 * to stay a pure function of the model — see its docblock. This layer never
 * writes to the DOM the renderer owns; it measures it through the
 * `data-block-id` / `data-section-id` / `data-page-id` attributes the model
 * already justifies emitting, and draws beside what it found.
 *
 * That contract is the reason the keyboard fix is shaped the way it is. The
 * short version — `tabIndex={0}` on each block — would make the block itself
 * the focused element, and `theme.css` paints keyboard focus as a `--muted`
 * fill, so a focused heading would print as a grey band across the teacher's
 * paper. Here the only element that takes focus is a clipped box in
 * `canvas-stop-list.tsx`, and both indicators below are drawn over the sheet by
 * this layer, which no printer and no PDF worker ever sees.
 *
 * ## Two outlines, told apart by their stroke
 *
 * Where the arrows are standing is a DASHED outline; what is actually chosen is
 * the SOLID ring, and only the chosen thing carries the action bar. Two channels
 * — the stroke, and a toolbar that is either there or not — so the difference
 * does not rest on colour, which on the teacher's own paper cannot be relied on
 * anyway: the sheet keeps its colours in dark mode, so a neutral `--border` ink
 * that reads well against the app chrome is nearly invisible against white
 * paper. Both outlines are therefore `--primary`, which is the one ink in the
 * system chosen to sit on a light surface in both themes.
 *
 * The dashed outline is only drawn while the paper actually holds keyboard
 * focus. An outline saying "you are here" while the teacher is three panels
 * away is a lie, and the selection ring already covers what stays true.
 */

/** The bar's own height, and the air between it and the piece it belongs to. */
const BAR_HEIGHT = 52;
const BAR_GAP = 8;

/**
 * The outline sits two pixels outside the piece, so it never covers the first
 * or last glyph of the text it is pointing at.
 */
const outlineBox = (rect: MeasuredRect): CSSProperties => ({
  left: rect.left - 2,
  top: rect.top - 2,
  width: rect.width + 4,
  height: rect.height + 4,
});

export interface EditorOverlayProps {
  /** The surface the renderer drew into; every rectangle is relative to it. */
  containerRef: RefObject<HTMLElement | null>;
  /** The element that scrolls, which decides where the action bar can go. */
  viewportRef: RefObject<HTMLElement | null>;
  zoom: number;
}

export function EditorOverlay({
  containerRef,
  viewportRef,
  zoom,
}: EditorOverlayProps) {
  const store = useEditorStore();
  const document = useEditor((state) => state.document);
  const selection = useEditor((state) => state.selection);
  const [editingId, setEditingId] = useState<BlockId | null>(null);
  const stopsRef = useRef<HTMLDivElement | null>(null);

  /**
   * The paper is where focus belongs when a control removes itself.
   *
   * Both the remove button and the text field unmount the element the teacher
   * was standing on, and the browser's answer to that is `<body>` — which means
   * the next Tab starts from the top of the screen. This puts them back on the
   * sheet they were working on. `preventScroll`, because the stop is a clipped
   * box and bringing it into view would drag the paper with it.
   */
  const returnFocusToPaper = () =>
    stopsRef.current?.focus({ preventScroll: true });

  const resolved = useMemo(
    () => resolveSelection(document, selection),
    [document, selection],
  );

  const roving = useCanvasRoving({ document, selection, store, containerRef });

  const chosenRect = useMeasuredNode(
    containerRef,
    resolved ? stopSelector(resolved) : null,
    [document, zoom],
  );

  const focusedRect = useMeasuredNode(
    containerRef,
    roving.focused ? stopSelector(roving.focused) : null,
    [document, zoom],
  );

  const barBelow = useBarBelow({
    containerRef,
    viewportRef,
    rect: chosenRect,
    barHeight: BAR_HEIGHT,
    gap: BAR_GAP,
  });

  // A selection change ends the edit: the field belonged to the old piece.
  useEffect(() => {
    setEditingId((current) => (current === selection ? current : null));
  }, [selection]);

  const block =
    resolved?.kind === "block" ? document.blocks[resolved.id] : undefined;
  const editable = block && isEditableBlock(block) ? block : undefined;
  const editing = editable !== undefined && editingId === editable.id;

  const label =
    resolved?.kind === "block"
      ? EVALUATION_COPY.selectedPiece(
          BLOCK_KIND_LABEL[block?.kind ?? "paragraph"],
        )
      : resolved?.kind === "section"
        ? EVALUATION_COPY.selectedRow
        : EVALUATION_COPY.selectedPage;

  /**
   * The dashed outline is suppressed where the solid one already is. Two rings
   * around one piece is a control saying the same thing twice, and the outer
   * dashes would read as a second, larger selection.
   */
  const showFocusOutline =
    roving.focused !== null &&
    focusedRect !== null &&
    roving.focused.id !== selection;

  return (
    <div data-editor-overlay className="pointer-events-none absolute inset-0">
      {/* First in the DOM, so Tab runs paper → action bar → the panel beside
          it. See the note in `selection-toolbar.tsx`. */}
      <CanvasStopList
        roving={roving}
        selection={selection}
        stopsRef={stopsRef}
      />

      {/**
       * Before the outlines and the bar, and that order is the whole of its
       * stacking rule. The drag boxes cover every piece on the paper; the
       * action bar and the text field sit over one of them and must win, so
       * they are painted after. The two outlines never take a press, so where
       * they land in the order does not matter to the pointer — only to what
       * the teacher sees, and an outline over a transparent box is the same
       * outline.
       *
       * It is off while the text field is open: the field covers the piece it
       * belongs to, and a drag box underneath it would turn a swipe across a
       * word into a move of the paragraph.
       */}
      <CanvasDragLayer
        containerRef={containerRef}
        document={document}
        zoom={zoom}
        enabled={editingId === null}
      />

      {showFocusOutline && focusedRect ? (
        <div
          aria-hidden
          className="absolute rounded-sm border-2 border-dashed border-primary"
          style={outlineBox(focusedRect)}
        />
      ) : null}

      {resolved && chosenRect ? (
        <>
          <div
            aria-hidden
            className="absolute rounded-sm ring-2 ring-primary"
            style={outlineBox(chosenRect)}
          />

          <SelectionToolbar
            resolved={resolved}
            editable={editable}
            rect={chosenRect}
            label={label}
            barHeight={BAR_HEIGHT}
            gap={BAR_GAP}
            below={barBelow}
            onEdit={() => setEditingId(editable?.id ?? null)}
            onReturnFocus={returnFocusToPaper}
          />
        </>
      ) : null}

      {editing && editable && chosenRect ? (
        <BlockTextEditor
          block={editable}
          rect={chosenRect}
          onCommit={(next) => replaceBlock(store, next)}
          onClose={() => setEditingId(null)}
          onReturnFocus={returnFocusToPaper}
        />
      ) : null}
    </div>
  );
}
