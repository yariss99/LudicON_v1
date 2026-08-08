import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type ClientRect,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import type { EvaluationProject, SectionLayout } from "@ludicon/evaluation";

import type { PieceKind } from "../block-factory";
import { EVALUATION_COPY } from "../copy";
import {
  dropBlock,
  dropNewPiece,
  dropNewRow,
  dropSection,
} from "../document-actions";
import { useEditorStore } from "../editor-context";
import { openPage, select } from "../editor-store";
import {
  useDragTargets,
  type DragHandle,
  type DragTargets,
  type Seam,
  type TargetRect,
} from "./drag-targets";

/**
 * Dragging, as a second skin over the commands that already existed.
 *
 * Nothing in this file writes to the document. A drop works out which seam the
 * pointer is nearest and calls `dropBlock` / `dropSection` / `dropNewPiece` /
 * `dropNewRow`, each of which is exactly one command through `applyCommand` —
 * the same commands the "mai sus" and "mai jos" buttons and the library's own
 * buttons already use. That is why undo needs nothing new: a drag and a button
 * press leave identical entries in the history, and one press of ⌘Z takes
 * either of them back, including a piece dragged onto the page a moment ago.
 *
 * The rejected alternative was a drag-local reorder written straight to the
 * store with a command recorded afterwards. It is the shape every drag library
 * suggests, and it is a second mutation path: the moment it exists, the
 * document can change without a command, and every undo taken after that
 * applies an inverse against a state it was not derived from.
 *
 * ## Why the context is a provider the builder mounts, and this layer is not it
 *
 * A drag that starts in the library and ends on the paper crosses two regions
 * that share no ancestor below the builder screen. dnd-kit resolves a drop
 * inside ONE `DndContext`: a draggable registers with the nearest one above it,
 * and so does a droppable. With the context where it used to be — inside this
 * layer, inside the canvas overlay — a library item was simply not in the same
 * conversation as the seams, and no amount of measuring here would have changed
 * that. A second, nested context would not have either: the seams are in the
 * inner one and the library item in the outer, so they still never meet.
 *
 * So `CanvasDragProvider` holds the context and `builder-screen.tsx` mounts it
 * around the whole builder, while `CanvasDragLayer` stays exactly where it was
 * and registers into it. The two are joined by the two contexts below rather
 * than by props, because the layer is mounted by `editor-overlay.tsx`, three
 * components down, and threading a seam list through that is a prop appearing
 * in files with no interest in dragging.
 *
 * The seams travel UP through a ref rather than through state. They are
 * remeasured on every edit, every zoom and every resize; as state they would
 * re-render the provider, and therefore the whole builder, on each one.
 *
 * ## The keyboard is not routed through here, deliberately
 *
 * dnd-kit ships a `KeyboardSensor` and it is not registered. It activates from
 * a FOCUSED draggable, using Space or Enter to lift and the arrow keys to move
 * — and those five keys already belong to `use-canvas-roving.ts`, where the
 * arrows walk the paper and Enter chooses a piece. Registering it would need
 * every one of these boxes to be focusable, which is precisely the roving
 * tabindex being thrown away: forty tab stops on a two-page paper, and
 * `theme.css` painting `:focus-visible` as a `--muted` band on the sheet.
 *
 * So these boxes are `aria-hidden` and take no focus. The keyboard route to
 * reordering is the one CH12 §8 asks for and the one that already shipped: the
 * up and down buttons in `selection-toolbar.tsx`, always available, never
 * disappearing at the ends of a list — and the keyboard route to ADDING is the
 * library's buttons, which are still buttons and still add on a press. Drag is
 * sugar; it is not the route.
 *
 * ## Why the boxes are here and not on the blocks
 *
 * `document-renderer.tsx` is the print and PDF renderer. A `useDraggable` ref
 * inside it would put `role`, `tabindex` and `data-dnd` attributes on the
 * teacher's printed paper. Everything below is measured off the rendered sheet
 * by `./drag-targets.ts` and drawn over it, exactly as the selection outline
 * is, and none of it exists in `preview` — the overlay that mounts this layer
 * is not rendered at all in that mode, and with no layer there are no seams, so
 * a drag started in the library there lands nowhere and changes nothing.
 */

