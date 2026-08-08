import { useCallback, useMemo, useState } from "react";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import {
  CommandPalette,
  LAPTOP_UP,
  NavDrawer,
  NavRail,
  PageTrail,
  ShellHeader,
  TABLET_LG_UP,
  UtilityDock,
  useMediaQuery,
  useNavCollapsed,
  usePaletteHotkey,
  useShellNotifications,
  type ShellNavControl,
} from "../components/shell";
import type { NavItem } from "../lib/navigation";
import { teacherOnly } from "../auth/session";

export const Route = createFileRoute("/_studio")({
  /**
   * The studio is for signed-in teachers, and this is where that is decided.
   *
   * On the layout route rather than on each page beneath it, so a route added
   * to `_studio/` next week is protected by existing rather than by someone
   * remembering. And in `beforeLoad` rather than behind a `<SignedOut>`
   * wrapper, so a signed-out visitor never gets a frame of the desk painted
   * before being moved on.
   *
   * `teacherOnly` is a no-op unless the session is definitively signed out —
   * which it cannot be while Clerk is still loading, and never is when no
   * publishable key is configured.
   */
  beforeLoad: teacherOnly,
  component: StudioLayout,
});

/**
 * Teacher Studio shell — the persistent surface every desk-side page sits in.
 *
 * Two objects, and they own different things. The rail down the left is
 * navigation: the brand, the one thing the product makes, every destination
 * with its live count, the lessons recently touched, settings, and where the
 * work is kept. `UtilityDock` floats over the top of the content area and
 * carries the four controls that belong to the teacher rather than to any
 * page — search, announcements, appearance, the account. Neither is a bar
 * across the top of the page, which is what the owner asked for.
 *
 * Below 900px there is no rail to hold the first and no room to float the
 * second — CH08 turns the rail into a drawer there, which is where the four
 * controls go — so `ShellHeader` renders a compact bar with the things that
 * cannot wait behind a tap. It is the same shell in a different container, not
 * a second one.
 *
 * Four responsibilities live here and nowhere else: which navigation container
 * the viewport gets, the open state of the two overlays, the keyboard map, and
 * the one read of the announcement feed that the bell and the rail both count
 * from. Everything visual is delegated to `components/shell`.
 *
 * `main` carries no top padding of its own. The dock is `sticky` and therefore
 * still in flow, so the band it occupies is real height that it reserves for
 * itself — which is exactly why it is sticky rather than fixed: no page in
 * `_studio/` has to know the dock exists, and none can forget to leave room
 * for it.
 */
function StudioLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const navigate = useNavigate();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { collapsed, toggle } = useNavCollapsed();

  const isLaptop = useMediaQuery(LAPTOP_UP);
  const isTabletLandscape = useMediaQuery(TABLET_LG_UP);

  // Below laptop the rail is a fixed icon rail. There is not enough width to
  // spend 256px on labels there, and CH08 only hands the choice back to the
  // teacher once a laptop-sized viewport exists.
  const railCollapsed = isLaptop ? collapsed : true;

  // Read once, here. The bell used to own this state privately, which meant
  // nothing else in the shell could see it — the rail could not have shown an
  // unread count even if it had wanted to, and two readers would have kept two
  // "already seen" markers that drifted apart on the first click.
  const notifications = useShellNotifications();

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  // One control, wherever the navigation currently lives. At laptop widths it
  // is the rail's own collapse toggle; below 900px it is the compact bar's
  // drawer trigger. Tablet-landscape gets nothing: the rail is pinned to icons
  // there, so an enabled-looking button with no effect would be worse than an
  // empty slot.
  const navControl = useMemo<ShellNavControl | null>(() => {
    if (isLaptop) {
      return { kind: "collapse", expanded: !collapsed, onPress: toggle };
    }
    if (isTabletLandscape) return null;
    return { kind: "drawer", onPress: openDrawer };
  }, [isLaptop, isTabletLandscape, collapsed, toggle, openDrawer]);

  const openPalette = useCallback(() => {
    setPaletteOpen(true);
  }, []);

  const goToDestination = useCallback(
    (item: NavItem) => {
      setPaletteOpen(false);
      setDrawerOpen(false);
      void navigate({ to: item.href });
    },
    [navigate],
  );

  const startCreate = useCallback(() => {
    setPaletteOpen(false);
    setDrawerOpen(false);
    void navigate({ to: "/create" });
  }, [navigate]);

  const togglePalette = useCallback(() => {
    setPaletteOpen((open) => !open);
  }, []);

  usePaletteHotkey(togglePalette);

  return (
    <div className="flex min-h-svh bg-background">
      <NavRail
        pathname={pathname}
        collapsed={railCollapsed}
        unreadCount={notifications.unreadCount}
        notifications={notifications}
        onOpenPalette={openPalette}
      />

      <NavDrawer
        open={drawerOpen && !isTabletLandscape}
        onOpenChange={setDrawerOpen}
        pathname={pathname}
        unreadCount={notifications.unreadCount}
        notifications={notifications}
        onOpenPalette={openPalette}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ShellHeader
          pathname={pathname}
          onOpenPalette={openPalette}
          navControl={navControl}
          notifications={notifications}
        />

        <main id="continut" className="flex-1">
          <UtilityDock
            notifications={notifications}
            onOpenPalette={openPalette}
            navControl={navControl}
          />
          <PageTrail pathname={pathname} />
          <Outlet />
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNavigate={goToDestination}
        onCreate={startCreate}
      />
    </div>
  );
}
