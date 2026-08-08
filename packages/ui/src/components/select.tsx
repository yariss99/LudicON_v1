import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

import { cn } from "../lib/cn";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export type SelectTriggerProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.Trigger
>;

export const SelectTrigger = forwardRef<
  ComponentRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(function SelectTrigger({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        // A pill, not an input. The trigger is a button that opens a menu —
        // you press it, you never type into it — and in every place it ships it
        // stands in a row of pills: the projects toolbar's segmented scope
        // control, its own sibling select, the page's own actions. At
        // `--radius-sm` it was the one squared corner in that row.
        //
        // `Input` and `Textarea` deliberately stay at the input step. The
        // difference in shape is then doing real work: a pill opens something,
        // a soft-cornered field is somewhere you type.
        "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-full bg-surface px-4",
        "text-base leading-[1.5] text-foreground ring-1 ring-input",
        "transition-[box-shadow,background-color] duration-[var(--motion-fast)] ease-standard",
        "hover:ring-border-strong data-[placeholder]:text-subtle",
        "aria-invalid:ring-destructive",
        "disabled:cursor-not-allowed disabled:opacity-55",
        "[&>span]:truncate",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className="size-5 shrink-0 text-muted-foreground"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

export type SelectContentProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.Content
>;

export const SelectContent = forwardRef<
  ComponentRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(function SelectContent(
  { className, children, position = "popper", ...props },
  ref,
) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        sideOffset={6}
        className={cn(
          "relative z-50 max-h-80 min-w-[10rem] overflow-hidden rounded-md",
          "bg-popover text-popover-foreground shadow-hover ring-1 ring-border",
          position === "popper" && "w-[var(--radix-select-trigger-width)]",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-8 items-center justify-center text-muted-foreground">
          <ChevronUp aria-hidden strokeWidth={1.75} className="size-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1.5">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-8 items-center justify-center text-muted-foreground">
          <ChevronDown aria-hidden strokeWidth={1.75} className="size-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

export type SelectLabelProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.Label
>;

export const SelectLabel = forwardRef<
  ComponentRef<typeof SelectPrimitive.Label>,
  SelectLabelProps
>(function SelectLabel({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(
        "px-3 py-2 text-[0.8125rem] font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});

export type SelectItemProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.Item
>;

export const SelectItem = forwardRef<
  ComponentRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        // `outline-none` is paired with a replacement, never bare: Radix moves
        // real focus between items and `data-[highlighted]` is what marks it.
        "relative flex min-h-11 w-full cursor-pointer select-none items-center gap-3 rounded-sm",
        "py-2 pl-3 pr-9 text-base leading-[1.5] text-foreground outline-none",
        "transition-colors duration-[var(--motion-micro)] ease-standard",
        "data-[highlighted]:bg-muted",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-55",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-3 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check
            aria-hidden
            strokeWidth={1.75}
            className="size-4 text-primary"
          />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
});

export type SelectSeparatorProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.Separator
>;

export const SelectSeparator = forwardRef<
  ComponentRef<typeof SelectPrimitive.Separator>,
  SelectSeparatorProps
>(function SelectSeparator({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1.5 h-px bg-border", className)}
      {...props}
    />
  );
});
