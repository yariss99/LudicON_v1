import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
  cn,
} from "@ludicon/ui";

import { SHELL_ICON_BUTTON, SHELL_ICON_GLYPH } from "./icon-button";
import { NotificationRow, NotificationsEmpty } from "./notifications-panel";
import type { ShellNotificationsState } from "./use-shell-notifications";

export interface NotificationsMenuProps {
  /** Owned by the shell, so the bell and the rail count the same things. */
  notifications: ShellNotificationsState;
  /** `bottom` in the floating dock and the compact bar, `top` in the drawer. */
  side?: "top" | "bottom";
}

/** Six is the ceiling, so Romanian's "de" plural rule never applies here. */
function unreadLabel(count: number): string {
  return count === 1 ? "1 anunț nou" : `${String(count)} anunțuri noi`;
}

/**
 * The bell.
 *
 * The unread mark is a small amber dot, never a red count badge: CH01 reserves
 * red for true errors, and a panic badge on a teacher's own quiet progress is
 * the wrong message. Because a dot alone would be meaning carried in colour,
 * the count is also in the control's accessible name, and each unread row
 * repeats it as the word "Nou".
 *
 * It is a dot and not a number, and that is a split rather than an omission.
 * The bell answers "is there anything?"; the rail's `Notificări` row, a few
 * hundred pixels to the left, answers "how much?" with a solid amber chip. One
 * integer told twice in two different visual languages is worse than either
 * telling alone, and the number belongs on the row — it has a label beside it
 * and room to be a legible object at any value.
 *
 * A count badge was tried here and removed. On a 44px round target a digit
 * needs a circle, the circle needs a halo to lift it off the glyph, and the
 * halo eats the room the digit needed: three nested shapes for one integer, and
 * the two-digit case pushed past the button's own edge. The dot is one shape,
 * 8px, in exactly the position and size the 72px rail already uses on this same
 * glyph — so the two cannot look like different features.
 *
 * The halo is `--surface`, which is the fill of all three containers this
 * control appears in: the floating dock's island, the compact bar and the
 * drawer. That is also what keeps the dot's 3.19:1 in light mode true on hover,
 * where the button itself fills with `--muted` — the dot never actually sits on
 * anything but `--surface`.
 *
 * Unread is cleared when the panel closes rather than when it opens, so the
 * teacher gets to see which entries were new before the marks disappear.
 */
export function NotificationsMenu({
  notifications,
  side = "bottom",
}: NotificationsMenuProps) {
  const [open, setOpen] = useState(false);
  const { items, unreadCount, isPending, markAllSeen } = notifications;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) markAllSeen();
      }}
    >
      <PopoverTrigger className={cn(SHELL_ICON_BUTTON, "relative")}>
        <Bell aria-hidden strokeWidth={1.75} className={SHELL_ICON_GLYPH} />
        {unreadCount > 0 ? (
          <span
            aria-hidden
            className="absolute top-2 right-2 size-2 rounded-full bg-accent ring-2 ring-surface"
          />
        ) : null}
        <span className="sr-only">
          {unreadCount > 0
            ? `Notificări — ${unreadLabel(unreadCount)}`
            : "Notificări"}
        </span>
      </PopoverTrigger>

      <PopoverContent align="end" side={side} className="w-[21rem] p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <span className="text-base leading-[1.3] font-semibold text-strong">
            Notificări
          </span>
          {unreadCount > 0 ? (
            <span className="text-sm text-muted-foreground">
              {unreadLabel(unreadCount)}
            </span>
          ) : null}
        </div>

        <div className="max-h-[19rem] overflow-y-auto p-2">
          {isPending ? (
            <div className="flex flex-col gap-2 p-1">
              <Skeleton className="h-14 rounded-sm" />
              <Skeleton className="h-14 rounded-sm" />
            </div>
          ) : items.length === 0 ? (
            <NotificationsEmpty />
          ) : (
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onFollow={() => {
                    setOpen(false);
                    markAllSeen();
                  }}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-2">
          <Link
            to="/notifications"
            onClick={() => {
              setOpen(false);
              markAllSeen();
            }}
            className={cn(
              "flex min-h-11 items-center justify-center rounded-sm px-3 text-sm font-medium text-primary",
              "transition-colors duration-[var(--motion-fast)] ease-standard hover:bg-primary-soft",
            )}
          >
            Vezi toate anunțurile
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
