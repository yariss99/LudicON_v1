import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "../lib/cn";

/**
 * Status chip.
 *
 * The label always renders in ink, never in the semantic hue. Two reasons:
 * amber and emerald at their mandated 600 weights do not reach 4.5:1 against
 * their own 50-level soft fills, and CH07 forbids colour-only meaning outright.
 * So meaning is carried by three channels at once — the tinted fill, the
 * coloured icon, and the words — while the words stay maximally legible.
 *
 * `icon` is a slot rather than a lookup so domain components (StatusBadge)
 * decide the icon vocabulary and this primitive stays neutral.
 */
export const badgeVariants = cva(
  [
    "inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1",
    "text-[0.8125rem] font-medium leading-5 text-foreground",
    "ring-1",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      tone: {
        neutral: "bg-muted ring-border [&_svg]:text-muted-foreground",
        info: "bg-info-soft ring-info/25 [&_svg]:text-info",
        success: "bg-success-soft ring-success/25 [&_svg]:text-success",
        warning: "bg-warning-soft ring-warning/30 [&_svg]:text-warning",
        danger:
          "bg-destructive-soft ring-destructive/25 [&_svg]:text-destructive",
        accent: "bg-accent-soft ring-accent/30 [&_svg]:text-accent",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Leading icon. Required by CH07 for anything that encodes a state. */
  icon?: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, tone, icon, children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
});
