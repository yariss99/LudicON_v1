import { ArrowDown, ArrowUp, Copy, Pencil, Trash2 } from "lucide-react";
import { Button } from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import {
  canDuplicateSelection,
  canMoveSelection,
  duplicateSelected,
  moveSelectedBlock,
  moveSelectedSection,
  removeSelected,
} from "../document-actions";
import { useEditorStore } from "../editor-context";
import type { ResolvedSelection } from "../editor-store";
import type { EditableBlock } from "./block-text-editor";
import type { MeasuredRect } from "./use-measured-node";

/**
 * What can be done to the chosen piece, floating beside it.
 *
 * Reordering is up and down BUTTONS, not dragging. CH12 §8 requires a keyboard
 * route to every reorder, and a button is that route rather than a fallback
 * bolted onto a pointer gesture — drag, when it arrives, will be a second skin
 * over the same `moveBlock` command. The buttons stay put at the ends of the
 * list rather than disappearing, so the control does not move under the pointer
 * as a piece travels.
 *
 * These are ordinary `<button>`s inside the overlay, so the keyboard reaches
 * them by Tab once the paper has been left behind — which is why the paper's
 * own tab stop is rendered BEFORE this bar in `editor-overlay.tsx`. Tab order
 * follows the DOM, so the other order would have put the toolbar of the piece
 * you just chose behind you, reachable only by Shift+Tab.
 *
 * ## The ends of the list use `aria-disabled`, not `disabled`
 *
 * A real `disabled` was here first and it drops the keyboard on the floor:
 * pressing "mai sus" until the piece reaches the top disables the button under
 * the finger, and a disabled element cannot hold focus, so Chrome hands it to
 * `<body>` — the next Tab restarts at the top of the screen. The teacher's
 * reward for using the control correctly is losing their place. `aria-disabled`
 * says the same thing to a screen reader, paints the same 55% ink, and keeps
 * the button focusable; the handler declines the press instead of the browser
 * doing it. This is what the ARIA toolbar pattern asks for, and for this exact
 * reason.
 *
 * The guard is not decoration either: `moveSelectedBlock` has no ceiling of its
 * own, so a press past the end would clamp back onto the index it started from
 * and record a history step that changes nothing — one press of ⌘Z that appears
 * to do nothing at all.
 *
 * Removing hands focus back to the paper. The button removes the piece it
 * belongs to, so the bar it sits in unmounts underneath it; without this the
 * focus falls to `<body>` and the teacher who just deleted something has no
 * idea where they are.
 *
 * Split out of the overlay so that file stays composition: the overlay decides
 * what is drawn and where, this decides what the buttons do. They were one file
 * until the overlay grew a keyboard layer, two outlines and a placement hook,
 * at which point "everything the teacher can touch" stopped being one idea.
 */

/**
 * CH07's 44px floor, with no label to widen the box.
 *
 * `aria-disabled:opacity-55` restates by hand what `disabled:opacity-55` gives
 * the component for free, because these buttons are never really disabled — see
 * the note above. The ink is the design system's own figure so a spent control
 * looks the same here as everywhere else. Nothing switches weight or size.
 */
const ICON_BUTTON =
  "size-11 px-0 aria-disabled:cursor-default aria-disabled:opacity-55 aria-disabled:hover:bg-transparent";

export interface SelectionToolbarProps {
  /** Non-null: the bar is only drawn when something is chosen. */
  resolved: NonNullable<ResolvedSelection>;
  /** The chosen piece, when its text can be typed into. */
  editable: EditableBlock | undefined;
  /** Where the piece is, in the surface's coordinates. */
  rect: MeasuredRect;
  /** The bar's own name, and the name of what it acts on. */
  label: string;
  barHeight: number;
  gap: number;
  below: boolean;
  onEdit: () => void;
  /** Where focus goes when the piece this bar belongs to stops existing. */
  onReturnFocus: () => void;
}

export function SelectionToolbar({
  resolved,
  editable,
  rect,
  label,
  barHeight,
  gap,
  below,
  onEdit,
  onReturnFocus,
}: SelectionToolbarProps) {
  const store = useEditorStore();

  const canDuplicate = canDuplicateSelection(
    store.state.document,
    store.state.selection,
  );
  const canMoveUp = canMoveSelection(store.state, -1);
  const canMoveDown = canMoveSelection(store.state, 1);

  const move = (direction: -1 | 1) => {
    if (!canMoveSelection(store.state, direction)) return;
    if (resolved.kind === "block") moveSelectedBlock(store, direction);
    if (resolved.kind === "section") moveSelectedSection(store, direction);
  };

  return (
    <div
      role="toolbar"
      aria-label={label}
      className="pointer-events-auto absolute flex items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-soft"
      style={{
        left: rect.left,
        top: below ? rect.top + rect.height + gap : rect.top - barHeight,
      }}
    >
      <span className="px-2 text-sm text-muted-foreground">{label}</span>

      <Button
        variant="ghost"
        size="sm"
        className={ICON_BUTTON}
        aria-label={EVALUATION_COPY.moveUp}
        aria-disabled={!canMoveUp}
        onClick={() => move(-1)}
      >
        <ArrowUp aria-hidden strokeWidth={1.75} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={ICON_BUTTON}
        aria-label={EVALUATION_COPY.moveDown}
        aria-disabled={!canMoveDown}
        onClick={() => move(1)}
      >
        <ArrowDown aria-hidden strokeWidth={1.75} />
      </Button>

      {/* Between the moves and the edit on purpose. A copy is a structural act
          like moving — it changes what is on the page, not what a piece says —
          and it is the one action here a teacher reaches for repeatedly, so it
          sits inside the group their hand is already in. Placing it beside
          `Scoate de pe pagină` would put "make another" next to "remove this",
          which is the pair most likely to be mis-hit. */}
      {canDuplicate ? (
        <Button
          variant="ghost"
          size="sm"
          className={ICON_BUTTON}
          aria-label={EVALUATION_COPY.duplicate}
          onClick={() => duplicateSelected(store)}
        >
          <Copy aria-hidden strokeWidth={1.75} />
        </Button>
      ) : null}

      {editable ? (
        <Button
          variant="ghost"
          size="sm"
          className={ICON_BUTTON}
          aria-label={EVALUATION_COPY.editText}
          onClick={onEdit}
        >
          <Pencil aria-hidden strokeWidth={1.75} />
        </Button>
      ) : null}

      <Button
        variant="ghost"
        size="sm"
        className={`${ICON_BUTTON} text-destructive`}
        aria-label={EVALUATION_COPY.remove}
        onClick={() => {
          removeSelected(store);
          onReturnFocus();
        }}
      >
        <Trash2 aria-hidden strokeWidth={1.75} />
      </Button>
    </div>
  );
}
