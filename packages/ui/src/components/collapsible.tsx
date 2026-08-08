import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

import { cn } from "../lib/cn";

/**
 * A single disclosure — one group of inspector controls, open or shut.
 *
 * `Accordion` is the set: several sections that know about each other, with a
 * standing rule that they never nest. An inspector group is neither. It has no
 * siblings to coordinate with, and it frequently sits *inside* a panel that is
 * already a section, which is precisely the nesting the accordion forbids.
 * Reaching for `Accordion` with a single item would have written that rule off
 * to save a file.
 */
export const Collapsible = CollapsiblePrimitive.Root;

export type CollapsibleTriggerProps = ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Trigger
>;

export const CollapsibleTrigger = forwardRef<
  ComponentRef<typeof CollapsiblePrimitive.Trigger>,
  CollapsibleTriggerProps
>(function CollapsibleTrigger({ className, children, ...props }, ref) {
  return (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      className={cn(
        "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left",
        "text-base font-medium leading-[1.5] text-strong",
        "transition-colors duration-[var(--motion-fast)] ease-standard hover:text-primary",
        "disabled:pointer-events-none disabled:opacity-55",
        "[&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden
        strokeWidth={1.75}
        className="size-5 shrink-0 text-muted-foreground transition-transform duration-[var(--motion-expand)] ease-standard"
      />
    </CollapsiblePrimitive.Trigger>
  );
});

export type CollapsibleContentProps = ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Content
>;

/**
 * The content reveals without a height animation, matching `AccordionContent`.
 *
 * Radix hands over `--radix-collapsible-content-height` so the open/close can
 * be tweened, and the token layer has no keyframes to tween it with — adding a
 * pair here would make this the one disclosure in the product that animates,
 * with the accordion doing the identical gesture silently one component over.
 * The chevron is the moving part in both. A spring or overshoot on the reveal
 * is not on the table at all: CH06 caps discrete UI at 250ms and forbids
 * bounce.
 *
 * `className` lands on the inner element, not the animated wrapper, so a
 * caller's padding cannot fight `overflow-hidden`.
 */
export const CollapsibleContent = forwardRef<
  ComponentRef<typeof CollapsiblePrimitive.Content>,
  CollapsibleContentProps
>(function CollapsibleContent({ className, children, ...props }, ref) {
  return (
    <CollapsiblePrimitive.Content
      ref={ref}
      className="overflow-hidden"
      {...props}
    >
      <div
        className={cn(
          "pt-1 pb-4 text-base leading-[1.6] text-foreground",
          className,
        )}
      >
        {children}
      </div>
    </CollapsiblePrimitive.Content>
  );
});
