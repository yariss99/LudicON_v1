import { Link } from "@tanstack/react-router";
import { PrimaMark, cn } from "@ludicon/ui";

import { NotificationsMenu } from "./notifications-menu";
import { SearchTrigger } from "./search-trigger";
import { ShellBreadcrumb } from "./shell-breadcrumb";
import { ShellMenuButton, type ShellNavControl } from "./shell-menu-button";
import type { ShellNotificationsState } from "./use-shell-notifications";

export interface ShellHeaderProps {
  pathname: string;
  onOpenPalette: () => void;
  /** Absent where the navigation's shape is fixed by the viewport. */
  navControl: ShellNavControl | null;
  notifications: ShellNotificationsState;
}

/**
 * The compact bar — and only where there is no rail to merge into.
 *
 * This used to span the content area at every width, carrying search, the
 * location, the bell, appearance and the account. All of that now lives in the
 * rail. From 900px up this element does not render at all, which is the merge:
 * one piece of chrome, down the left, and the page owns the whole area beside
 * it.
 *
 * Below 900px the rail is a closed drawer, so something has to stay on screen.
 * Four things earn the space, and nothing else does:
 *
 *   the drawer trigger  — without it the navigation is unreachable
 *   the mark            — the only place the product says its own name here
 *   the location        — `ShellBreadcrumb`, which names deep routes like
 *                         `/projects/abc` that the closed drawer cannot
 *   search and the bell — the two globals that are time-sensitive on a phone
 *
 * Appearance and the account are one tap further, inside the drawer. A 375px
 * bar holding six controls and a page name holds none of them well.
 *
 * Every rule inside this bar is gone, which is the same instruction the rail
 * has now had twice: the bar's own bottom border stays because it is the
 * boundary with the page, and nothing inside it draws a line. The mark and the
 * location are separated by space, the two utilities simply sit together at the
 * end.
 *
 * The floating dock does not render at these widths, and this is why. Search
 * and the bell are here because they are time-sensitive on a phone; appearance
 * and the account are one tap away inside the drawer, which renders the panel's
 * `drawer` variant precisely so they have somewhere to be. A second floating
 * object over a 375px page would cost the content its width to say what this
 * bar already says.
 */
export function ShellHeader({
  pathname,
  onOpenPalette,
  navControl,
  notifications,
}: ShellHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2",
        "border-b border-border bg-surface px-4",
        "tablet-lg:hidden",
      )}
    >
      {navControl ? (
        <ShellMenuButton control={navControl} className="-ml-1.5" />
      ) : null}

      <Link
        to="/"
        aria-label="PRIMA — biroul meu"
        className="shrink-0 rounded-sm"
      >
        <PrimaMark size={28} decorative />
      </Link>

      <ShellBreadcrumb pathname={pathname} className="flex-1 pl-1" />

      <div className="flex shrink-0 items-center gap-0.5">
        <SearchTrigger compact onOpen={onOpenPalette} />
        <NotificationsMenu notifications={notifications} />
      </div>
    </header>
  );
}
