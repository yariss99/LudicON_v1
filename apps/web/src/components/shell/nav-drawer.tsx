import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@ludicon/ui";

import { NavPanel } from "./nav-panel";
import type { ShellNotificationsState } from "./use-shell-notifications";

export interface NavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  unreadCount: number;
  notifications: ShellNotificationsState;
  onOpenPalette: () => void;
}

/**
 * The rail below 900px.
 *
 * CH08 §5 turns side panels into drawers at tablet-portrait and mobile: same
 * content, same order, different container. Labels are always shown here —
 * there is no hover to reveal a tooltip on a touch screen, so an icon rail
 * would strand the teacher.
 *
 * It renders the panel's `drawer` variant, which is the navigation plus the
 * four global controls. Above 900px those float over the page instead; here
 * there is no dock and no rail, so this column is the only place they can be
 * reached. That is also the honest split for the bar beside it: a 375px line
 * cannot hold six controls and a page name, and the two a teacher touches least
 * are the two that can afford to be one tap away.
 *
 * Escape and the overlay both close it, and choosing a destination closes it
 * too: CH07 requires an exit from every surface, and a drawer left open over
 * the page the teacher just asked for is a keyboard trap in spirit.
 */
export function NavDrawer({
  open,
  onOpenChange,
  pathname,
  unreadCount,
  notifications,
  onOpenPalette,
}: NavDrawerProps) {
  const close = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        closeLabel="Închide meniul"
        className="w-[17rem] gap-0 p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigare</SheetTitle>
          <SheetDescription>
            Alege o secțiune a atelierului sau începe ceva nou.
          </SheetDescription>
        </SheetHeader>

        <NavPanel
          variant="drawer"
          pathname={pathname}
          collapsed={false}
          onNavigate={close}
          unreadCount={unreadCount}
          notifications={notifications}
          onOpenPalette={() => {
            close();
            onOpenPalette();
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
