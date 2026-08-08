import { Link } from "@tanstack/react-router";
import { Tooltip, TooltipContent, TooltipTrigger, cn } from "@ludicon/ui";

import type { NavItem } from "../../lib/navigation";
import { NavCount, navCountLabel } from "./nav-count";

export interface NavItemLinkProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  /** Live number for this destination. Absent or zero renders no chip. */
  count?: number;
  onNavigate?: () => void;
}

/**
 * One destination in the rail.
 *
 * The active state is a soft fill, a colour change, a weight change and
 * `aria-current="page"`. There is no marker element: a bar in the rail's gutter
 * and then a dot in the same place were both tried and the owner has removed
 * both, so the row itself is the whole signal.
 *
 * That makes the semibold load-bearing rather than decorative. Fill and ink
 * colour are both colour channels; the weight is the only visual difference
 * that survives a reader who cannot use hue, which is what keeps this clear of
 * CH07's ban on meaning carried by colour alone. It must not be dropped for
 * evenness. It also cannot destabilise the row: the label sits in a
 * `min-w-0 flex-1 truncate` box, so heavier glyphs change the type and nothing
 * else — the icon does not move and the count chip does not move.
 *
 * Collapsed to 72px there is no label to set in semibold, and the honest
 * reading is that the non-colour channel there is presence rather than weight:
 * the current destination is the one row wearing a filled disc, and the other
 * six wear nothing at all.
 *
 * The row is a pill. Everything it stands next to already is — `Creează`, the
 * count chips, the search field, every status chip on every page — and at
 * `--radius-sm` this was the one element in the shell that read as square
 * beside them. `--radius-md` was the alternative and it was rejected: 16px is
 * the card step, and a row of little cards would claim these are surfaces to
 * look at rather than controls to press. They are controls, and in this product
 * a control is a pill.
 *
 * Destinations carry no keyboard hint. The only shortcut the product keeps is
 * ⌘K, and a hint that only appears on hover teaches nobody: the teacher who
 * would benefit most from the keyboard is the one who never hovers to find out
 * it exists.
 *
 * The live count is `NavCount`, which owns its two tones and the reasons for
 * them. What matters here is only that a count belongs to a row and knows
 * whether that row is the current page.
 *
 * "Is there anything new?" and "how much is there?" are different questions and
 * they are answered by different objects. The number is this row's job at every
 * width. The amber dot is the bell's job — here only when the rail is collapsed
 * to 72px and there is no room for a number, and otherwise in the floating dock
 * and the compact bar. One dot, one size, one colour, three places.
 */
export function NavItemLink({
  item,
  active,
  collapsed,
  count,
  onNavigate,
}: NavItemLinkProps) {
  const Icon = item.icon;
  const attention = item.signal === "unread";
  const showChip = typeof count === "number" && count > 0;

  const link = (
    <Link
      to={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 items-center rounded-full",
        "text-base leading-[1.4]",
        "transition-[background-color,color] duration-[var(--motion-fast)] ease-standard",
        // Collapsed, the row is a 44px square centred in the 48px column
        // rather than a full-width bar. A hover fill that runs edge to edge in
        // a 72px rail reads as a stripe across the chrome; a square reads as
        // the button it is, and it is the same 44px target either way.
        collapsed ? "mx-auto w-11 justify-center px-0" : "gap-3 pr-3 pl-3.5",
        active
          ? "bg-primary-soft font-semibold text-primary"
          : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <span className="relative flex shrink-0 items-center">
        <Icon aria-hidden strokeWidth={1.75} className="size-5" />
        {/* Collapsed to icons there is no room for a chip, so only the signal
            that is genuinely time-sensitive survives the squeeze. An inventory
            dot would say "you own things", which is not news. */}
        {collapsed && attention && showChip ? (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-1 size-2 rounded-full bg-accent ring-2 ring-surface"
          />
        ) : null}
      </span>

      {collapsed ? (
        <span className="sr-only">
          {showChip ? `${item.label} — ${navCountLabel(count)}` : item.label}
        </span>
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {showChip ? (
            <>
              <NavCount count={count} onActiveRow={active} />
              {/* The chip counts what is unread, and "Notificări 6" does not
                  say so out loud. Sighted readers get that from the bell dot
                  in the dock; this is the same sentence for everyone else. */}
              {attention ? <span className="sr-only">anunțuri noi</span> : null}
            </>
          ) : null}
        </>
      )}
    </Link>
  );

  return (
    <li>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">
            {showChip ? `${item.label} · ${navCountLabel(count)}` : item.label}
          </TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
    </li>
  );
}
