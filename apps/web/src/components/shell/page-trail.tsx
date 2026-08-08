import { navSectionForPath } from "../../lib/navigation";
import { ShellBreadcrumb } from "./shell-breadcrumb";

export interface PageTrailProps {
  pathname: string;
}

/**
 * The way back up, inside the content area rather than above it.
 *
 * Two jobs, and they turn out to be the same job.
 *
 * The first is orientation. `/projects/abc` has no entry in the rail, so at
 * tablet-landscape — where the rail is pinned to icons and cannot even show a
 * label — nothing on screen named the ancestor or offered a route back to it.
 * The compact bar handled that below 900px and the top bar handled it above;
 * with the top bar gone, this does.
 *
 * The second is the objection to merging at all: that the header band was the
 * only element spanning the content area's full width, and therefore the only
 * thing that made the 1040px reading column read as centred in an 1184px area
 * instead of shoved right in a 1440px viewport. This restores a band at the top
 * of that area — but only on the routes where a band has something true to say,
 * rather than an empty bar drawn across every page to prove the area exists.
 *
 * On a top-level destination it renders nothing. The rail is already carrying
 * that name with a fill, a weight, a marker bar and `aria-current`, and the
 * region's left boundary is stated the full height of the page by the rail's
 * own hairline edge. A strip repeating the rail would be the duplication the
 * breadcrumb was trimmed back to avoid.
 *
 * It matches the deep pages' own `shell-column px-6`, so the trail sits on
 * the same left edge as the title beneath it rather than on a second one — and
 * on the same measure as `UtilityDock` above it, which is what puts the two on
 * one visual line: location on the left, the teacher's own controls on the
 * right, with no band drawn behind either of them.
 *
 * Its top padding is 4px rather than 24px because the dock's row already
 * supplies the rhythm above it. Two elements each reserving a full step is how
 * a page ends up starting a hundred pixels down.
 */
export function PageTrail({ pathname }: PageTrailProps) {
  if (!navSectionForPath(pathname)) return null;

  return (
    <div className="shell-column hidden px-6 pt-1 tablet-lg:block">
      <ShellBreadcrumb pathname={pathname} />
    </div>
  );
}