/** How far the pointer must travel before a press becomes a drag. */
const DRAG_THRESHOLD = 6;

/** Above this height a seam is a container to drop INTO, not a gap. */
const CONTAINER_SEAM = 40;

/**
 * What is in the teacher's hand.
 *
 * Four cases and not two, because "move this" and "make one of these" are
 * genuinely different gestures: one has a source to detach from and the other
 * does not, and the seam arithmetic differs for exactly that reason — see
 * `dropNewPiece` in `../document-actions.ts`. Every case carries its own
 * `label`, so the chip and dnd-kit's live region read one field instead of
 * branching on the kind a second time.
 */
export type DragPayload =
  | {
      readonly kind: "block";
      readonly label: string;
      readonly handle: DragHandle;
    }
  | {
      readonly kind: "section";
      readonly label: string;
      readonly handle: DragHandle;
    }
  | {
      readonly kind: "library";
      readonly label: string;
      readonly piece: PieceKind;
    }
  | {
      readonly kind: "libraryRow";
      readonly label: string;
      readonly layout: SectionLayout;
    };

/** Which rank of seam a payload is allowed to land on. */
const seamRankFor = (kind: unknown): Seam["kind"] =>
  kind === "section" || kind === "libraryRow" ? "sectionSeam" : "blockSeam";

/**
 * The canvas telling the provider what it measured.
 *
 * A stable function, so the layer's publishing effect depends on nothing that
 * changes while a drag is running.
 */
const PublishSeamsContext = createContext<
  (targets: DragTargets | null) => void
>(() => {});

/** The provider telling the canvas where the caret goes. */
interface Landing {
  readonly seam: Seam | null;
  readonly lifted: boolean;
}

const LandingContext = createContext<Landing>({ seam: null, lifted: false });

export interface CanvasDragProviderProps {
  children: ReactNode;
}

