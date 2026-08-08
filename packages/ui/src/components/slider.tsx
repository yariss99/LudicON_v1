import * as SliderPrimitive from "@radix-ui/react-slider";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

import { cn } from "../lib/cn";

/**
 * `children` is omitted rather than ignored. The track, the range and one
 * handle per value are composed below, so anything a caller passed would be
 * dropped on the floor with no error — the same reason `Progress` omits it.
 */
export interface SliderProps extends Omit<
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  "children"
> {
  /**
   * Accessible name per handle, in value order.
   *
   * The `role="slider"` is the handle, not the root — an `aria-label` on this
   * component would name a wrapper no screen reader announces. Since the
   * handles are rendered here rather than by the caller, this is the only way
   * to reach them.
   */
  thumbLabels?: readonly string[];
}

/**
 * Continuous numeric control for the inspector — size, spacing, opacity.
 *
 * The 44px touch minimum (CH07) is carried by the root, not by the handle. The
 * obvious version — a `size-11` thumb — is wrong twice: Radix measures the
 * thumb to compute its travel, so a 44px handle insets the range by 22px at
 * each end and the dot visibly stops short of both extremes, and a 44px dot on
 * a 6px track reads as a knob rather than a value. The root instead reserves a
 * `min-h-11` band around the track. Radix reads slide gestures on the root, so
 * a press anywhere in that band moves the value: the finger target is the full
 * 44px, only the paint is small.
 *
 * `focus-visible:bg-muted` is not a new focus signal — it is the product's
 * existing one, restated where it would otherwise be lost. `theme.css` paints
 * keyboard focus as a `--muted` tint from `@layer base`; the handle's own
 * `bg-surface` is a utility, and utilities outrank base, so a handle that
 * paints itself silently erases the only thing telling a keyboard user which
 * one they are holding. A ring was the other way to fix it and is refused
 * outright: outlines are off product-wide.
 *
 * One handle is rendered per value, so the same component is a range slider
 * when given two. Hardcoding a single thumb — the shorter version — loses the
 * second value with no warning from Radix and no visible symptom.
 */
export const Slider = forwardRef<
  ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(function Slider(
  { className, value, defaultValue, min = 0, max = 100, thumbLabels, ...props },
  ref,
) {
  const thumbs = value ?? defaultValue ?? [min];

  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      className={cn(
        "relative flex touch-none select-none items-center",
        "data-[orientation=horizontal]:min-h-11 data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-w-11 data-[orientation=vertical]:flex-col",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-55",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative grow overflow-hidden rounded-full bg-muted",
          "data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full",
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            "absolute rounded-full bg-primary",
            "data-[orientation=horizontal]:h-full",
            "data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      {thumbs.map((_, index) => (
        <SliderPrimitive.Thumb
          // The handles are positional: index is their identity, and they are
          // never reordered or keyed by anything more stable.
          key={index}
          aria-label={thumbLabels?.[index]}
          className={cn(
            "block size-5 shrink-0 cursor-grab rounded-full bg-surface shadow-soft ring-1 ring-border-strong",
            "transition-[box-shadow,background-color] duration-[var(--motion-fast)] ease-standard",
            "hover:ring-primary active:cursor-grabbing",
            "focus-visible:bg-muted",
            "data-[disabled]:cursor-not-allowed",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
});
