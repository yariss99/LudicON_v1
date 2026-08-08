import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@ludicon/ui";

import { SHELL_ICON_BUTTON, SHELL_ICON_GLYPH } from "./icon-button";

/**
 * What the navigation-shape button does at this width.
 *
 * `null` at tablet-landscape: CH08 fixes the rail to icons there and hands the
 * choice back only once a laptop-sized viewport exists, so there is nothing to
 * offer and an inert button would be worse than none.
 */
export type ShellNavControl =
  | { kind: "drawer"; onPress: () => void }
  | { kind: "collapse"; expanded: boolean; onPress: () => void };

export interface ShellMenuButtonProps {
  control: ShellNavControl;
  className?: string;
}

/**
 * One control, one meaning: "change the shape of the navigation".
 *
 * It now lives beside the thing it changes rather than in a separate band. The
 * collapse toggle sits in the rail's own brand row, where a teacher looking at
 * the rail and wanting less of it is already looking; the drawer trigger sits
 * at the top-left of the compact bar, which is the only chrome at widths where
 * the rail does not exist. Same component, same glyph vocabulary, and the two
 * can never disagree about state because only one of them is ever rendered.
 */
export function ShellMenuButton({ control, className }: ShellMenuButtonProps) {
  const isDrawer = control.kind === "drawer";
  const expanded = control.kind === "collapse" ? control.expanded : false;

  const Icon = isDrawer ? Menu : expanded ? PanelLeftClose : PanelLeftOpen;
  const label = isDrawer
    ? "Deschide meniul"
    : expanded
      ? "Restrânge meniul"
      : "Extinde meniul";

  return (
    <button
      type="button"
      onClick={control.onPress}
      aria-expanded={isDrawer ? undefined : expanded}
      className={cn(SHELL_ICON_BUTTON, className)}
    >
      <Icon aria-hidden strokeWidth={1.75} className={SHELL_ICON_GLYPH} />
      <span className="sr-only">{label}</span>
    </button>
  );
}
