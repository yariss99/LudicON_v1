import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "../lib/cn";

/**
 * Multi-line input.
 *
 * `resize-y` only — horizontal resize breaks the 65–75ch measure CH01 §5
 * asks for. Line-height 1.6 keeps long teacher notes readable at the 16px
 * floor.
 */
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, rows = 4, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "min-h-28 w-full resize-y rounded-sm bg-surface px-4 py-3",
          "text-base leading-[1.6] text-foreground",
          "ring-1 ring-input transition-[box-shadow,background-color]",
          "duration-[var(--motion-fast)] ease-standard",
          "placeholder:text-subtle hover:ring-border-strong",
          "aria-invalid:ring-destructive",
          "disabled:cursor-not-allowed disabled:opacity-55",
          className,
        )}
        {...props}
      />
    );
  },
);
