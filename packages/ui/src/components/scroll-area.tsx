import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type Ref,
} from "react";

import { cn } from "../lib/cn";

export interface ScrollAreaProps extends ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
> {
  /**
   * Which way the content may be dragged out from under the frame.
   *
   * `vertical` — the default and almost always right — draws no sideways bar,
   * so a stray horizontal overflow is clipped rather than turned into a
   * scrollable surprise.
   *
   * `both` is for content with an intrinsic width the frame cannot argue with.
   * The editor's A4 sheet is 794 CSS pixels at 100% and does not shrink to fit
   * a laptop; without a sideways bar its right-hand margin was simply gone at
   * 1024px, with nothing on screen saying so.
   */
  axis?: "vertical" | "both";

  /**
   * The element that actually scrolls.
   *
   * `ref` lands on the Root, which is the clipping frame and never moves, so a
   * caller that needs the scroll position, a scroll listener, or the visible
   * frame's own coordinates cannot get at it: those are all facts about the
   * viewport inside. The editor's action bar needs exactly that — it has to
   * know whether the piece it belongs to is near the top of the FRAME, which
   * scrolling changes and the Root cannot report.
   *
   * Exposed here rather than left to callers to find with
   * `closest("[data-radix-scroll-area-viewport]")`, which works today and makes
   * every such caller depend on a Radix implementation detail. If that
   * attribute ever changes name, one file should have to change.
   */
  viewportRef?: Ref<HTMLDivElement | null>;
}

/**
 * Scroll container with a quiet custom scrollbar.
 *
 * The viewport keeps its own focus ring: CH07 requires a keyboard user to see
 * where they are, and a scrollable region is a focus stop in every browser.
 *
 * Radix hides a bar whose axis does not overflow, so `axis="both"` costs
 * nothing when the content happens to fit — but it is still opt-in rather than
 * the default, because a component that silently makes every overflow
 * scrollable takes away the caller's ability to clip on purpose.
 */
export const ScrollArea = forwardRef<
  ComponentRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(function ScrollArea(
  { className, children, axis = "vertical", viewportRef, ...props },
  ref,
) {
  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        className="size-full rounded-[inherit] "
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      {axis === "both" ? <ScrollBar orientation="horizontal" /> : null}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});

export type ScrollBarProps = ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
>;

export const ScrollBar = forwardRef<
  ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(function ScrollBar({ className, orientation = "vertical", ...props }, ref) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none p-0.5 transition-colors duration-[var(--motion-fast)] ease-standard",
        orientation === "vertical" ? "h-full w-2.5" : "h-2.5 flex-col",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border-strong" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
});
