import { cn } from "@ludicon/ui";

import {
  NAV_BY_SECTION,
  RAIL_SECTIONS,
  type NavSignal,
} from "../../lib/navigation";
import { BrandBlock } from "./brand-block";
import { CreateButton } from "./create-button";
import { NavGroup } from "./nav-group";
import { NavItemLink } from "./nav-item-link";
import { NavRecents } from "./nav-recents";
import { PanelUtilities } from "./panel-utilities";
import { SearchTrigger } from "./search-trigger";
import { WorkspaceStatus } from "./workspace-status";
import { useShellSignals } from "./use-shell-signals";
import type { ShellNotificationsState } from "./use-shell-notifications";

/**
 * Which container is rendering this tree.
 *
 * `rail` is navigation and nothing else — search and the global controls float
 * over the page instead, in `UtilityDock`. `drawer` is the same navigation plus
 * those controls, because below 900px there is no dock to put them in.
 */
export type NavPanelVariant = "rail" | "drawer";

export interface NavPanelProps {
  variant: NavPanelVariant;
  pathname: string;
  collapsed: boolean;
  /** Closes the drawer after a destination is chosen. */
  onNavigate?: () => void;
  /** Unread announcements, so the rail and the bell cannot disagree. */
  unreadCount: number;
  notifications: ShellNotificationsState;
  onOpenPalette: () => void;
}

/**
 * The navigation, in one column.
 *
 * The desktop rail and the mobile drawer render this same tree, so a
 * destination cannot exist on one and be forgotten on the other.
 *
 * It reads top to bottom as a sentence about the teacher's day:
 *
 *   brand    — what this is, and the toggle that reshapes it
 *   make     — the one thing the product makes
 *   go       — where you can go and how much is waiting there
 *   recent   — what you actually touched
 *   keep     — settings, pinned to the foot
 *
 * An earlier pass also put search, the bell, appearance and the account down
 * here. The owner reversed that: the navigation merge stays, the utility
 * controls do not. They now float over the content area — see `UtilityDock` —
 * and what is left is one job, done once, with room to breathe.
 *
 * The drawer is the exception, and `variant` is why: at widths where no dock
 * exists, this column is the only place those controls can live.
 */
export function NavPanel({
  variant,
  pathname,
  collapsed,
  onNavigate,
  unreadCount,
  notifications,
  onOpenPalette,
}: NavPanelProps) {
  const signals = useShellSignals(unreadCount);
  const counts: Readonly<Partial<Record<NavSignal, number>>> = signals.counts;
  const isDrawer = variant === "drawer";

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* No underline. It existed to continue the compact bar's bottom border
          across the shell so the two read as one plane — and with the utility
          cluster moved out to the floating dock there is no band left on this
          side for it to line up with, so all it did was rule off the brand from
          the navigation it belongs to. The rail's only line is now its own
          outer edge. */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center px-3",
          collapsed ? "justify-center" : "gap-1",
        )}
      >
        <BrandBlock
          collapsed={collapsed}
          onNavigate={onNavigate}
          className={collapsed ? undefined : "min-w-0 flex-1"}
        />
      </div>

      <div className="flex shrink-0 flex-col gap-3 px-3 pt-5 pb-7">
        {isDrawer ? (
          <SearchTrigger compact={false} onOpen={onOpenPalette} />
        ) : null}
        <CreateButton collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      <nav
        aria-label="Navigare principală"
        className="flex min-h-0 flex-1 flex-col px-3"
      >
        {/* Kept `-mx-3 px-3` deliberately. `overflow-y: auto` forces
            `overflow-x` to compute to `auto` too, so this box clips anything
            laid out beyond the rows themselves — which is how an earlier
            active-row marker ended up visible on `Setări` (in the footer,
            outside this box) and on nothing else. Nothing is painted in the
            gutter today, but the box now spans the rail's full width with the
            inset carried as padding, so the next thing that is will not have to
            rediscover the same clip. */}
        <div className="-mx-3 min-h-0 flex-1 overflow-y-auto px-3 pb-6">
          {RAIL_SECTIONS.map((section, index) => (
            <NavGroup
              key={section}
              section={section}
              items={NAV_BY_SECTION[section]}
              pathname={pathname}
              collapsed={collapsed}
              counts={counts}
              leading={index === 0}
              onNavigate={onNavigate}
            />
          ))}

          {collapsed ? null : (
            <NavRecents
              papers={signals.recent}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          )}
        </div>

        {/* No rule above this group. The rail's only line is its own right
            edge, which is the boundary with the page and is load-bearing; every
            hairline *inside* the column has now been removed twice at the
            owner's asking, so treat it as settled. What separates the footer
            from the list is that the list scrolls and this does not, plus the
            space between them — which is more space than a rule was ever
            drawing, because the column is a flex layout and this group is
            pinned to its bottom. */}
        <div className="shrink-0 pt-3 pb-3">
          <ul aria-label="Cont" className="flex flex-col gap-1">
            {NAV_BY_SECTION.system.map((item) => (
              <NavItemLink
                key={item.id}
                item={item}
                active={pathname === item.href}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
          <WorkspaceStatus collapsed={collapsed} />
        </div>
      </nav>

      {isDrawer ? (
        <div className="shrink-0 px-3 pt-2 pb-3">
          <PanelUtilities
            notifications={notifications}
            onOpenPalette={onOpenPalette}
          />
        </div>
      ) : null}
    </div>
  );
}
