import { Link } from "@tanstack/react-router";
import { ChevronDown, Search, Settings, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from "@ludicon/ui";

import { SHELL_ICON_BUTTON, SHELL_ICON_GLYPH } from "./icon-button";
import { MOD_KEY_LABEL, ShortcutHint } from "./shortcut-hint";

export interface ProfileMenuProps {
  onOpenPalette: () => void;
  /** `top` in the rail's footer, `bottom` in the compact bar. */
  side?: "top" | "bottom";
  /** Icon-only, for the 72px rail and for the compact bar. */
  compact?: boolean;
  className?: string;
}

const ACCOUNT_LABEL = "Profil";
const ACCOUNT_DETAIL = "Lucrezi pe acest dispozitiv";

/**
 * The identity control when no provider is configured.
 *
 * It shows a neutral glyph rather than invented initials or a stock face: the
 * shell must not imply an account that does not exist, and CH12 rules out
 * giving the product a face of its own.
 *
 * The glyph is now bare. It used to sit inside a tinted, ringed 32px disc, and
 * that disc was doing two harmful things at once: it read as an avatar that had
 * failed to load, and — since it lived inside the same 44px target its
 * neighbours fill edge to edge with a 20px mark — it made the account the one
 * control in the row visibly floating off its own border. Both problems have
 * the same fix. Shape from `SHELL_ICON_BUTTON`, mark from `SHELL_ICON_GLYPH`,
 * exactly like the bell and the appearance control beside it.
 *
 * The labelled form keeps the word. "Profil" costs nothing and turns "is this
 * loading?" into a plain statement, and the menu's own secondary line answers
 * the real question honestly: nobody is signed in, and the work is on this
 * machine.
 *
 * Appearance is no longer a submenu here. It is a peer control in whichever
 * cluster this one sits in, so the two auth branches offer the same thing in
 * the same place — see `AppearanceMenu`.
 */
export function ProfileMenu({
  onOpenPalette,
  side = "bottom",
  compact = false,
  className,
}: ProfileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          SHELL_ICON_BUTTON,
          // Whether there is room for the word is a fact about the container,
          // so the container is what decides. Everything else — diameter,
          // radius, hover, cursor, transition — comes from the constant, which
          // is what stops this control drifting away from its neighbours again.
          compact ? null : "min-h-11 w-auto min-w-0 gap-2.5 pr-3 pl-3.5",
          className,
        )}
      >
        <UserRound
          aria-hidden
          strokeWidth={1.75}
          className={cn(SHELL_ICON_GLYPH, "shrink-0")}
        />
        {compact ? null : (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-[0.9375rem] leading-[1.4] font-medium text-foreground">
              {ACCOUNT_LABEL}
            </span>
            <ChevronDown
              aria-hidden
              strokeWidth={1.75}
              className="size-4 shrink-0"
            />
          </>
        )}
        <span className="sr-only">{ACCOUNT_LABEL}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side={side} className="w-68">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <span
            aria-hidden
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border"
          >
            <UserRound strokeWidth={1.75} className="size-5" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-foreground">
              {ACCOUNT_LABEL}
            </span>
            <span className="truncate text-[0.8125rem] leading-[1.4] text-muted-foreground">
              {ACCOUNT_DETAIL}
            </span>
          </span>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer" onSelect={onOpenPalette}>
          <Search aria-hidden strokeWidth={1.75} />
          <span className="flex-1">Căutare rapidă</span>
          <ShortcutHint keys={`${MOD_KEY_LABEL} K`} />
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/settings">
            <Settings aria-hidden strokeWidth={1.75} />
            <span className="flex-1">Setări</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
