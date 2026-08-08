import { Check, Minus } from "lucide-react";
import { forwardRef, useCallback, type InputHTMLAttributes } from "react";

import { cn } from "../lib/cn";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  /** Mixed state — some children checked. Sets `input.indeterminate`. */
  indeterminate?: boolean;
}

/**
 * Checkbox.
 *
 * Built on a real `<input type="checkbox">` rather than a Radix primitive:
 * `@radix-ui/react-checkbox` is not among the declared dependencies, and a
 * native input gives form participation, the `indeterminate` DOM property and
 * platform keyboard behaviour for free.
 *
 * The input is transparent and fills a 44×44 box (CH07 touch minimum) while
 * the visible mark is 20px, so the target is finger-sized without the control
 * looking heavy. Meaning is icon + state, never fill colour alone.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, indeterminate = false, ...props }, ref) {
    const attachRef = useCallback(
      (node: HTMLInputElement | null) => {
        if (node) node.indeterminate = indeterminate;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [indeterminate, ref],
    );

    return (
      <span
        className={cn(
          "relative inline-flex size-11 shrink-0 items-center justify-center",
          className,
        )}
      >
        <input
          ref={attachRef}
          type="checkbox"
          className="peer absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none size-5 rounded-sm bg-surface ring-1 ring-input",
            "transition-colors duration-[var(--motion-fast)] ease-standard",
            "peer-hover:ring-border-strong",
            "peer-checked:bg-primary peer-checked:ring-primary",
            "peer-indeterminate:bg-primary peer-indeterminate:ring-primary",
            "peer-disabled:opacity-55",
          )}
        />
        {indeterminate ? (
          <Minus
            aria-hidden
            strokeWidth={1.75}
            className="pointer-events-none absolute left-1/2 top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 text-primary-foreground"
          />
        ) : (
          <Check
            aria-hidden
            strokeWidth={1.75}
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2",
              "text-primary-foreground opacity-0 transition-opacity duration-[var(--motion-micro)] ease-standard",
              "peer-checked:opacity-100",
            )}
          />
        )}
      </span>
    );
  },
);
