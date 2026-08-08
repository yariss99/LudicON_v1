import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  cn,
} from "@ludicon/ui";

import { AppearanceOptions, useAppearanceIcon } from "./appearance-options";
import { SHELL_ICON_BUTTON, SHELL_ICON_GLYPH } from "./icon-button";

const APPEARANCE_LABEL = "Aspectul interfeței";

export interface AppearanceMenuProps {
  /** `top` in the rail's footer, `bottom` in the compact bar. */
  side?: "top" | "bottom";
  className?: string;
}

/**
 * The appearance control, as a control rather than a menu row.
 *
 * It used to exist twice and differently: a peer button beside Clerk's own
 * `UserButton`, and a submenu inside the fallback profile menu. Which one a
 * teacher got depended on whether a publishable key happened to be configured,
 * which is not a fact about them. One component, used by both branches, ends
 * that.
 *
 * The trigger shows what you are looking at now — sun in light, moon in dark —
 * rather than what clicking would do. A control that displays its own current
 * state is readable at a glance; one that displays its inverse has to be
 * reasoned about.
 */
export function AppearanceMenu({
  side = "bottom",
  className,
}: AppearanceMenuProps) {
  const AppearanceIcon = useAppearanceIcon();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={APPEARANCE_LABEL}
        className={cn(SHELL_ICON_BUTTON, className)}
      >
        <AppearanceIcon
          aria-hidden
          strokeWidth={1.75}
          className={SHELL_ICON_GLYPH}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={side} className="min-w-52">
        <DropdownMenuLabel>{APPEARANCE_LABEL}</DropdownMenuLabel>
        <AppearanceOptions />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
