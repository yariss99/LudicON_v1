import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from "react";

import { cn } from "../lib/cn";
import { DialogOverlay, DialogPortal } from "./dialog";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

/**
 * Edge-anchored panel.
 *
 * This is how the desktop side panels survive the trip down to tablet-portrait
 * and mobile (CH08 §5): below 900px the PRIMA rail and the lesson navigator
 * stop being columns and become drawers. Same content, same order, different
 * container — so nothing has to be redesigned per breakpoint.
 */
const sheetVariants = cva(
  [
    "fixed z-50 flex flex-col gap-4 bg-surface p-6 text-surface-foreground",
    "shadow-hover ring-1 ring-border",
  ],
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full w-[min(28rem,calc(100vw-3rem))] rounded-l-lg",
        left: "inset-y-0 left-0 h-full w-[min(28rem,calc(100vw-3rem))] rounded-r-lg",
        bottom: "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-lg",
        top: "inset-x-0 top-0 max-h-[85vh] w-full rounded-b-lg",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

export interface SheetContentProps
  extends
    ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  showClose?: boolean;
  closeLabel?: string;
}

export const SheetContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(function SheetContent(
  {
    className,
    children,
    side = "right",
    showClose = true,
    closeLabel = "Închide",
    ...props
  },
  ref,
) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
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

export type SheetHeaderProps = HTMLAttributes<HTMLDivElement>;

export function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 pr-12", className)} {...props} />
  );
}

export type SheetFooterProps = HTMLAttributes<HTMLDivElement>;

export function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-wrap items-center justify-end gap-3",
        className,
      )}
      {...props}
    />
  );
}

export type SheetTitleProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Title
>;

export const SheetTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  SheetTitleProps
>(function SheetTitle({ className, ...props }, ref) {
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

export type SheetDescriptionProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
>;

export const SheetDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  SheetDescriptionProps
>(function SheetDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-base leading-[1.6] text-muted-foreground", className)}
      {...props}
    />
  );
});
