import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

import { cn } from "../lib/cn";

/**
 * Collapsible sections.
 *
 * CH03 maps `EditableSection` onto this, with one hard rule: never nest. A
 * lesson section that contains a lesson section is a hierarchy problem, not a
 * disclosure problem.
 */
export const Accordion = AccordionPrimitive.Root;

export type AccordionItemProps = ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Item
>;

export const AccordionItem = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(function AccordionItem({ className, ...props }, ref) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn("border-b border-border", className)}
      {...props}
    />
  );
});

export type AccordionTriggerProps = ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Trigger
>;

export const AccordionTrigger = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(function AccordionTrigger({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex min-h-12 flex-1 cursor-pointer items-center justify-between gap-4 py-4 text-left",
          "text-base font-medium leading-[1.5] text-strong",
          "transition-colors duration-[var(--motion-fast)] ease-standard hover:text-primary",
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
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

export type AccordionContentProps = ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Content
>;

export const AccordionContent = forwardRef<
  ComponentRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden"
      {...props}
    >
      <div
        className={cn(
          "pb-5 text-base leading-[1.6] text-foreground",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
});
