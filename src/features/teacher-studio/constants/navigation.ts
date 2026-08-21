import {
  Activity,
  Bell,
  CalendarDays,
  ClipboardCheck,
  FileText,
  FolderKanban,
  Gamepad2,
  Home,
  Library,
  LineChart,
  NotebookPen,
  Presentation,
  ScrollText,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import type { CreateOption, StudioNavGroup } from "../types";

/**
 * Workspace navigation. Every `href` is a route that really exists; anything
 * without one is flagged `soon` and rendered as non-interactive.
 */
export const STUDIO_NAV_GROUPS: readonly StudioNavGroup[] = [
  {
    id: "main",
    label: "Principal",
    items: [
      { id: "home", label: "Acasă", icon: Home, href: "/", shortcut: "G H" },
      {
        id: "projects",
        label: "Proiectele mele",
        icon: FolderKanban,
        href: "/projects",
        shortcut: "G P",
      },
    ],
  },
  {
    id: "create",
    label: "Creație",
    items: [
      {
        id: "copilot",
        label: "Copilot",
        icon: Sparkles,
        href: "/assistant",
      },
      {
        id: "lessons",
        label: "Lecții",
        icon: NotebookPen,
        href: "/create?type=lesson",
      },
      { id: "worksheets", label: "Fișe de lucru", icon: FileText, soon: true },
      {
        id: "assessments",
        label: "Evaluări",
        icon: ClipboardCheck,
        href: "/create?type=assessment",
      },
      {
        id: "games",
        label: "Jocuri educative",
        icon: Gamepad2,
        href: "/create?type=game",
      },
      {
        id: "stories",
        label: "Povești",
        icon: ScrollText,
        href: "/create?type=story",
      },
      {
        id: "presentations",
        label: "Prezentări",
        icon: Presentation,
        href: "/create?type=presentation",
      },
      {
        id: "resources",
        label: "Resurse",
        icon: Library,
        href: "/library",
        shortcut: "G L",
      },
    ],
  },
  {
    id: "workspace",
    label: "Spațiul de lucru",
    items: [
      {
        id: "activity",
        label: "Activitate",
        icon: Activity,
        href: "/activity",
        shortcut: "G A",
      },
      {
        id: "calendar",
        label: "Calendar",
        icon: CalendarDays,
        href: "/calendar",
        shortcut: "G C",
      },
      {
        id: "notifications",
        label: "Notificări",
        icon: Bell,
        href: "/notifications",
        shortcut: "G N",
      },
      { id: "classroom", label: "Clasă", icon: Users, soon: true },
      { id: "analytics", label: "Analitică", icon: LineChart, soon: true },
    ],
  },
  {
    id: "system",
    label: "Sistem",
    items: [
      {
        id: "settings",
        label: "Setări",
        icon: Settings,
        href: "/settings",
        shortcut: "G S",
      },
    ],
  },
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
    description: "Pregătește activități pentru elevii tăi.",
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
    description: "Construiește o experiență narativă de învățare.",
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
    description: "Creează și ajustează evaluări pas cu pas.",
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
    description: "Organizează ideile într-un material vizual.",
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
