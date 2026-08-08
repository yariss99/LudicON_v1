import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

import { cn } from "../lib/cn";

export const Tabs = TabsPrimitive.Root;

export type TabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List>;

export const TabsList = forwardRef<
  ComponentRef<typeof TabsPrimitive.List>,
  TabsListProps
>(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        // `--surface` inside a hairline, not a `--muted` groove. This is the
        // projects toolbar's scope control exactly: same fill, same border,
        // same padding, same radius. The two are the same kind of object on
        // adjacent screens and there is no reason for a teacher to learn them
        // twice.
        //
        // The groove had to go once the selected pill became tinted rather than
        // white: `--primary-soft` on `--muted` is two tints within 1.02:1 of
        // each other, which is the invisible-selection fault this pass exists
        // to remove. On `--surface` the same pill has somewhere to sit.
        "inline-flex max-w-full items-center gap-1 overflow-x-auto",
        "rounded-full border border-border bg-surface p-1",
        className,
      )}
      {...props}
    />
  );
});

export type TabsTriggerProps = ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
>;

/**
 * The selected tab, in the projects toolbar's words.
 *
 * A tab strip and the projects page's scope control are the same object —
 * a row of pills in a hairline track, one of which is where you are — and they
 * used to be painted differently: the scope control tinted its selection in
 * `--primary-soft`, this lifted a white pill off a grey groove. Two answers to
 * one question, one screen apart. This is the scope control's treatment,
 * copied: `--primary-soft` fill, `--primary` label, one weight throughout.
 *
 * `shadow-soft` is gone with the groove. A tinted pill that is *also* lifted is
 * two signals doing one job, and the control this now matches has no elevation
 * — keeping it here would have been the one remaining difference between them.
 *
 * The selected state does not change font weight. It did briefly, and the
 * strip shook: heavier glyphs are wider, so every trigger re-measured on each
 * switch. What carries the state instead is the pill itself — a shape that is
 * either drawn or not, which is why this is not meaning-by-colour-alone even
 * though fill and ink are both colour. `aria-selected` carries it for anyone
 * not reading pixels.
 *
 * ## Counts inside a trigger
 *
 * A chip that keeps `--muted` vanishes the moment the pill under it stops being
 * the plain track — it measured 1.14:1 against the tinted selection, which is
 * the grey blob this pass was asked to remove. The rule is that the chip's fill
 * has to change with selection, and it is enforced here rather than left to
 * each caller: mark the chip `data-count` and the trigger paints it. A caller
 * cannot do this itself, because the chip cannot see whether its own tab is
 * selected.
 *
 * The chip keeps a fill in both states. Dropping it on selection would have
 * fixed the contrast by deleting the pill, and the number is meant to be *in* a
 * visible pill.
 */
export const TabsTrigger = forwardRef<
  ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(function TabsTrigger({ className, children, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex min-h-11 shrink-0 cursor-pointer items-center",
        "justify-center rounded-full px-5",
        "text-base leading-[1.5] font-medium text-muted-foreground",
        "transition-[background-color,color] duration-[var(--motion-fast)] ease-standard",
        "hover:bg-muted hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-55",
        // Weight is constant across states, by the owner's instruction. A
        // heavier selected label measures wider, so the whole strip shifted
        // sideways on every switch — the shake. The selected state is carried
        // by the pill, which is a shape that is either drawn or not, plus its
        // ink. Matches the projects scope control exactly.
        "data-[state=active]:bg-primary-soft",
        "data-[state=active]:text-primary",
        // Any `data-count` chip a caller puts inside, painted for the state the
        // trigger is actually in. See the note above.
        "[&_[data-count]]:rounded-full [&_[data-count]]:bg-muted",
        "[&_[data-count]]:text-muted-foreground",
        "[&[data-state=active]_[data-count]]:bg-primary",
        "[&[data-state=active]_[data-count]]:text-primary-foreground",
        "[&_svg]:size-5 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
});

export type TabsContentProps = ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
>;

export const TabsContent = forwardRef<
  ComponentRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn("mt-6", className)}
      {...props}
    />
  );
});
