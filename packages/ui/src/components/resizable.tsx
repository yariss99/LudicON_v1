import * as ResizablePrimitive from "react-resizable-panels";
import { GripVertical } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "../lib/cn";

/**
 * Hit-target floor for a drag, in pixels, per pointer class.
 *
 * `react-resizable-panels` ships `{ coarse: 20, fine: 10 }`, and 20px on a
 * touchscreen is under half CH07's 44px minimum. This is the one control in the
 * system where the target cannot be fixed by painting it bigger: a 44px seam is
 * 44px taken from the panels on either side, and an invisible 44px overlay
 * swallows clicks meant for the content underneath it. `resizeTargetMinimumSize`
 * is the library's own answer — the grab region grows past the painted line
 * without occupying any layout. Fine pointers get 24px rather than the full 44,
 * because a mouse does not need a thumb's worth of slack and the seam is
 * flanked by content that is also clickable.
 */
const RESIZE_TARGET = { coarse: 44, fine: 24 };

export type ResizablePanelGroupProps = ComponentPropsWithoutRef<
  typeof ResizablePrimitive.Group
>;

/**
 * Two or more panels the teacher can rebalance — canvas beside inspector.
 *
 * On `react-resizable-panels` v4, whose vocabulary differs from the v2/v3 API
 * most examples are written against: `Group` / `Panel` / `Separator` rather
 * than `PanelGroup` / `Panel` / `PanelResizeHandle`, and the axis prop is
 * `orientation`, not `direction`. The names below are the design system's, so
 * callers see one stable vocabulary; the mapping is documented here so nobody
 * has to read the dist to find out why `direction` is a type error.
 *
 * The primitives are plain function components — v4 does not forward refs, it
 * takes an `elementRef` prop for the DOM node and separate `groupRef` /
 * `panelRef` props for its imperative handles. These wrappers pass `ref`
 * through to `elementRef` so callers keep the ordinary React contract, and the
 * imperative props stay available untouched for layout persistence.
 *
 * The layout is not persisted here. `useDefaultLayout` and `onLayoutChanged`
 * are exposed by the library and belong to whichever feature owns the storage
 * key — a design system component that wrote to `localStorage` on its own would
 * collide with every second instance of itself.
 */
export const ResizablePanelGroup = forwardRef<
  HTMLDivElement,
  ResizablePanelGroupProps
>(function ResizablePanelGroup(
  { className, resizeTargetMinimumSize = RESIZE_TARGET, ...props },
  ref,
) {
  return (
    <ResizablePrimitive.Group
      elementRef={ref}
      resizeTargetMinimumSize={resizeTargetMinimumSize}
      // `display`, `flex-direction`, `flex-wrap` and `overflow` are owned by
      // the library and silently ignored here, so this stays to sizing only.
      className={cn("h-full w-full", className)}
      {...props}
    />
  );
});

export type ResizablePanelProps = ComponentPropsWithoutRef<
  typeof ResizablePrimitive.Panel
>;

/**
 * One region inside the group.
 *
 * `min-w-0 min-h-0` is the whole base style, and it is not cosmetic: a flex
 * child defaults to `min-width: auto`, which means a panel refuses to shrink
 * below the intrinsic width of its content. Without it a long unbroken title or
 * a wide table quietly wins the argument with the drag, and the seam stops
 * moving at a point no constraint in the code explains.
 */
export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(
  function ResizablePanel({ className, ...props }, ref) {
    return (
      <ResizablePrimitive.Panel
        elementRef={ref}
        className={cn("min-h-0 min-w-0", className)}
        {...props}
      />
    );
  },
);

/**
 * `children` is omitted: the grip below is the seam's only content, and
 * anything a caller passed would be replaced by it without an error.
 */
export interface ResizableHandleProps extends Omit<
  ComponentPropsWithoutRef<typeof ResizablePrimitive.Separator>,
  "children"
