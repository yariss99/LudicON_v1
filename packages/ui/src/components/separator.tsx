import * as SeparatorPrimitive from "@radix-ui/react-separator";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

import { cn } from "../lib/cn";

export type SeparatorProps = ComponentPropsWithoutRef<
  typeof SeparatorPrimitive.Root
>;

/**
 * Hairline rule.
 *
 * `decorative` defaults to true so the separator stays out of the
 * accessibility tree; pass `decorative={false}` only when the line genuinely
 * separates two meaningful regions and a screen reader should know.
 */
export const Separator = forwardRef<
  ComponentRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(function Separator(
  { className, orientation = "horizontal", decorative = true, ...props },
  ref,
) {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      orientation={orientation}
      decorative={decorative}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
});
