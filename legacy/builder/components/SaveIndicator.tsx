import { Check, CloudOff, Loader, PencilLine } from "lucide-react";
import type { Timestamp } from "@ludicon/domain";
import { cn } from "@ludicon/ui";

import { COPY } from "../copy";
import type { SaveState } from "../types";

export type SaveIndicatorProps = {
  saving: SaveState;
  dirty: boolean;
  lastSavedAt: Timestamp | null;
};

/**
 * Save state as words plus an icon.
 *
 * `aria-live="polite"` because CH07's "work cannot be silently lost" applies to
 * screen-reader users first: the visual reassurance is worthless if it is not
 * announced. Never a spinner over the whole page.
 */
export function SaveIndicator({
  saving,
  dirty,
  lastSavedAt,
}: SaveIndicatorProps) {
  const state = resolve(saving, dirty);

  return (
    <p
      aria-live="polite"
      className={cn(
        "flex items-center gap-1.5 text-sm",
        state.tone === "failed" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      <state.Icon
        aria-hidden
        size={16}
        strokeWidth={1.75}
        className={cn(
          "shrink-0",
          state.tone === "saved" ? "text-secondary" : undefined,
        )}
      />
      <span>{state.label}</span>
      {state.tone === "saved" && lastSavedAt !== null ? (
        <time dateTime={lastSavedAt} className="font-mono text-xs text-subtle">
          {formatTime(lastSavedAt)}
        </time>
      ) : null}
    </p>
  );
}

function resolve(saving: SaveState, dirty: boolean) {
  if (saving === "saving")
    return { label: COPY.saving, Icon: Loader, tone: "saving" as const };
  if (saving === "failed")
    return { label: COPY.saveFailed, Icon: CloudOff, tone: "failed" as const };
  if (dirty)
    return { label: COPY.unsaved, Icon: PencilLine, tone: "dirty" as const };
  return { label: COPY.saved, Icon: Check, tone: "saved" as const };
}

function formatTime(value: Timestamp): string {
  return new Intl.DateTimeFormat("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
