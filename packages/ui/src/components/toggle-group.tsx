import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

import { cn } from "../lib/cn";

export type ToggleGroupProps = ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Root
> & {
  /**
   * Let the options run onto a second line.
   *
   * Off by default, because the control's whole claim is that it is one row.
   * Turn it on where the labels are words in a narrow rail rather than glyphs —
   * four Romanian alignment names do not fit 311px of inspector, and a row that
   * scrolls sideways hides half its own options.
   */
  wrap?: boolean;
};

/**
 * Segmented control for a setting with two to five mutually visible options —
 * alignment, weight, fill.
 *
 * This is the tab strip's track, deliberately: `TabsList` and the projects
 * scope control are already a row of pills in a hairline bar, and an inspector
 * segmented control is the same object doing the same job one rail over. A
 * fourth painting of it — the `--muted` groove this design system removed from
 * the tabs — would be a third thing for a teacher to learn.
 *
 * Use it where every option should be readable at once. A list too long to sit
 * in a row is a `Select`, and a single on/off is a `Switch`.
 *
 * ## Why wrapping is a prop and not a caller's `flex-wrap`
 *
 * Two callers passed `className="flex-wrap"` and the track stopped being a
 * track: `rounded-full` is `999px`, which on a box 150px tall is not a pill but
 * an ellipse, and the options at the corners of a two-line group sat outside
 * their own container — measured in the running builder, not theorised. The
 * `overflow-x-auto` that makes a single row scrollable also fights `flex-wrap`,
 * since a wrapped row has nothing left to scroll.
 *
 * So the geometry is owned here. A wrapped group is a *block*, and it is
 * painted as one: `--radius-md`, no sideways scroll. The alternative — telling
 * callers not to wrap — was rejected because the class was already in the tree
 * twice and nothing stopped a third.
 */
export const ToggleGroup = forwardRef<
  ComponentRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(function ToggleGroup({ className, wrap = false, ...props }, ref) {
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn(
        "inline-flex max-w-full items-center gap-1 border border-border bg-surface p-1",
        wrap ? "flex-wrap rounded-md" : "overflow-x-auto rounded-full",
        className,
      )}
      {...props}
    />
  );
});

export type ToggleGroupItemProps = ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Item
>;

/**
 * One option in the row.
 *
 * Pressed state is the pill: a shape that is either drawn or not, plus
 * `data-state` and the `aria-pressed` Radix writes for it. That is what keeps
 * this off meaning-by-colour-alone even though the fill and the ink are both
 * colour — the alternative considered was tinting the label only, which is
 * exactly colour alone and disappears for anyone who cannot separate
 * `--primary` from `--text-muted`.
 *
 * Weight does not change with state. It did in the tab strip and the strip
 * shook: heavier glyphs measure wider, so every sibling re-laid out on each
 * press.
 *
 * `min-w-11` alongside `min-h-11` is for the icon-only case, which is most of
 * them in an inspector. Without it a single 20px glyph in `px-4` is a 52×44
 * target horizontally but the padding is doing all the work, and the moment a
 * caller reaches for a tighter `px-*` the target quietly drops under CH07's
 * 44px floor. An icon-only item needs its own accessible name — Radix will not
 * invent one from a glyph.
 */
export const ToggleGroupItem = forwardRef<
  ComponentRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(function ToggleGroupItem({ className, children, ...props }, ref) {
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        "inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center",
        "justify-center gap-2 rounded-full px-4",
        "text-base leading-[1.5] font-medium text-muted-foreground",
        "transition-[background-color,color] duration-[var(--motion-fast)] ease-standard",
        "hover:bg-muted hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-55",
        "data-[state=on]:bg-primary-soft data-[state=on]:text-primary",
        "[&_svg]:size-5 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
