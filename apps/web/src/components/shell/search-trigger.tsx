import { Search } from "lucide-react";
import { cn } from "@ludicon/ui";

import { SHELL_ICON_BUTTON, SHELL_ICON_GLYPH } from "./icon-button";
import { MOD_KEY_LABEL, ShortcutHint } from "./shortcut-hint";

const KEY_SHORTCUTS = "Meta+K Control+K";

export interface SearchTriggerProps {
  onOpen: () => void;
  /** Icon-only form, for widths that cannot spare a field. */
  compact: boolean;
  className?: string;
}

/**
 * Global search, and the door to the command palette.
 *
 * It looks like a field and behaves like a button, which is deliberate: a
 * teacher recognises the shape and clicks it, and what opens is the palette
 * with the keyboard already in it. Building a real input here would mean two
 * search experiences to keep in step.
 *
 * The radius follows the pill step. It used to take the input step, on the
 * argument that something reading as a field should measure like one — but the
 * only two containers it ever appears in are the floating dock, which is a
 * capsule of capsules, and the drawer, directly under a pill-shaped `Creează`.
 * In both it was the one squared corner in the group.
 */
export function SearchTrigger({
  onOpen,
  compact,
  className,
}: SearchTriggerProps) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-keyshortcuts={KEY_SHORTCUTS}
        className={cn(SHELL_ICON_BUTTON, className)}
      >
        <Search aria-hidden strokeWidth={1.75} className={SHELL_ICON_GLYPH} />
        <span className="sr-only">Caută</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      /* Named explicitly so the shortcut pill does not become part of the
         accessible name — without this it announces as "Caută… ⌘ K". The
         shortcut is already conveyed by `aria-keyshortcuts`, which assistive
         tech reports separately and in its own words. */
      aria-label="Caută"
      aria-keyshortcuts={KEY_SHORTCUTS}
      className={cn(
        "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-full bg-background px-4",
        "text-left text-base ring-1 ring-border-strong",
        "transition-[background-color,box-shadow] duration-[var(--motion-fast)] ease-standard",
        "hover:bg-muted hover:ring-primary",
        className,
      )}
    >
      <Search
        aria-hidden
        strokeWidth={1.75}
        className={cn(SHELL_ICON_GLYPH, "shrink-0 text-muted-foreground")}
      />
      <span className="min-w-0 flex-1 truncate text-muted-foreground">
        Caută…
      </span>
      <ShortcutHint aria-hidden keys={`${MOD_KEY_LABEL} K`} />
    </button>
  );
}
