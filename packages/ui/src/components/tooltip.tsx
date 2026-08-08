import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

import { cn } from "../lib/cn";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export type TooltipContentProps = ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
>;

/**
 * Supplementary label.
 *
 * A tooltip is never the only place information lives — CH07 requires the
 * content to survive keyboard-only and touch use, where hover does not exist.
 * Treat it as a reminder of something already visible, never as the answer.
 *
 * Text sits at 14px: this is a caption-scale element, not body copy, so the
 * 16px body floor does not apply. Radix supplies Escape-to-dismiss and
 * focus-triggered display, both required by CH07.
 */
export const TooltipContent = forwardRef<
  ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(function TooltipContent({ className, sideOffset = 8, ...props }, ref) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-72 rounded-sm bg-popover px-3 py-2",
          "text-sm leading-[1.5] text-popover-foreground",
          "shadow-hover ring-1 ring-border",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
});
