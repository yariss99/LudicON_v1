import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from "react";

import { cn } from "../lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

/**
 * The scrim.
 *
 * `--background` rather than a fixed ink wash: the design book specifies no
 * scrim token, and a hardcoded dark veil inverts wrongly in dark mode. Using
 * the canvas colour keeps the veil on the same side of the theme as the page
 * it is covering, in both directions.
 */
export type DialogOverlayProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Overlay
>;

export const DialogOverlay = forwardRef<
  ComponentRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-background/80", className)}
      {...props}
    />
  );
});

export interface DialogContentProps extends ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  /** Hide the corner close control when the dialog supplies its own. */
  showClose?: boolean;
  /** Accessible label for the close control. */
  closeLabel?: string;
}

/**
 * Modal surface.
 *
 * Radix supplies the three things the previous hand-rolled modal did not: a
 * real focus trap, focus restoration to the trigger on close, and a `Title`
 * association that is generated per instance instead of a duplicated
 * `id="modal-title"` shared by every dialog on the page.
 *
 * Every dialog MUST render a `DialogTitle` — Radix warns loudly otherwise, and
 * CH07 requires the dialog to announce what it is. Wrap it in `sr-only` if the
 * title should not be seen.
 */
export const DialogContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent(
  { className, children, showClose = true, closeLabel = "Închide", ...props },
  ref,
) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-lg",
          "-translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto",
          "rounded-lg bg-surface p-6 text-surface-foreground shadow-hover ring-1 ring-border",
          className,
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            className={cn(
              "absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full",
              "text-muted-foreground transition-colors duration-[var(--motion-fast)] ease-standard",
              "hover:bg-muted hover:text-foreground",
            )}
          >
            <X aria-hidden strokeWidth={1.75} className="size-5" />
            <span className="sr-only">{closeLabel}</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

export type DialogHeaderProps = HTMLAttributes<HTMLDivElement>;

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 pr-12", className)} {...props} />
  );
}

export type DialogFooterProps = HTMLAttributes<HTMLDivElement>;

export function DialogFooter({ className, ...props }: DialogFooterProps) {
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

export type DialogTitleProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Title
>;

export const DialogTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(function DialogTitle({ className, ...props }, ref) {
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

export type DialogDescriptionProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
>;

export const DialogDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-base leading-[1.6] text-muted-foreground", className)}
      {...props}
    />
  );
});
