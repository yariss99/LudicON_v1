import * as ProgressPrimitive from "@radix-ui/react-progress";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

import { cn } from "../lib/cn";

export interface ProgressProps extends Omit<
  ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
  "children"
> {
  /** Visible label. Progress is never colour-only, so this is how it reads. */
  label?: string;
  /** Show "3 din 9" style text beside the label. */
  valueText?: string;
  /**
   * `calm` uses Studio Emerald and is the right choice for anything that
   * describes the teacher's own work — CH12 forbids saturated progress bars
   * that feel like grading the teacher.
   */
  tone?: "primary" | "calm";
}

/**
 * Thin, quiet completion bar.
 *
 * 8px track, full radius, one flat fill. No stripes, no gradient, no pulsing —
 * CH06 forbids fake progress and CH12 forbids anything that reads as a mark.
 */
export const Progress = forwardRef<
  ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(function Progress(
  { className, value, max = 100, label, valueText, tone = "primary", ...props },
  ref,
) {
  const safeMax = max > 0 ? max : 100;
  const percent =
    typeof value === "number"
      ? Math.min(100, Math.max(0, (value / safeMax) * 100))
      : 0;

  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-base leading-[1.5] text-foreground">
            {label}
          </span>
          {valueText ? (
            <span className="text-[0.8125rem] font-medium text-muted-foreground">
              {valueText}
            </span>
          ) : null}
        </div>
      ) : null}
      <ProgressPrimitive.Root
        ref={ref}
        value={value}
        max={safeMax}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-muted",
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "size-full rounded-full transition-transform duration-[var(--motion-standard)] ease-standard",
            tone === "calm" ? "bg-secondary" : "bg-primary",
          )}
          style={{ transform: `translateX(-${100 - percent}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
});
