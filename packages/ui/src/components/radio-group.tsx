import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";

import { cn } from "../lib/cn";

export type RadioGroupProps = ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
>;

/**
 * One choice out of a set the teacher can read in full.
 *
 * Distinct from `ToggleGroup`, which answers the same question in a row of
 * pills: this is the vertical form, for options whose labels are sentences
 * rather than words, and it is the one to reach for when the choice has a
 * consequence worth reading before pressing. Radix supplies the part that is
 * easy to get wrong by hand — one tab stop for the whole set, arrow keys
 * moving between options, and the roving `tabindex` that makes that work.
 */
export const RadioGroup = forwardRef<
  ComponentRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(function RadioGroup({ className, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn("grid gap-1", className)}
      {...props}
    />
  );
});

/**
 * The mark and its indicator are composed below, so a caller's `children` would
 * be silently dropped — it is omitted instead. The label goes beside the
 * control and is associated by `id`, never nested inside it.
 */
export type RadioGroupItemProps = Omit<
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  "children"
>;

/**
 * The dot.
 *
 * Built the way `Checkbox` is built, for the same reason: the control fills a
 * 44×44 box (CH07's touch minimum) while the mark it paints is 20px, so the
 * target is finger-sized without the form looking like a row of buttons. The
 * alternative — a 20px control with 44px of surrounding label as the target —
 * only works when there is a label to click, and an inspector routinely has
 * rows of bare options.
 *
 * Selection is the inner dot: a shape that is drawn or not, plus the ring
 * changing colour behind it and `aria-checked` for anyone not reading pixels.
 * Ring colour alone was the rejected version — two hairlines eleven pixels
 * apart, distinguishable only by hue.
 *
 * Nothing here paints a background, which is deliberate: that leaves the
 * `--muted` tint `theme.css` applies on `:focus-visible` free to fill the whole
 * 44px circle, and it is the only focus signal this product has.
 */
export const RadioGroupItem = forwardRef<
  ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(function RadioGroupItem({ className, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "group relative inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full",
        "disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none size-5 rounded-full bg-surface ring-1 ring-input",
          "transition-[box-shadow] duration-[var(--motion-fast)] ease-standard",
          "group-hover:ring-border-strong",
          "group-data-[state=checked]:ring-primary",
        )}
      />
      <RadioGroupPrimitive.Indicator className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Circle
          aria-hidden
          strokeWidth={1.75}
          className="size-2.5 fill-primary text-primary"
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
