import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "../lib/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./dialog";

export type CommandProps = ComponentPropsWithoutRef<typeof CommandPrimitive>;

/**
 * Filterable command list — the base for `Căutare rapidă`.
 *
 * cmdk owns the matching and the roving selection; everything here is skin and
 * copy. The empty state never says "No data" (CH12 anti-pattern) — it says what
 * to try next.
 */
export const Command = forwardRef<
  ComponentRef<typeof CommandPrimitive>,
  CommandProps
>(function Command({ className, ...props }, ref) {
  return (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className,
      )}
      {...props}
    />
  );
});

export type CommandInputProps = ComponentPropsWithoutRef<
  typeof CommandPrimitive.Input
>;

export const CommandInput = forwardRef<
  ComponentRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(function CommandInput({ className, placeholder = "Caută…", ...props }, ref) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4">
      <Search
        aria-hidden
        strokeWidth={1.75}
        className="size-5 shrink-0 text-muted-foreground"
      />
      <CommandPrimitive.Input
        ref={ref}
        placeholder={placeholder}
        className={cn(
          "min-h-12 w-full bg-transparent py-3 text-base leading-[1.5] text-foreground",
          "placeholder:text-subtle disabled:cursor-not-allowed disabled:opacity-55",
          className,
        )}
        {...props}
      />
    </div>
  );
});

export type CommandListProps = ComponentPropsWithoutRef<
  typeof CommandPrimitive.List
>;

export const CommandList = forwardRef<
  ComponentRef<typeof CommandPrimitive.List>,
  CommandListProps
>(function CommandList({ className, ...props }, ref) {
  return (
    <CommandPrimitive.List
      ref={ref}
      className={cn(
        "max-h-80 overflow-y-auto overflow-x-hidden p-2",
        className,
      )}
      {...props}
    />
  );
});

export type CommandEmptyProps = ComponentPropsWithoutRef<
  typeof CommandPrimitive.Empty
>;

export const CommandEmpty = forwardRef<
  ComponentRef<typeof CommandPrimitive.Empty>,
  CommandEmptyProps
>(function CommandEmpty(
  {
    className,
    children = "Nu am găsit nimic cu acest text. Încearcă un alt cuvânt.",
    ...props
  },
  ref,
) {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      className={cn(
        "px-4 py-8 text-center text-base leading-[1.55] text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </CommandPrimitive.Empty>
  );
});

export type CommandGroupProps = ComponentPropsWithoutRef<
  typeof CommandPrimitive.Group
>;

export const CommandGroup = forwardRef<
  ComponentRef<typeof CommandPrimitive.Group>,
  CommandGroupProps
>(function CommandGroup({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        "overflow-hidden py-1 text-foreground",
        "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2",
        "[&_[cmdk-group-heading]]:text-[0.8125rem] [&_[cmdk-group-heading]]:font-medium",
        "[&_[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});

export type CommandItemProps = ComponentPropsWithoutRef<
  typeof CommandPrimitive.Item
>;

export const CommandItem = forwardRef<
  ComponentRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(function CommandItem({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-sm px-3 py-2",
        "text-base leading-[1.5] text-foreground",
        "transition-colors duration-[var(--motion-micro)] ease-standard",
        "data-[selected=true]:bg-muted",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-55",
        "[&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});

export type CommandSeparatorProps = ComponentPropsWithoutRef<
  typeof CommandPrimitive.Separator
>;

export const CommandSeparator = forwardRef<
  ComponentRef<typeof CommandPrimitive.Separator>,
  CommandSeparatorProps
>(function CommandSeparator({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      className={cn("my-1.5 h-px bg-border", className)}
      {...props}
    />
  );
});

export type CommandShortcutProps = HTMLAttributes<HTMLSpanElement>;

export function CommandShortcut({ className, ...props }: CommandShortcutProps) {
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

export interface CommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Announced title. Visible only to screen readers by default. */
  title?: string;
  /** Announced hint explaining how the palette works. */
  description?: string;
  children: ReactNode;
}

/** The palette itself: a dialog whose entire body is the command list. */
export function CommandDialog({
  open,
  onOpenChange,
  title = "Căutare rapidă",
  description = "Scrie pentru a găsi o lecție, o secțiune sau o acțiune.",
  children,
}: CommandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden p-0" showClose={false}>
        <div className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </div>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}
