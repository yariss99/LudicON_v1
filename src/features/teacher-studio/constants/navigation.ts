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
    hint: "Pregătim spațiul în care vei construi lecția.",
    builderPath: "/lesson-builder",
    altPath: "/create/experience",
    altLabel: "Preferi să pornești dintr-o conversație cu PRIMA?",
    actionLabel: "Începe lecția",
    color: "blue",
    icon: "book",
  },
  {
    id: "worksheet",
    label: "Fișă de lucru",
    description: "Creează materiale gata pentru clasă.",
    hint: "Va veni în curând în atelier.",
    builderPath: null,
    altPath: null,
    altLabel: null,
    actionLabel: "Începe fișa",
    color: "teal",
    icon: "pen",
  },
  {
    id: "game",
    label: "Joc educativ",
    description: "Transformă exersarea într-o provocare.",
    hint: "Alege punctul de plecare pentru jocul tău.",
    builderPath: "/game-builder",
    altPath: null,
    altLabel: null,
    actionLabel: "Începe jocul",
    color: "amber",
    icon: "lightbulb",
  },
  {
    id: "story",
    label: "Poveste",
    description: "Construiește un parcurs de învățare prin poveste.",
    hint: "Pornim cu ideea ta, apoi construiești povestea.",
    builderPath: "/story-builder",
    altPath: null,
    altLabel: null,
    actionLabel: "Începe povestea",
    color: "rose",
    icon: "palette",
  },
  {
    id: "assessment",
    label: "Evaluare",
    description: "Creează itemi, barem și materiale gata de folosit.",
    hint: "Pregătim spațiul în care vei construi evaluarea.",
    builderPath: "/assessment-builder",
    altPath: null,
    altLabel: null,
    actionLabel: "Începe evaluarea",
    color: "emerald",
    icon: "pen",
  },
  {
    id: "presentation",
    label: "Prezentare",
    description: "Organizează conținutul într-un suport vizual.",
    hint: "Pregătim suportul pe care îl vei completa.",
    builderPath: "/presentation-builder",
    altPath: null,
    altLabel: null,
    actionLabel: "Începe prezentarea",
    color: "indigo",
    icon: "globe",
  },
] as const;

/** Quick Create lives on `/create`; the type arrives as `?type=`. */
export const QUICK_CREATE_PATH = "/create";

export const COPILOT_PROMPTS: readonly string[] = [
  "Vreau o evaluare la fracții",
  "Creează o fișă pentru clasa a III-a",
  "Transformă lecția într-un joc",
] as const;

/** LudicON is the platform; PRIMA is the pedagogical copilot inside it. */
export const STUDIO_BRAND = {
  name: "LudicON",
  workspace: "Teacher Studio",
  workspaceRo: "Atelierul Profesorului",
} as const;
