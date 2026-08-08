import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@ludicon/ui";

import { navItemForPath, navSectionForPath } from "../../lib/navigation";

const DESK_LABEL = "Acasă";

export interface ShellBreadcrumbProps {
  pathname: string;
  className?: string;
}

/**
 * Where the teacher is — said once, by whichever surface is actually present.
 *
 * This used to restate the rail. On `/projects` the header read
 * `Acasă › Proiecte` while, four inches to the left, the rail was already
 * carrying `Proiecte` with a left bar, a soft fill, semibold weight and
 * `aria-current="page"`. Five signals for one fact, and the four in the rail
 * were the better four.
 *
 * So the trail speaks only when it knows something the rail does not, and its
 * two callers divide the widths between them:
 *
 * - On a top-level destination it renders **only below `tablet-lg`**, inside
 *   the compact bar — exactly where the rail has become a closed drawer and
 *   nothing else on screen names the page.
 * - On a deeper page — `/projects/abc` — it renders at every width, because the
 *   ancestor is genuinely absent from the rail and, as a link, is the way back
 *   up. Below `tablet-lg` the compact bar carries it; above, `PageTrail` places
 *   it at the top of the content area on the page's own left edge. It stops at
 *   the section: the page's `h1` already carries the title, and repeating it
 *   here would reintroduce the duplication one level down.
 *
 * `Acasă ›` is suppressed below `tablet-lg` because the compact bar is already
 * holding a drawer trigger, a mark and two utilities on a 375px line; the
 * section alone is what orients, and the mark beside it is the way home.
 */
export function ShellBreadcrumb({ pathname, className }: ShellBreadcrumbProps) {
  const current = navItemForPath(pathname);
  const section = navSectionForPath(pathname);

  // A named ancestor means this page is deeper than the rail can show.
  if (section) {
    return (
      <nav aria-label="Traseu" className={cn("min-w-0", className)}>
        <ol className="flex min-w-0 items-center gap-1.5 text-sm leading-[1.4]">
          <li className="hidden shrink-0 tablet-lg:block">
            <Link
              to="/"
              className={cn(
                "rounded-sm text-muted-foreground",
                "transition-colors duration-[var(--motion-fast)] ease-standard",
                "hover:text-foreground",
              )}
            >
              {DESK_LABEL}
            </Link>
          </li>

          <li aria-hidden className="hidden shrink-0 tablet-lg:block">
            <ChevronRight strokeWidth={1.75} className="size-4 text-subtle" />
          </li>

          <li className="min-w-0">
            <Link
              to={section.href}
              className={cn(
                "block truncate rounded-sm font-medium text-foreground",
                "transition-colors duration-[var(--motion-fast)] ease-standard",
                "hover:text-primary",
              )}
            >
              {section.label}
            </Link>
          </li>
        </ol>
      </nav>
    );
  }

  const label = current?.label ?? DESK_LABEL;

  return (
    <nav
      aria-label="Traseu"
      className={cn("min-w-0 tablet-lg:hidden", className)}
    >
      <p
        aria-current="page"
        className="truncate text-sm leading-[1.4] font-medium text-foreground"
      >
        {label}
      </p>
    </nav>
  );
}