> {
  /**
   * Draw the grip permanently. Off by default — a seam between two panels is a
   * line, and a nub on every seam is furniture. Turn it on for the one seam a
   * teacher is meant to find.
   */
  withGrip?: boolean;
}

/**
 * The seam.
 *
 * A hairline in `--border`, thickening in ink rather than in width on hover and
 * drag: growing the line would reflow both panels every time the pointer passed
 * over it.
 *
 * State is never carried by colour on its own here. Hover and drag come with
 * the resize cursor the library sets on the document, and keyboard focus —
 * which has no cursor and, product-wide, no outline — brings out the grip. That
 * is a shape appearing, and it is the reason the grip is rendered even when
 * `withGrip` is false rather than being conditional in JSX: a focused seam with
 * nothing but a colour shift is a control a keyboard user cannot locate.
 *
 * The grip overflows the 1px line by design and is `pointer-events-none`, so it
 * cannot take a press that belongs to the panel it sits over.
 *
 * Orientation comes from `aria-orientation`, which the library derives from the
 * group and which describes the line itself — a group of side-by-side panels
 * has a vertical seam. `data-separator` carries the state
 * (`inactive`/`hover`/`active`/`focus`/`disabled`).
 *
 * ## The Romanian default name is deliberate, and it is not enough on its own
 *
 * `aria-label` defaults to "Redimensionează panoul" rather than being required
 * or left empty. Empty is the worst of the three: a `separator` with `tabindex`
 * and no accessible name is announced as "separator", and the failure is
 * invisible in review because nothing on screen changes. Required is the
 * tempting middle answer and it is how a prop ends up satisfied with the same
 * string at every call site — including the one that passes "panou" because the
 * author was in a hurry. A default that is already correct is what the rest of
 * this system does: `AlertDialogCancel` ships "Anulează", `Dialog` and `Sheet`
 * ship "Închide", `CommandInput` ships "Caută…". This product is Romanian-only
 * and shipping a second locale would mean revisiting all of them together, not
 * this one alone.
 *
 * What the default cannot do is tell two seams apart. Three separators in one
 * screen all announcing "Redimensionează panoul" name nothing, so a caller with
 * more than one MUST override — `builder-screen.tsx` names each for the region
 * it grows. The prop stays open for exactly that.
 */
export const ResizableHandle = forwardRef<HTMLDivElement, ResizableHandleProps>(
  function ResizableHandle(
    {
      className,
      withGrip = false,
      "aria-label": ariaLabel = "Redimensionează panoul",
      ...props
    },
    ref,
  ) {
    return (
      <ResizablePrimitive.Separator
        elementRef={ref}
        aria-label={ariaLabel}
        className={cn(
          "group flex shrink-0 items-center justify-center self-stretch bg-border",
          "transition-colors duration-[var(--motion-fast)] ease-standard",
          "aria-[orientation=vertical]:w-px aria-[orientation=horizontal]:h-px",
          "data-[separator=hover]:bg-border-strong",
          "data-[separator=focus]:bg-border-strong",
          "data-[separator=active]:bg-primary",
          "data-[separator=disabled]:opacity-55",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none flex shrink-0 items-center justify-center rounded-sm",
            "bg-surface ring-1 ring-border",
            "transition-opacity duration-[var(--motion-fast)] ease-standard",
            "group-aria-[orientation=vertical]:h-8 group-aria-[orientation=vertical]:w-3",
            "group-aria-[orientation=horizontal]:h-3 group-aria-[orientation=horizontal]:w-8",
            withGrip
              ? "opacity-100"
              : "opacity-0 group-data-[separator=focus]:opacity-100",
          )}
        >
          <GripVertical
            aria-hidden
            strokeWidth={1.75}
            className="size-3 text-muted-foreground group-aria-[orientation=horizontal]:rotate-90"
          />
        </span>
      </ResizablePrimitive.Separator>
    );
  },
);
