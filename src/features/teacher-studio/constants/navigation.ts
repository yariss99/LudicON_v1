import type { QuickAction, StudioNavItem } from "../types";

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

export const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    id: "create-lesson",
    label: "Lecție",
    description: "Planifică o lecție completă",
    href: "/create/experience?intent=lesson",
    intent: "lesson",
    shortcut: "N L",
  },
  {
    id: "create-worksheet",
    label: "Fișă",
    description: "Creează o fișă de lucru",
    href: "/create/experience?intent=worksheet",
    intent: "worksheet",
    shortcut: "N F",
  },
  {
    id: "create-assessment",
    label: "Evaluare",
    description: "Construiește o evaluare",
    href: "/create/experience?intent=assessment",
    intent: "assessment",
    shortcut: "N E",
  },
  {
    id: "create-story",
    label: "Poveste",
    description: "Scrie o poveste didactică",
    href: "/create/experience?intent=story",
    intent: "story",
  },
  {
    id: "create-presentation",
    label: "Prezentare",
    description: "Pregătește diapozitive",
    href: "/create/experience?intent=presentation",
    intent: "presentation",
  },
  {
    id: "create-game",
    label: "Joc",
    description: "Proiectează un joc educațional",
    href: "/create/experience?intent=game",
    intent: "game",
  },
  {
    id: "open-project",
    label: "Deschide proiect",
    description: "Continuă un proiect existent",
    href: "/projects",
    shortcut: "O",
  },
] as const;

export const STUDIO_BRAND = {
  name: "PRIMA",
  workspace: "Teacher Studio",
  workspaceRo: "Atelierul Profesorului",
} as const;
