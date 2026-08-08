import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "../lib/cn";

/**
 * A card is an idea, not a container.
 *
 * CH02 Law 5: "if a card has no pedagogical noun it should not be a card."
 * Use `<div>` for layout; use `<Card>` for a lesson, an objective, a resource.
 *
 * radius-lg (24px), hairline ring instead of a hard border, and exactly one
 * elevation step on hover — CH01 §7 allows only none / soft / hover.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the 3px hover lift and pointer affordance for whole-card targets. */
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, interactive = false, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg bg-card text-card-foreground shadow-soft ring-1 ring-border",
        "transition-[box-shadow,transform] duration-[var(--motion-standard)] ease-standard",
        "hover:shadow-hover",
        interactive &&
          "cursor-pointer hover:-translate-y-[var(--motion-hover-y)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
        className,
      )}
      {...props}
    />
  );
});

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-2 p-6 pb-4", className)}
        {...props}
      />
    );
  },
);

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Render the child element instead of `<h3>`. Heading level is a document
   * structure decision, not a styling one — CH07 requires a sane outline, so
   * callers must be able to pick `<h2>` without losing the type scale.
   */
  asChild?: boolean;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitle({ className, asChild = false, ...props }, ref) {
    const Component = asChild ? Slot : "h3";

    return (
      <Component
        ref={ref}
        className={cn(
          "text-lg font-semibold leading-[1.35] text-strong",
          className,
        )}
        {...props}
      />
    );
  },
);

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn("text-base leading-[1.6] text-muted-foreground", className)}
      {...props}
    />
  );
});

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />;
  },
);

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap items-center gap-3 p-6 pt-0", className)}
        {...props}
      />
    );
  },
);
