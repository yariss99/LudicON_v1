import {
  Bell,
  CalendarDays,
  FolderKanban,
  History,
  Home,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * The shell's navigation model.
 *
 * One list, three consumers: the desktop rail, the mobile drawer and the
 * command palette. Adding a destination here adds it to all three, including
 * its key — there is no second place to remember.
 *
 * It is also the list that decides what the product claims to be, which is why
 * `Bibliotecă` is no longer on it. It listed `Resource` records, and nothing in
 * this app writes one — the writer went to `/legacy` with the lesson-planning
 * model. A destination that can never hold anything is not a page waiting for
 * content; it is the product telling a teacher, in the one place they cannot
 * avoid looking, that a part of it is broken.
 *
 * Keeping it and filling it was considered and rejected on the data. The only
 * candidate with a question worth answering was a shelf of reusable EXERCISES
 * across papers, and an exercise is not a thing that can sit on a shelf. It is
 * minted from a registry definition by `newExerciseBlock(definition)` and lives
 * in one document's block map; `PieceKind` in
 * `features/evaluation/block-factory.ts` excludes `exercise` for exactly that
 * reason — "adaugă un exercițiu" is not an answerable request, only "adaugă o
 * Alegere cu un răspuns" is. So the destination had two possible contents and
 * neither is a page: the fourteen TYPES, which the builder's own library panel
 * already lists from the registry, one navigation level closer to the paper
 * being written; or saved INSTANCES, which nothing in the product stores.
 *
 * (The count is the part that dates. Fourteen definitions are registered today
 * where none were when this was written, and it changed nothing above — the
 * argument never rested on the shelf being empty, it rests on there being no
 * shelf.)
 */

export type NavHref =
  | "/"
  | "/projects"
  | "/activity"
  | "/calendar"
  | "/notifications"
  | "/settings";

/**
 * Where an item sits in the rail.
 *
 * `work` is what the teacher opens to make something; `track` is what the
 * teacher opens to check on something. `system` is pinned to the footer.
 *
 * These now carry visible headings. A bare hairline separated the two groups
 * without ever saying what changed across it, so the rail read as one list that
 * happened to have a gap in the middle. A two-word heading is the cheapest
 * thing that turns a list into a structure, and it is what lets the rail lose a
 * destination — or gain one — without the remaining rows having to be re-read.
 */
export type NavSection = "work" | "track" | "system";

/** Heading shown above a group in the rail. Sentence case — never ALL-CAPS. */
export const NAV_SECTION_LABEL: Readonly<Record<NavSection, string>> = {
  work: "Atelier",
  track: "Urmărire",
  system: "Cont",
};

/**
 * Which live number belongs on a destination, if any.
 *
 * Named rather than numeric so the rail asks the data layer for a specific
 * thing it can actually count. A destination with no meaningful quantity —
 * `Acasă`, `Activitate`, `Calendar`, `Setări` — simply has no signal, and shows
 * no chip.
 *
 * `resources` was a third member and it is gone with the destination that wore
 * it. It counted a collection with no producer, so the chip was a permanent
 * zero — and the union is the right place to enforce that, because a signal
 * that exists as a type is a signal somebody will eventually wire back up.
 */
export type NavSignal = "projects" | "unread";

export type NavItem = {
  id: string;
  label: string;
  /** One line of orientation. Shown in the command palette. */
  description: string;
  href: NavHref;
  section: NavSection;
  icon: LucideIcon;
  signal?: NavSignal;
};

export const STUDIO_NAV: readonly NavItem[] = [
  {
    id: "home",
    label: "Acasă",
    description: "Biroul tău și lucrul început",
    href: "/",
    section: "work",
    icon: Home,
  },
  {
    id: "projects",
    label: "Proiecte",
    description: "Toate proiectele de lecție",
    href: "/projects",
    section: "work",
    icon: FolderKanban,
    signal: "projects",
  },
  {
    id: "activity",
    label: "Activitate",
    description: "Ce s-a schimbat în ultima vreme",
    href: "/activity",
    section: "track",
    icon: History,
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Lecțiile așezate pe zile",
    href: "/calendar",
    section: "track",
    icon: CalendarDays,
  },
  {
    id: "notifications",
    label: "Notificări",
    description: "Anunțuri despre proiectele tale",
    href: "/notifications",
    section: "track",
    icon: Bell,
    signal: "unread",
  },
  {
    id: "settings",
    label: "Setări",
    description: "Preferințele contului și ale atelierului",
    href: "/settings",
    section: "system",
    icon: Settings,
  },
] as const;

/** Sections rendered in the body of the rail, in order. */
export const RAIL_SECTIONS: readonly NavSection[] = ["work", "track"];

export const NAV_BY_SECTION: Readonly<Record<NavSection, readonly NavItem[]>> =
  {
    work: STUDIO_NAV.filter((item) => item.section === "work"),
    track: STUDIO_NAV.filter((item) => item.section === "track"),
    system: STUDIO_NAV.filter((item) => item.section === "system"),
  };

/** The destination whose label names the current location. */
export function navItemForPath(pathname: string): NavItem | undefined {
  return STUDIO_NAV.find((item) => item.href === pathname);
}

/**
 * The destination a deeper page belongs to.
 *
 * `/projects/abc` has no entry of its own, and the breadcrumb used to answer
 * that by showing `Acasă` and stopping — so a teacher inside a lesson at tablet
 * width, where the rail is a closed drawer, was told nothing at all about where
 * they were. Longest-prefix match gives the ancestor an honest name and, more
 * usefully, a way back up.
 *
 * The desk is excluded on purpose: `/` prefixes everything, so including it
 * would make every page a child of the desk and the match meaningless.
 */
export function navSectionForPath(pathname: string): NavItem | undefined {
  return STUDIO_NAV.filter(
    (item) => item.href !== "/" && pathname.startsWith(`${item.href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];
}
