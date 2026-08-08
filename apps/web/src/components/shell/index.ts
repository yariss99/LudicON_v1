/**
 * The application shell.
 *
 * `_studio.tsx` composes these; nothing else should reach past this barrel.
 * The split is by responsibility rather than by element, so the rail, the
 * drawer and the palette each stay small enough to read in one screen.
 */

export { CommandPalette } from "./command-palette";
export type { CommandPaletteProps } from "./command-palette";

export { NavDrawer } from "./nav-drawer";
export type { NavDrawerProps } from "./nav-drawer";

export { NavRail } from "./nav-rail";
export type { NavRailProps } from "./nav-rail";

export { PageTrail } from "./page-trail";
export type { PageTrailProps } from "./page-trail";

export { ShellHeader } from "./shell-header";
export type { ShellHeaderProps } from "./shell-header";

export type { ShellNavControl } from "./shell-menu-button";

export { UtilityDock } from "./utility-dock";
export type { UtilityDockProps } from "./utility-dock";

export { useShellNotifications } from "./use-shell-notifications";
export type { ShellNotificationsState } from "./use-shell-notifications";

export { LAPTOP_UP, TABLET_LG_UP, useMediaQuery } from "./use-media-query";
export { usePaletteHotkey } from "./use-nav-hotkeys";
export { useNavCollapsed } from "./use-nav-collapsed";
export type { NavCollapsedState } from "./use-nav-collapsed";
