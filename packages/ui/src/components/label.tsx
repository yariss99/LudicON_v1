import * as LabelPrimitive from "@radix-ui/react-label";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

import { cn } from "../lib/cn";

export interface LabelProps extends ComponentPropsWithoutRef<
  typeof LabelPrimitive.Root
> {
  /**
   * Marks the field as skippable.
   *
   * CH12 forbids red required asterisks, so the system marks the *optional*
   * side instead: everything unmarked is expected, and "opțional" is stated in
   * words rather than encoded in a colour. Also satisfies CH07's rule that
   * labels are always visible and never placeholder-only.
   */
  optional?: boolean;
}

export const Label = forwardRef<
  ComponentRef<typeof LabelPrimitive.Root>,
  LabelProps
>(function Label({ className, optional = false, children, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "flex items-baseline gap-2 text-base font-medium leading-[1.5] text-strong",
        "peer-disabled:opacity-55",
        className,
      )}
      {...props}
    >
      {children}
      {optional ? (
        <span className="text-[0.8125rem] font-normal text-muted-foreground">
          opțional
        </span>
      ) : null}
    </LabelPrimitive.Root>
  );
});
