import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from "react";

import { cn } from "../lib/cn";
import { Button } from "./button";
import { DialogOverlay, DialogPortal } from "./dialog";

export const AlertDialog = DialogPrimitive.Root;
export const AlertDialogTrigger = DialogPrimitive.Trigger;

export type AlertDialogContentProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
>;

/**
 * Confirmation for something that cannot be undone.
 *
 * Composed from `@radix-ui/react-dialog` with `role="alertdialog"` rather than
 * `@radix-ui/react-alert-dialog`, which is not among the declared dependencies.
 * Behaviourally it matches: no dismissal by clicking away and no corner close,
 * so the choice must be made deliberately — but Escape still exits, because
 * CH07 states Escape always exits and never carves out an exception.
 *
 * CH03 reserves this pattern for destructive actions only. Anything the
 * teacher can undo does not deserve to block the screen.
 */
export const AlertDialogContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  AlertDialogContentProps
>(function AlertDialogContent({ className, children, ...props }, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        role="alertdialog"
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-md",
          "-translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto",
          "rounded-lg bg-surface p-6 text-surface-foreground shadow-hover ring-1 ring-border",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

export type AlertDialogHeaderProps = HTMLAttributes<HTMLDivElement>;

export function AlertDialogHeader({
  className,
  ...props
}: AlertDialogHeaderProps) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export type AlertDialogFooterProps = HTMLAttributes<HTMLDivElement>;

export function AlertDialogFooter({
  className,
  ...props
}: AlertDialogFooterProps) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-wrap items-center justify-end gap-3",
        className,
      )}
      {...props}
    />
  );
}

export type AlertDialogTitleProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Title
>;

export const AlertDialogTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  AlertDialogTitleProps
>(function AlertDialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        "text-xl font-semibold leading-[1.3] text-strong",
        className,
      )}
      {...props}
    />
  );
});

export type AlertDialogDescriptionProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
>;

export const AlertDialogDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  AlertDialogDescriptionProps
>(function AlertDialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-base leading-[1.6] text-muted-foreground", className)}
      {...props}
    />
  );
});

export type AlertDialogActionProps = ComponentPropsWithoutRef<typeof Button>;

/** Confirms and closes. Destructive by default — that is the only reason to be here. */
export function AlertDialogAction({
  variant = "danger",
  ...props
}: AlertDialogActionProps) {
  return (
    <DialogPrimitive.Close asChild>
      <Button variant={variant} {...props} />
    </DialogPrimitive.Close>
  );
}

export type AlertDialogCancelProps = ComponentPropsWithoutRef<typeof Button>;

/** Backs out and closes. Defaults to Romanian so no screen ships in English. */
export function AlertDialogCancel({
  variant = "ghost",
  children = "Anulează",
  ...props
}: AlertDialogCancelProps) {
  return (
    <DialogPrimitive.Close asChild>
      <Button variant={variant} {...props}>
        {children}
      </Button>
    </DialogPrimitive.Close>
  );
}
