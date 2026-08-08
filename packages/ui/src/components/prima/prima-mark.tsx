import { useId } from "react";

import { cn } from "../../lib/cn";

const SIZE_CLASS = {
  20: "size-5",
  28: "size-7",
  36: "size-9",
} as const;

export type PrimaMarkSize = keyof typeof SIZE_CLASS;

export interface PrimaMarkProps {
  /** 20 for inline use, 28 for the rail header, 36 for the shell brand. */
  size?: PrimaMarkSize;
  /**
   * Breathe.
   *
   * The pulse is the only ambient motion in the product and it means exactly
   * one thing: PRIMA has something to offer right now. A mark that always
   * pulses says nothing, and CH02 Law 8 keeps the assistant present but never
   * dominant. Gate it on real recommendations, never on page load.
   */
  hasRecommendations?: boolean;
  /** Accessible name. Ignored when `decorative`. */
  label?: string;
  /** Set when the mark sits beside its own visible name and would repeat it. */
  decorative?: boolean;
  className?: string;
}

/**
 * The Guiding Star.
 *
 * Two rounded squares — one upright, one turned 45° — composited as a single
 * group so the overlap never darkens, then a warm `--accent` bloom at the
 * centre at 12%. Blue carries the identity; amber is the hint of attention
 * inside it. No purple, no gradient, no glow ring: CH01 §12.2 forbids all
 * three, five times over.
 *
 * The pulse animation lives in `theme.css` and is driven by `--motion-pulse`,
 * which collapses to 0ms under `prefers-reduced-motion`.
 */
export function PrimaMark({
  size = 28,
  hasRecommendations = false,
  label = "PRIMA",
  decorative = false,
  className,
}: PrimaMarkProps) {
  const glowId = useId();

  return (
    <svg
      viewBox="0 0 36 36"
      focusable="false"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      className={cn(
        SIZE_CLASS[size],
        "shrink-0",
        hasRecommendations && "animate-prima-pulse motion-reduce:animate-none",
        className,
      )}
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      <g opacity={0.92}>
        <rect
          x="7"
          y="7"
          width="22"
          height="22"
          rx="6"
          className="fill-primary"
        />
        <rect
          x="7"
          y="7"
          width="22"
          height="22"
          rx="6"
          transform="rotate(45 18 18)"
          className="fill-primary"
        />
      </g>
      <circle
        cx="18"
        cy="18"
        r="8"
        fillOpacity={0.12}
        filter={`url(#${glowId})`}
        className="fill-accent"
      />
    </svg>
  );
}
