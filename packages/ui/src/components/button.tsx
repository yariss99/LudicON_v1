import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "../lib/cn";

/**
 * The one button.
 *
 * Radius is always `full` (CH01 §7.1 — buttons and pills are pill-shaped, no
 * exceptions). Height floor is 44px because CH07 overrides CH02's 40px, and
 * CH07 has override authority over aesthetics.
 *
 * `defaultVariants.variant` is deliberately `secondary`, not `primary`. Law 1
 * of CH02 allows exactly ONE filled primary action per screen; making primary
 * opt-in means a careless `<Button>` cannot silently create a second one.
 *
 * No press-scale: it read as a bounce, and scaling a dropdown trigger shifts
 * overshoot. CH06 forbids bounce on CTAs, and the token collapses to 1 under
 * `prefers-reduced-motion`.
 */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap",
    // shadcn inherits `cursor: default` from Preflight, which makes every
    // action in the product feel inert under the pointer. Setting it on the
    // base means no call site can forget it.
    "cursor-pointer rounded-full font-medium",
    "transition-[background-color,box-shadow,color]",
    "duration-[var(--motion-fast)] ease-standard",
    "disabled:pointer-events-none disabled:opacity-55",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover hover:shadow-hover",
        secondary:
          "bg-surface text-foreground ring-1 ring-border hover:bg-muted hover:ring-border-strong",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        danger:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 hover:shadow-hover",
        link: "bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "min-h-11 gap-1.5 px-4 text-base [&_svg]:size-4",
        md: "min-h-12 px-6 text-base [&_svg]:size-5",
        lg: "min-h-14 px-8 text-lg [&_svg]:size-5",
      },
    },
    compoundVariants: [
      // A link never carries a filled box, so it never carries box padding.
      { variant: "link", size: "sm", class: "px-0" },
      { variant: "link", size: "md", class: "px-0" },
      { variant: "link", size: "lg", class: "px-0" },
    ],
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render the child element instead of a `<button>`, keeping all styling. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, asChild = false, type, ...props },
    ref,
  ) {
    const Component = asChild ? Slot : "button";

    return (
      <Component
        ref={ref}
        // An unset `type` inside a form defaults to "submit" and silently posts.
        // Slot has no type of its own, so only set it on a real button.
        type={asChild ? undefined : (type ?? "button")}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
