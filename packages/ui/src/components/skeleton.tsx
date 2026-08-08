import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "../lib/cn";

/**
 * A single shimmer placeholder. Always `aria-hidden` — the announcement is the
 * job of `LoadingBlock`, not of twelve grey rectangles.
 */
export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden
        className={cn(
          "animate-pulse rounded-sm bg-muted motion-reduce:animate-none",
          className,
        )}
        {...props}
      />
    );
  },
);

export interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  /** How many placeholder lines to draw. */
  lines?: number;
}

/** Convenience stack of text-height skeleton lines with a ragged last line. */
export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  function SkeletonText({ className, lines = 3, ...props }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {Array.from({ length: Math.max(1, lines) }, (_unused, index) => (
          <Skeleton
            key={index}
            className={cn("h-4", index === lines - 1 ? "w-3/5" : "w-full")}
          />
        ))}
      </div>
    );
  },
);

export interface LoadingBlockProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * What is being prepared, in teacher language.
   *
   * CH03's component map is explicit: a loading block "must carry an
   * educational label, never a bare 'Loading…'". The default says what the
   * wait buys, not that a wait is happening.
   */
  label?: string;
  /** Optional second line — why it takes a moment, or what to expect next. */
  hint?: string;
  /** Placeholder lines drawn under the label. */
  lines?: number;
}

/**
 * Waiting state with a voice.
 *
 * `role="status"` + `aria-live="polite"` announces once, quietly, without
 * stealing focus. There is no spinner: CH06 forbids indeterminate full-page
 * spinners and "AI thinking" theatre.
 */
export const LoadingBlock = forwardRef<HTMLDivElement, LoadingBlockProps>(
  function LoadingBlock(
    {
      className,
      label = "Pregătim conținutul lecției…",
      hint,
      lines = 3,
      ...props
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          "flex flex-col gap-4 rounded-lg bg-surface p-6 ring-1 ring-border",
          className,
        )}
        {...props}
      >
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium leading-[1.5] text-strong">
            {label}
          </p>
          {hint ? (
            <p className="text-base leading-[1.55] text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
        <SkeletonText lines={lines} />
      </div>
    );
  },
);
