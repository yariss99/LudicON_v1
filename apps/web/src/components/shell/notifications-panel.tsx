import { Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { cn } from "@ludicon/ui";

import {
  formatRelativeTime,
  type ShellNotification,
} from "./use-shell-notifications";

/**
 * The two presentational halves of the bell's panel.
 *
 * Split out because the bell itself is about state — unread counting, when to
 * clear it, which container it sits in — and these are about how one
 * announcement and no announcements look. Keeping them together pushed one file
 * past the point where either concern could be read on its own.
 */

export function NotificationRow({
  item,
  onFollow,
}: {
  item: ShellNotification;
  onFollow: () => void;
}) {
  return (
    <li>
      <Link
        to="/projects"
        onClick={onFollow}
        className={cn(
          "flex min-h-11 gap-3 rounded-sm px-3 py-2.5",
          "transition-colors duration-[var(--motion-fast)] ease-standard",
          "hover:bg-muted",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "mt-2 size-2 shrink-0 rounded-full",
            item.unread ? "bg-accent" : "bg-transparent",
          )}
        />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-baseline gap-2">
            <span className="min-w-0 flex-1 truncate font-medium text-foreground">
              {item.subject}
            </span>
            {/* Tinted chip, ink inside — not bare amber text. `--accent` is
                amber-600 by mandate and measures 3.19:1 on white: fine for the
                dot beside it, a defect for a word at 12px. Same treatment the
                rail's unread count already uses. */}
            {item.unread ? (
              <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[0.75rem] leading-[1.35] font-medium text-foreground">
                Nou
              </span>
            ) : null}
          </span>
          <span className="truncate text-sm leading-[1.45] text-muted-foreground">
            {item.message}
          </span>
          <span className="text-[0.75rem] leading-[1.4] text-muted-foreground">
            {formatRelativeTime(item.at)}
          </span>
        </span>
      </Link>
    </li>
  );
}

export function NotificationsEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
      <span
        aria-hidden
        className="inline-flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary"
      >
        <Inbox strokeWidth={1.75} className="size-5" />
      </span>
      <p className="text-base leading-[1.4] font-semibold text-strong">
        Deocamdată e liniște
      </p>
      <p className="text-sm leading-[1.55] text-muted-foreground">
        Aici apar schimbările din proiectele tale — când un design e gata sau
        când materialele au fost create.
      </p>
    </div>
  );
}
