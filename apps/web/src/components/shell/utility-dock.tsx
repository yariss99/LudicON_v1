import { cn } from "@ludicon/ui";

import { AppearanceMenu } from "./appearance-menu";
import { AuthControl } from "./auth-control";
import { NotificationsMenu } from "./notifications-menu";
import { SearchTrigger } from "./search-trigger";
import { ShellMenuButton, type ShellNavControl } from "./shell-menu-button";
import { useScrolled } from "./use-scrolled";
import type { ShellNotificationsState } from "./use-shell-notifications";

export interface UtilityDockProps {
  notifications: ShellNotificationsState;
  onOpenPalette: () => void;
  /** The rail's collapse control. `null` where the rail cannot be reshaped. */
  navControl: ShellNavControl | null;
}

/**
 * The four global controls, as a full-width bar across the top of the content.
 *
 * Search, what arrived, how this looks, who you are — the things that belong
 * to the teacher rather than to the page. They spent one pass in the rail's
 * footer, and one as a floating island inset from every edge; the owner has
 * settled on a band, with search leading from the left.
 *
 * The split is the point of the layout. Search is a destination — it is where
 * you go when you know what you want and not where it lives — so it takes the
 * left edge, which is where reading starts. The three round controls are
 * status and settings, consulted rather than aimed at, so they collect at the
 * far right. `ml-auto` is what separates them, not a fixed gap: the bar is full
 * width, so the space between the two groups is whatever is left over, and it
 * grows with the viewport instead of the groups drifting apart.
 *
 * ## Still an island, now a wide one
 *
 * It keeps its own surface, hairline and elevation, and it stays inset from
 * every edge — it is a floating object that happens to span the column, not a
 * band welded to the top of the page. What changed is only its width and the
 * arrangement inside it.
 *
 * ## Full width of the content, not of the viewport
 *
 * It spans `main`, so it starts where the rail ends rather than crossing over
 * it. That keeps the rail the tallest thing on screen and unbroken, and it
 * keeps this element inside the region it belongs to. An island that also
 * covered the rail would have to be lifted out of `main` and positioned from
 * the viewport, and would then have to track the rail's width by hand — which
 * is exactly the coupling that produced the layout shift this shell already
 * fixed once.
 *
 * ## Width
 *
 * `shell-column` inside a `px-6` gutter — the same pair every page under
 * `_studio/` uses, so the island's two ends land on the page's own edges on
 * every route rather than on a second pair invented for the chrome.
 *
 * This used to be a real problem. The studio ran two measures — one page at
 * `--shell-max` and everything else at `--reading-max` — so no width existed
 * that matched both and the island was always short of one or over the other.
 * The pages were unified onto `shell-column` instead of the island being asked
 * to pick a side. If a page ever reverts to `reading-column`, this will hang
 * over it again — the fix belongs there, not here.
 *
 * The odd page out was `Bibliotecă`, which has since been removed. The rule is
 * what mattered, not the page, so it is stated without the example rather than
 * deleted along with it.
 *
 * ## Sticky, not fixed, and not scroll-hiding
 *
 * `sticky` keeps the bar in the document's flow. That single property is what
 * makes it honest: it occupies real height at the top of the content area, so
 * on first paint nothing at all is underneath it. `fixed` would take it out of
 * flow and every page in `_studio/` would have to be taught to reserve a band
 * for it — a contract that is invisible in each page's own source and that the
 * next page added will forget.
 *
 * Scroll-aware *hiding* was rejected. Search and the account are not things a
 * teacher should have to scroll up to reach, and a control that disappears on
 * intent is worse than one that occupies its own height. What is scroll-aware
 * is the elevation: at rest the island sits on the canvas with the ambient
 * shadow every other card uses, and once the page moves under it, it takes the
 * deeper one. That is the only moment it is genuinely floating above content,
 * and it is the moment it says so. Colour and shadow only; no layout property
 * is animated and nothing moves.
 *
 * The island is opaque, which it has to be now that content scrolls beneath it
 * rather than beside it.
 *
 * Below 900px it does not render. The compact bar already has to exist for the
 * drawer trigger and the location, and a second band over a 375px page would be
 * a duplicate that costs the content its height. See `shell-header.tsx`.
 */
export function UtilityDock({
  notifications,
  onOpenPalette,
  navControl,
}: UtilityDockProps) {
  const lifted = useScrolled();
  const toggle = navControl?.kind === "collapse" ? navControl : null;

  return (
    <div className="pointer-events-none sticky top-0 z-30 hidden tablet-lg:block">
      {/* The measure and the gutter go on the same box, matching the pages.
          The cap applies to the border box, so putting `shell-column` on the
          island inside a `px-6` parent would subtract the gutter from the cap
          and leave the island 48px narrower than the page under it — but only
          on displays wide enough for 1600px to bind, which is exactly the kind
          of drift that survives a check at one window size. */}
      <div className="shell-column px-6 pt-4 pb-2">
        <div
          className={cn(
            "pointer-events-auto flex items-center gap-2 rounded-full p-1.5",
            "bg-surface ring-1 ring-border-strong",
            "transition-[box-shadow,background-color,border-color] duration-[var(--motion-standard)] ease-standard",
            lifted ? "shadow-hover" : "shadow-soft",
          )}
        >
          {/* The rail's shape control, at the end of the dock nearest the rail.

              It used to sit in the rail's own brand row, and it changed *row*
              when the rail collapsed — a 72px column has no room for a brand
              and a button side by side, so it dropped into a strip of its own
              underneath. Its y moved, its neighbours changed, and it had to be
              re-found after every use.

              Here only its x moves, and only by as much as the content area
              itself: collapsing shifts everything left, so the button travels
              with the page rather than relative to it. It stays on the same
              row, at the same height, in the same position within the dock,
              which is the part a hand remembers. Nothing keeps a control
              perfectly still while the column beside it changes width — the
              choice is which frame of reference to hold constant, and the
              content area is the one the teacher is looking at.

              It also sits where a hand already is: immediately right of the
              rail, pointing at the thing it reshapes. The dock and the rail
              share the `tablet-lg` breakpoint exactly, so the two always exist
              together and this is never an inert button with nothing to act
              on. Below that width the compact bar's drawer trigger takes over —
              the same component, the same glyph vocabulary. */}
          {toggle ? <ShellMenuButton control={toggle} /> : null}

          {/* The field has no fill of its own in here. `--background` is the
              canvas colour, and a canvas-coloured lozenge inside a `--surface`
              island reads as a hole cut in the island rather than a field
              resting on it. A hairline states its edge instead, and the island
              stays one object. It is capped rather than fluid: search is a
              320px control that happens to sit on a wide bar, and stretching it
              to the controls would make the island read as a text field with
              three buttons stuck to the end of it. */}
          <SearchTrigger
            compact={false}
            onOpen={onOpenPalette}
            className="w-full max-w-80 bg-transparent"
          />

          {/* Grouped by spacing, not by rules. An earlier header drew a divider
              between two icon buttons and it read as debris; these three are
              already separated from search by the whole width of the island.
              `ml-auto` is what does it, so the space between the two groups is
              whatever is left over and grows with the viewport, rather than the
              groups drifting apart on a fixed gap. */}
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <NotificationsMenu notifications={notifications} side="bottom" />
            <AppearanceMenu side="bottom" />
            <AuthControl onOpenPalette={onOpenPalette} side="bottom" compact />
          </div>
        </div>
      </div>
    </div>
  );
}
