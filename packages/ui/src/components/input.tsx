import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "../lib/cn";

/**
 * Text input.
 *
 * radius-sm (10px) per CH01 §7.1, hairline ring rather than a hard border,
 * 44px minimum height, and a 16px text floor — anything smaller triggers iOS
 * zoom-on-focus and fails CH07 §4.
 *
 * There is no `required` decoration here on purpose: CH12's anti-pattern list
 * forbids red required asterisks. Say it in the label instead.
 */
export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "min-h-11 w-full rounded-sm bg-surface px-4 text-base leading-[1.5] text-foreground",
        "ring-1 ring-input transition-[box-shadow,background-color]",
        "duration-[var(--motion-fast)] ease-standard",
        "placeholder:text-subtle hover:ring-border-strong",
        "aria-invalid:ring-destructive",
        "disabled:cursor-not-allowed disabled:opacity-55",
        "file:mr-3 file:border-0 file:bg-transparent file:text-base file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  );
});
