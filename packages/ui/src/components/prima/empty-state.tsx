import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

export interface EmptyStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** Lucide icon, 24px, stroke 1.75. Optional — words do the work. */
  icon?: ReactNode;
  /** What lives here, named with a pedagogical noun. Never "No results". */
  title: string;
  /** Why it is empty and what could fill it. Two sentences at most. */
  explanation: string;
  /** The one way to begin. A single action — CH02 Law 1. */
  action?: ReactNode;
  /** Alternative routes in, when there genuinely is more than one. */
  children?: ReactNode;
}

/**
 * An empty state teaches.
 *
 * CH12 lists "No data" empty states as an anti-pattern, and UX-001 bans the
 * words that usually fill them — Missing, Required, Error, Invalid. So the
 * contract here is structural, not stylistic: `title` says what can exist,
 * `explanation` says why it is not here yet, `action` says how to begin. All
 * three are props rather than defaults, because there is no generic sentence
 * that teaches anything.
 *
 * Measure is capped near 65ch (CH01 §5) so the explanation stays readable.
 */
export function EmptyState({
  className,
  icon,
  title,
  explanation,
  action,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg bg-surface px-6 py-12 text-center ring-1 ring-border",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden
          className="inline-flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary [&_svg]:size-6"
        >
          {icon}
        </span>
      ) : null}

      <div className="flex max-w-[60ch] flex-col gap-2">
        <p className="text-xl font-semibold leading-[1.3] text-strong">
          {title}
        </p>
        <p className="text-base leading-[1.6] text-muted-foreground">
          {explanation}
        </p>
      </div>

      {action ? <div className="mt-2">{action}</div> : null}
      {children ? (
        <div className="mt-2 w-full max-w-[60ch]">{children}</div>
      ) : null}
    </div>
  );
}
