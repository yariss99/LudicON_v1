import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

import { cn } from "../lib/cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;

export type PopoverContentProps = ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
>;

/**
 * Non-modal surface anchored to a trigger.
 *
 * Radix handles the parts CH07 cares about: Escape closes, focus moves into
 * the panel and returns to the trigger on close, and the page underneath stays
 * reachable. Use this for a filter or a small form; use `Dialog` when the task
 * genuinely deserves to interrupt.
 */
export const PopoverContent = forwardRef<
  ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(function PopoverContent(
  { className, align = "start", sideOffset = 8, ...props },
  ref,
) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 max-w-[calc(100vw-2rem)] rounded-md bg-popover p-5",
          "text-base leading-[1.55] text-popover-foreground",
          "shadow-hover ring-1 ring-border",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
