import { AppearanceMenu } from "./appearance-menu";
import { AuthControl } from "./auth-control";
import { NotificationsMenu } from "./notifications-menu";
import type { ShellNotificationsState } from "./use-shell-notifications";

export interface PanelUtilitiesProps {
  notifications: ShellNotificationsState;
  onOpenPalette: () => void;
}

/**
 * The global controls, for the one container that still has to hold them.
 *
 * From 900px up these live in `UtilityDock`, floating over the page. Below
 * that there is no dock and no rail: the navigation is a drawer, so the drawer
 * is where the account, the announcements and the appearance control have to
 * be reachable, or they are not reachable at all.
 *
 * Only the drawer renders this. The rail no longer does, and that is the whole
 * point of the change — with these gone it is navigation and nothing else.
 *
 * There is no divider between the bell and the appearance control. The old
 * header drew one there and called it "signal versus account", but the two
 * things it separated were an icon button and an icon button: identical
 * silhouettes, four pixels apart, with a rule between them that read as debris
 * rather than as structure. Grouping is done by spacing instead — the identity
 * control takes the row's width and the two utilities sit together at its end.
 */
export function PanelUtilities({
  notifications,
  onOpenPalette,
}: PanelUtilitiesProps) {
  return (
    <div className="flex flex-row items-center gap-1">
      <AuthControl
        onOpenPalette={onOpenPalette}
        side="top"
        className="min-w-0 flex-1"
      />
      <NotificationsMenu notifications={notifications} side="top" />
      <AppearanceMenu side="top" />
    </div>
  );
}