export function CanvasDragProvider({ children }: CanvasDragProviderProps) {
  const store = useEditorStore();
  const seams = useRef(new Map<string, Seam>());
  const [lifted, setLifted] = useState<DragPayload | null>(null);
  const [landing, setLanding] = useState<Seam | null>(null);

  /**
   * A press is a selection — or an add — until it has travelled six pixels.
   *
   * Without the constraint every click on a piece would start a drag, and the
   * click that selects it would be swallowed by the sensor. dnd-kit only
   * attaches its click suppressor once the constraint is met, so a press that
   * never moves reaches the underlying `onClick` untouched. That is what keeps
   * pointer selection working now that the handle boxes sit over the paper, and
   * it is the whole reason pressing a library item still adds a piece exactly
   * as it did before this file learned about the library.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_THRESHOLD },
    }),
  );

  const publish = useCallback((targets: DragTargets | null) => {
    seams.current = new Map(
      (targets?.seams ?? []).map((seam) => [seam.id, seam]),
    );
  }, []);

  const onDragStart = useCallback((event: DragStartEvent) => {
    setLifted(payloadOf(event.active.data.current));
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const payload = lifted;
      const seam = event.over
        ? seams.current.get(String(event.over.id))
        : undefined;
      setLifted(null);
      setLanding(null);
      if (!payload || !seam) return;

      if (payload.kind === "library" && seam.kind === "blockSeam") {
        dropNewPiece(store, payload.piece, seam.parent, seam.index);
        return;
      }

      if (payload.kind === "libraryRow" && seam.kind === "sectionSeam") {
        dropNewRow(store, payload.layout, seam.pageId, seam.index);
        return;
      }

      if (
        payload.kind === "block" &&
        payload.handle.blockId &&
        seam.kind === "blockSeam"
      ) {
        dropBlock(store, payload.handle.blockId, seam.parent, seam.index);
        return;
      }

      if (
        payload.kind === "section" &&
        payload.handle.sectionId &&
        seam.kind === "sectionSeam"
      ) {
        dropSection(store, payload.handle.sectionId, seam.pageId, seam.index);
      }
    },
    [lifted, store],
  );

  const announcements = useMemo(
    (): Announcements => ({
      onDragStart: ({ active }) =>
        EVALUATION_COPY.dragStarted(labelOf(active.data.current)),
      onDragOver: ({ over }) =>
        over ? EVALUATION_COPY.dragOverSeam : undefined,
      onDragEnd: ({ active }) =>
        EVALUATION_COPY.dragEnded(labelOf(active.data.current)),
      onDragCancel: ({ active }) =>
        EVALUATION_COPY.dragCancelled(labelOf(active.data.current)),
    }),
    [],
  );

  const landingValue = useMemo(
    (): Landing => ({ seam: landing, lifted: lifted !== null }),
    [landing, lifted],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={nearestSeam}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable: EVALUATION_COPY.dragKeyboardNote,
        },
      }}
      onDragStart={onDragStart}
      onDragMove={(event) =>
        setLanding(
          event.over
            ? (seams.current.get(String(event.over.id)) ?? null)
            : null,
        )
      }
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setLifted(null);
        setLanding(null);
      }}
    >
      <PublishSeamsContext.Provider value={publish}>
        <LandingContext.Provider value={landingValue}>
          {children}
        </LandingContext.Provider>
      </PublishSeamsContext.Provider>

      {/**
       * No drop animation. dnd-kit's default flies the ghost back to the
       * dragged node's old rectangle over 250ms with a `1.22` overshoot — an
       * easing this product forbids outright, and an animation that would be
       * pointing at the wrong place anyway, because the command has already
       * landed and the piece is no longer there.
       */}
      <DragOverlay dropAnimation={null} modifiers={[toPointer]}>
        {lifted ? <DragChip label={lifted.label} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * A library item, made liftable without ceasing to be a button.
 *
 * `listeners` only — the `attributes` dnd-kit also offers are not spread, for
 * the same reason the handles below skip them: they would put a second
 * `role="button"` and an `aria-roledescription` on something that already is a
 * button, and would have a screen reader announce "draggable item" in place of
 * the piece's own Romanian name.
 *
 * `touch-action` is left alone as well, which is a trade rather than an
 * oversight. dnd-kit's own attributes set `touch-action: none`, and these
 * buttons live inside the library's scroller — so setting it would turn a
 * finger drag down the list of pieces into a lift. On touch the tap still adds,
 * which is the route that has to work.
 */
export function useLibraryDrag(id: string, payload: DragPayload) {
  const { setNodeRef, listeners } = useDraggable({ id, data: payload });
  return { setNodeRef, listeners };
}

export interface CanvasDragLayerProps {
  containerRef: RefObject<HTMLElement | null>;
  document: EvaluationProject;
  zoom: number;
  /** Off while the inline text field is open, so a drag cannot steal a caret. */
  enabled: boolean;
}

export function CanvasDragLayer({
  containerRef,
  document,
  zoom,
  enabled,
}: CanvasDragLayerProps) {
  const store = useEditorStore();
  const targets = useDragTargets(containerRef, document, zoom, enabled);
  const publish = useContext(PublishSeamsContext);
  const landing = useContext(LandingContext);

  /**
   * The seams are published after the commit that measured them, and withdrawn
   * when this layer goes away — which it does in `preview` and while the inline
   * text field is open. Leaving the last measurement behind would let a drag
   * started in the library land against a paper that is no longer on screen.
   */
  useEffect(() => {
    publish(enabled ? targets : null);
    return () => publish(null);
  }, [publish, targets, enabled]);

  if (!enabled) return null;

  return (
    <>
      {targets.handles.map((handle) => (
        <Handle
          key={handle.id}
          handle={handle}
          onChoose={() => {
            const chosen = handle.blockId ?? handle.sectionId;
            if (!chosen) return;
            // The sheet opens first: `openPage` clears the selection when it
            // changes, so the other order would select and immediately unselect.
            openPage(store, handle.pageId);
            select(store, chosen);
          }}
        />
      ))}

      {targets.seams.map((seam) => (
        <SeamZone key={seam.id} seam={seam} />
      ))}

      {landing.lifted && landing.seam ? (
        <DropCaret rect={landing.seam.rect} />
      ) : null}
    </>
  );
}

/**
 * What dnd-kit handed back, narrowed.
 *
 * `active.data.current` is `Record<string, unknown>` by the library's own
 * typing, so the two fields every payload is built with are checked before the
 * union is trusted. A drag from something that is not one of ours therefore
 * lifts nothing and drops nothing, rather than reaching `onDragEnd` as a
 * half-shaped object.
 */
const payloadOf = (
  data: Record<string, unknown> | undefined,
): DragPayload | null =>
  data && typeof data.kind === "string" && typeof data.label === "string"
    ? (data as unknown as DragPayload)
    : null;

const labelOf = (data: Record<string, unknown> | undefined): string =>
  (typeof data?.label === "string" ? data.label : "").toLowerCase();

/**
 * The box you can pick a piece up by.
 *
 * It sits exactly over what the renderer drew, takes the press, and hands the
 * click on as a selection — the same selection `editor-canvas.tsx` would have
 * made by delegation, which it can no longer do because this box is in front of
 * the paper. Rows are pushed before their pieces in `./drag-targets.ts`, so a
 * piece is always in front of the row it belongs to and the two agree with what
 * `closest()` used to answer.
 *
 * `aria-hidden` and no `tabIndex`, and the `attributes` dnd-kit offers are not
 * spread. They would add `role="button"` and a tab stop per piece; the
 * accessible mirror of this paper is the listbox in `canvas-stop-list.tsx`, and
 * two mirrors of the same document is one too many.
 */
function Handle({
  handle,
  onChoose,
}: {
  handle: DragHandle;
  onChoose: () => void;
}) {
  const payload: DragPayload =
    handle.kind === "section"
      ? { kind: "section", label: handle.label, handle }
      : { kind: "block", label: handle.label, handle };

  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: handle.id,
    data: payload,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      aria-hidden
      onClick={onChoose}
      style={boxStyle(handle.rect)}
      className="group pointer-events-auto cursor-grab touch-manipulation active:cursor-grabbing"
    >
      {/**
       * A rail at the left edge, on hover only.
       *
       * The third indicator this paper carries, so it has to be a different
       * SHAPE from the other two rather than a different colour: selection is a
       * solid ring, keyboard position is a dashed one, and "you can pick this
       * up" is a bar down the side — which is also the handle every document
       * editor draws in that spot. It sits six pixels outside the piece, inside
       * the sheet's 18mm margin, so it never covers a glyph.
       */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 -left-1.5 w-1 rounded-full bg-primary transition-opacity duration-[var(--motion-fast)] ease-standard ${
          isDragging ? "opacity-0" : "opacity-0 group-hover:opacity-100"
        }`}
      />
    </div>
  );
}

/** One gap, registered so the collision has something to name. */
function SeamZone({ seam }: { seam: Seam }) {
  const { setNodeRef } = useDroppable({
    id: seam.id,
    data: { kind: seam.kind },
  });

  return (
    <div
      ref={setNodeRef}
      aria-hidden
      style={boxStyle(seam.rect)}
      className="pointer-events-none"
    />
  );
}

/**
 * Where it will land.
 *
 * A caret with serifs, not a coloured band. The bar says "between these two"
 * and the two end ticks give it the shape of an insertion point — a reading
 * that survives greyscale, which a tinted gap does not. A tall seam is a whole
 * empty column or a sheet with no rows on it, and there the message is "into
 * here" rather than "between", so the outline is drawn as well.
 */
function DropCaret({ rect }: { rect: TargetRect }) {
  const container = rect.height > CONTAINER_SEAM;
  const centreY = rect.top + rect.height / 2;

  return (
    <>
      {container ? (
        <div
          aria-hidden
          style={boxStyle(rect)}
          className="pointer-events-none rounded-md border-2 border-primary"
        />
      ) : null}

      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ left: rect.left, top: centreY - 1.5, width: rect.width }}
      >
        <span className="block h-[3px] w-full rounded-full bg-primary" />
        <span className="absolute -top-1.5 left-0 h-[15px] w-[3px] rounded-full bg-primary" />
        <span className="absolute -top-1.5 right-0 h-[15px] w-[3px] rounded-full bg-primary" />
      </div>
    </>
  );
}

/**
 * What is in the teacher's hand.
 *
 * Chrome, not paper: it never prints, so it uses the product's semantic tokens
 * rather than the theme's inks, and it names the piece in words because a
 * translucent copy of a paragraph tells you what you grabbed only if you can
 * still read it at 60% opacity over another paragraph.
 */
function DragChip({ label }: { label: string }) {
  return (
    <div className="pointer-events-none inline-flex w-fit items-center gap-2 rounded-full bg-primary py-2 pr-4 pl-3 text-sm text-primary-foreground shadow-soft">
      <GripVertical aria-hidden strokeWidth={1.75} className="size-4" />
      {label}
    </div>
  );
}

const boxStyle = (rect: TargetRect) => ({
  position: "absolute" as const,
  left: rect.left,
  top: rect.top,
  width: rect.width,
  height: rect.height,
});

/**
 * The chip follows the POINTER, not the piece.
 *
 * Without this the overlay is anchored to the top-left of whatever was picked
 * up, which for a full-width paragraph is a chip floating in the left margin
 * while the teacher's hand is somewhere over the middle of the page — and for a
 * library item, a chip pinned to a button in a panel the teacher has already
 * dragged away from. The fourteen-pixel nudge keeps it out from under the
 * cursor itself.
 */
const toPointer: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  transform,
}) => {
  if (!draggingNodeRect || !activatorEvent) return transform;
  const pointer = activatorEvent as PointerEvent;
  return {
    ...transform,
    x: transform.x + (pointer.clientX - draggingNodeRect.left) + 14,
    y: transform.y + (pointer.clientY - draggingNodeRect.top) + 14,
  };
};

/**
 * The seam nearest the pointer, of the rank being dragged.
 *
 * dnd-kit's own detectors were all wrong here for the same reason: they compare
 * the DRAGGED RECTANGLE against the targets, and the dragged rectangle is a
 * full-width paragraph while the target is a twenty-pixel gap — so
 * `rectIntersection` overlaps a dozen seams at once and `closestCenter` picks
 * whichever is nearest the middle of a box the teacher is not looking at. The
 * pointer is what a teacher is aiming with, so the pointer is what is measured.
 * That matters twice over for a library item, whose rectangle is a button in a
 * panel several hundred pixels from the paper it is being aimed at.
 *
 * Inside beats near: if the pointer is within a seam's band, that band wins
 * outright, and among several the nearest centre line decides. That is what
 * makes an empty column — whose seam is the whole column — behave as a
 * container you drop into rather than as a line you have to find.
 *
 * The rank filter is what keeps rows and pieces from competing: a row being
 * dragged only ever sees the gaps between rows, so it can never be dropped into
 * a column, which is a move `moveSection` cannot express anyway. A new row from
 * the library is the same rank as a row already on the page, and a new piece
 * the same rank as a piece already on it — which is the whole of what "treat a
 * library item like a block" amounts to.
 */
const nearestSeam: CollisionDetection = ({
  active,
  collisionRect,
  droppableContainers,
  droppableRects,
  pointerCoordinates,
}) => {
  const wanted = seamRankFor(active.data.current?.kind);

  const point = pointerCoordinates ?? {
    x: collisionRect.left + collisionRect.width / 2,
    y: collisionRect.top + collisionRect.height / 2,
  };

  let best: { id: string; inside: boolean; distance: number } | null = null;

  for (const container of droppableContainers) {
    if (container.data.current?.kind !== wanted) continue;
    const rect = droppableRects.get(container.id);
    if (!rect) continue;

    const scored = score(point, rect);
    if (
      best === null ||
      (scored.inside && !best.inside) ||
      (scored.inside === best.inside && scored.distance < best.distance)
    ) {
      best = { id: String(container.id), ...scored };
    }
  }

  return best
    ? [{ id: best.id, data: { value: best.distance, inside: best.inside } }]
    : [];
};

const score = (
  point: { x: number; y: number },
  rect: ClientRect,
): { inside: boolean; distance: number } => {
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;
  const dx = Math.max(rect.left - point.x, 0, point.x - right);
  const dy = Math.max(rect.top - point.y, 0, point.y - bottom);
  const inside = dx === 0 && dy === 0;

  const centreY = rect.top + rect.height / 2;
  return {
    inside,
    distance: inside
      ? Math.abs(point.y - centreY)
      : Math.sqrt(dx * dx + dy * dy),
  };
};
