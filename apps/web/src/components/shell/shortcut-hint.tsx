import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@ludicon/ui";

/**
 * A keyboard hint, as one contained pill.
 *
 * The whole shortcut lives in a single `<kbd>` — `G H` is one gesture, so it
 * reads as one object. Split into two caps it looked like stray characters
 * had landed at the end of the row.
 *
 * Quiet by enclosure and scale rather than by fading the ink: the fill is
 * `--muted` and the text `--text-muted`, which clears CH07's 3:1 floor for UI
 * text in both themes. `--text-subtle` would not — it sits near 2.6:1 on a
 * tinted fill in light, and that is the usual way a "quiet" hint becomes an
 * unreadable one.
 *
 * The mono face is reserved for technical meta exactly like this (CH01 §5.1),
 * and every shortcut advertised here is also reachable by pointer.
 */

const APPLE_PLATFORM = /mac|iphone|ipad|ipod/i;

/**
 * `⌘` on Apple hardware, `Ctrl` elsewhere.
 *
 * Read once at module load: the keyboard does not change under the user, and
 * re-deriving it per render would only add work.
 */
export const MOD_KEY_LABEL: string =
  typeof navigator !== "undefined" && APPLE_PLATFORM.test(navigator.userAgent)
    ? "⌘"
    : "Ctrl";

export interface ShortcutHintProps extends ComponentPropsWithoutRef<"kbd"> {
  /** Keys separated by spaces, e.g. `"⌘ K"`. */
  keys: string;
}

export function ShortcutHint({ keys, className, ...props }: ShortcutHintProps) {
  return (
    <kbd
      {...props}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5",
        "font-mono text-[0.6875rem] leading-[1.5] tracking-[0.06em]",
        "whitespace-nowrap text-muted-foreground ring-1 ring-border",
        className,
      )}
    >
      {keys}
    </kbd>
  );
}
