import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from "react";

import { cn } from "../lib/cn";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

/**
 * Item height is 44px, not the usual 32.
 *
 * CH07 sets a 44×44 touch minimum with no carve-out for menus, and PRIMA is
 * used on tablets in classrooms. Density stays low by default (CH02), so a
 * taller row is on-message rather than a compromise.
 */
const itemClass = [
  "relative flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-sm px-3 py-2",
  // `outline-none` is never bare — Radix moves real focus between items and
  // `data-[highlighted]` below is the replacement indicator CH07 requires.
  "text-base leading-[1.5] text-foreground outline-none",
  "transition-colors duration-[var(--motion-micro)] ease-standard",
  "data-[highlighted]:bg-muted",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-55",
  // Direct children only: the check / radio indicators are nested and keep
  // their own accent colour, which a descendant rule would out-specify.
  "[&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
].join(" ");

const surfaceClass = [
  "z-50 min-w-56 overflow-hidden rounded-md bg-popover p-1.5",
  "text-popover-foreground shadow-hover ring-1 ring-border",
].join(" ");

export type DropdownMenuContentProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
>;

export const DropdownMenuContent = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(function DropdownMenuContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(surfaceClass, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

export type DropdownMenuItemProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
>;

export const DropdownMenuItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(function DropdownMenuItem({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(itemClass, className)}
      {...props}
    />
  );
});

export type DropdownMenuCheckboxItemProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.CheckboxItem
>;

export const DropdownMenuCheckboxItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(function DropdownMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(itemClass, "pr-9", className)}
      {...props}
    >
      {children}
      <span className="absolute right-3 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check
            aria-hidden
            strokeWidth={1.75}
            className="size-4 text-primary"
          />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

export type DropdownMenuRadioItemProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.RadioItem
>;

export const DropdownMenuRadioItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownMenuRadioItemProps
>(function DropdownMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(itemClass, "pr-9", className)}
      {...props}
    >
      {children}
      <span className="absolute right-3 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle
            aria-hidden
            strokeWidth={1.75}
            className="size-2.5 fill-primary text-primary"
          />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </DropdownMenuPrimitive.RadioItem>
  );
});

export type DropdownMenuLabelProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Label
>;

export const DropdownMenuLabel = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Label>,
  DropdownMenuLabelProps
>(function DropdownMenuLabel({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn(
        "px-3 py-2 text-[0.8125rem] font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});

export type DropdownMenuSeparatorProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
>;

export const DropdownMenuSeparator = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1.5 h-px bg-border", className)}
      {...props}
    />
  );
});

export type DropdownMenuSubTriggerProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubTrigger
>;

export const DropdownMenuSubTrigger = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(function DropdownMenuSubTrigger({ className, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(itemClass, className)}
      {...props}
    >
      {children}
      <ChevronRight aria-hidden strokeWidth={1.75} className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
});

export type DropdownMenuSubContentProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubContent
>;

export const DropdownMenuSubContent = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  DropdownMenuSubContentProps
>(function DropdownMenuSubContent({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(surfaceClass, className)}
      {...props}
    />
  );
});

export type DropdownMenuShortcutProps = HTMLAttributes<HTMLSpanElement>;

/** Keyboard hint. Mono face is reserved for technical meta exactly like this. */
export function DropdownMenuShortcut({
  className,
  ...props
}: DropdownMenuShortcutProps) {
  return (
    <span
      className={cn(
        "ml-auto font-mono text-[0.75rem] tracking-wide text-subtle",
        className,
      )}
      {...props}
    />
  );
}
