import { TooltipProvider, cn } from "@ludicon/ui";

import { NavPanel } from "./nav-panel";
import type { ShellNotificationsState } from "./use-shell-notifications";

export interface NavRailProps {
  pathname: string;
  collapsed: boolean;
  unreadCount: number;
  notifications: ShellNotificationsState;
  onOpenPalette: () => void;
}

/**
 * The persistent rail, from tablet-landscape up.
 *
 * Navigation, and nothing else. It briefly carried search, the bell,
 * appearance and the account as well; the owner reversed that, and those four
 * now float over the content area in `UtilityDock`. What is left is the brand,
 * the one thing the product makes, six destinations with their live counts, the
 * lessons recently touched, settings, and where the work is being kept — one
 * job, with the room to do it well.
 *
 * Six, not seven: `Bibliotecă` is gone. The count is written down here because
 * the rail's proportions were tuned against it, and the next person to change
 * it should know the number is a measurement rather than a description.
 *
 * Below 900px this is not rendered at all — CH08 turns the rail into a drawer
 * there, and the compact bar takes over the handful of things that must stay on
 * screen.
 *
 * The width is NOT transitioned. Animating `width` moves every descendant of
 * the content area for the duration, and a pointer aimed at a control during
 * that window lands where the control used to be — which is what made the
 * project workspace tabs look broken: the strip slid out from under the click.
 * CH08 asks that content not jump when panels change; it does not ask for a
 * layout property to be animated, and the two are not the same thing. The rail
 * lands at its final width on the frame the preference changes.
 *
 * There is deliberately no drag-strip on the rail's edge. It is a fashionable
 * detail and it was built here first, but it is a hidden gesture duplicating a
 * control that is already visible, labelled and keyboard-reachable — and an
 * `aria-hidden` button is a thing screen readers are told to ignore while
 * pointer users are expected to find it. CH07 asks for a button alternative to
 * every gesture; the honest reading is that the button should simply be the
 * gesture. That button now sits in the rail's own brand row.
 */
export function NavRail({
  pathname,
  collapsed,
  unreadCount,
  notifications,
  onOpenPalette,
}: NavRailProps) {
  return (
    <aside
      className={cn(
        "sticky top-4 my-4 ml-4 hidden h-[calc(100svh-2rem)] shrink-0",
        // An island, matching the dock. The `border-r` this replaces was doing
        // two jobs — stating where the content area began, and separating two
        // planes of near-identical colour in dark mode. A detached surface with
        // its own ring and shadow states both more plainly: there is no edge to
        // find because the whole shape is the edge.
        "overflow-hidden rounded-[var(--radius-lg)]",
        "bg-surface ring-1 ring-border-strong shadow-soft",
        "transition-[background-color] duration-[var(--motion-fast)] ease-standard",
        "tablet-lg:block",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      <TooltipProvider delayDuration={250} skipDelayDuration={0}>
        <NavPanel
          variant="rail"
          pathname={pathname}
          collapsed={collapsed}
          unreadCount={unreadCount}
          notifications={notifications}
          onOpenPalette={onOpenPalette}
        />
      </TooltipProvider>
    </aside>
  );
}
