import type { CreateOption, StudioNavItem } from "../types";

export const STUDIO_NAV: readonly StudioNavItem[] = [
  { id: "home", label: "Acasă", href: "/", shortcut: "G H" },
  { id: "projects", label: "Proiecte", href: "/projects", shortcut: "G P" },
  { id: "library", label: "Bibliotecă", href: "/library", shortcut: "G L" },
  { id: "activity", label: "Activitate", href: "/activity", shortcut: "G A" },
  { id: "calendar", label: "Calendar", href: "/calendar", shortcut: "G C" },
  {
    id: "notifications",
    label: "Notificări",
    href: "/notifications",
    shortcut: "G N",
  },
  { id: "settings", label: "Setări", href: "/settings", shortcut: "G S" },
] as const;

/**
 * Creation entry points on the desk.
 *
 * `directPath` is a flow that works without an existing project.
 * `builderPath` is a real builder route that needs `/:projectId` appended.
 * Both null means no builder exists yet — the card says so instead of
 * pretending. `/create/experience` ignores query params, so no `?intent` is
 * used here.
 */
export const CREATE_OPTIONS: readonly CreateOption[] = [
  {
    id: "lesson",
    label: "Lecție",
    description: "Construiește o experiență de învățare.",
    accent: "blue",
    directPath: "/create/experience",
    builderPath: null,
  },
  {
    id: "worksheet",
    label: "Fișă de lucru",
    description: "Creează materiale gata pentru clasă.",
    accent: "teal",
    directPath: null,
    builderPath: null,
  },
  {
    id: "game",
    label: "Joc educativ",
    description: "Transformă exersarea într-o provocare.",
    accent: "amber",
    directPath: null,
    builderPath: "/game-builder",
  },
  {
    id: "story",
    label: "Poveste",
    description: "Construiește un parcurs de învățare prin poveste.",
    accent: "coral",
    directPath: null,
    builderPath: "/story-builder",
  },
  {
    id: "assessment",
    label: "Evaluare",
    description: "Creează itemi, barem și materiale gata de folosit.",
    accent: "green",
    directPath: null,
    builderPath: "/assessment-builder",
  },
  {
    id: "presentation",
    label: "Prezentare",
    description: "Organizează conținutul într-un suport vizual.",
    accent: "indigo",
    directPath: null,
    builderPath: "/presentation-builder",
  },
] as const;

export const COPILOT_PROMPTS: readonly string[] = [
  "Vreau o evaluare la fracții",
  "Creează o fișă pentru clasa a III-a",
  "Transformă lecția într-un joc",
] as const;

export const STUDIO_BRAND = {
  name: "PRIMA",
  workspace: "Teacher Studio",
  workspaceRo: "Atelierul Profesorului",
} as const;
