import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";
import { Button } from "../button";
import { PrimaMark } from "./prima-mark";

export interface FloatingSuggestionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  /** What PRIMA noticed, in one line. */
  title: string;
  /** Why it matters and what would change. Two sentences at most. */
  message: string;
  /** Optional detail — a preview of the edit, a chip row, a short list. */
  children?: ReactNode;
  onApply: () => void;
  onDismiss: () => void;
  applyLabel?: string;
  dismissLabel?: string;
  /** Disables both actions while the patch is being applied. */
  busy?: boolean;
}

/**
 * A PRIMA tip.
 *
 * Deliberately NOT a dialog and NOT a toast — CH03 says so in as many words.
 * A dialog would make the assistant block the teacher's work, which CH02 Law 8
 * forbids; a toast would let the suggestion expire unread, which makes the
 * assistant unreliable. So it is a card that sits beside the work, waits, and
 * accepts a decision whenever one arrives.
 *
 * `aria-live="polite"` announces its arrival without stealing focus. Both
 * actions are always present: `Aplică` and `Nu acum` are the canonical pair,
 * and there is no third path, no "don't show again", no dismissal by timeout.
 *
 * Layout is left to the caller. It renders as a normal block so it can live in
 * the PRIMA rail on desktop and inside a sheet on tablet without changing.
 */
export function FloatingSuggestion({
  className,
  title,
  message,
  children,
  onApply,
  onDismiss,
  applyLabel = "Aplică",
  dismissLabel = "Nu acum",
  busy = false,
  ...props
}: FloatingSuggestionProps) {
  return (
    <aside
      aria-label="Sugestie de la PRIMA"
      aria-live="polite"
      className={cn(
        "flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-soft ring-1 ring-border",
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <PrimaMark size={20} decorative className="mt-1" />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-base font-semibold leading-[1.4] text-strong">
            {title}
          </p>
          <p className="text-base leading-[1.6] text-muted-foreground">
            {message}
          </p>
        </div>
      </div>

      {children ? <div className="pl-8">{children}</div> : null}

      <div className="flex flex-wrap items-center gap-2 pl-8">
        <Button variant="primary" size="sm" onClick={onApply} disabled={busy}>
          {applyLabel}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDismiss} disabled={busy}>
          {dismissLabel}
        </Button>
      </div>
    </aside>
  );
}
