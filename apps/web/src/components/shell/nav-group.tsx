import { cn } from "@ludicon/ui";

import {
  NAV_SECTION_LABEL,
  type NavItem,
  type NavSection,
  type NavSignal,
} from "../../lib/navigation";
import { NavItemLink } from "./nav-item-link";

export interface NavGroupProps {
  section: NavSection;
  items: readonly NavItem[];
  pathname: string;
  collapsed: boolean;
  counts: Readonly<Partial<Record<NavSignal, number>>>;
  /** First group in the rail: no seam above it, no space above it. */
  leading: boolean;
  onNavigate?: () => void;
}

/**
 * A titled run of destinations.
 *
 * The heading is a `<div>` inside a labelled `<ul>` rather than an `<h*>`: it
 * names a group of links, not a section of the document, and promoting it to a
 * heading would put two extra entries into the page's heading outline that lead
 * nowhere. `aria-label` on the list carries the same name to assistive tech.
 *
 * Collapsed to icons the heading simply disappears and the seam is carried by
 * space alone. A 72px rail has no room for a word, and it used to draw a short
 * hairline there instead — but the rail is not allowed internal hairlines any
 * more, so the gap between groups is opened up to do the same work. It is the
 * same instrument the expanded rail already uses between its own groups, which
 * is the better answer anyway: one rule for both widths rather than two.
 */
export function NavGroup({
  section,
  items,
  pathname,
  collapsed,
  counts,
  leading,
  onNavigate,
}: NavGroupProps) {
  const label = NAV_SECTION_LABEL[section];

  return (
    <div className={cn(leading ? "pt-0" : "pt-7")}>
      {collapsed ? null : (
        // `--text-subtle` rather than `--text-muted`: the heading names the
        // run, it is not one of the destinations, and stepping it down one tier
        // stops it competing with the rows it introduces. It still measures
        // 5.0:1 on the rail in light and 6.3:1 in dark, so quieter here does
        // not mean fainter than AA.
        <div className="px-3 pb-1.5 text-[0.75rem] leading-[1.4] font-semibold tracking-[0.02em] text-subtle">
          {label}
        </div>
      )}

      <ul aria-label={label} className="flex flex-col gap-1">
        {items.map((item) => (
          <NavItemLink
            key={item.id}
            item={item}
            active={pathname === item.href}
            collapsed={collapsed}
            count={item.signal ? counts[item.signal] : undefined}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </div>
  );
}
