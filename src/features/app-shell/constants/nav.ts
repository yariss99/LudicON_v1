import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  BookOpen,
  FileText,
  ClipboardCheck,
  Gamepad2,
  BookMarked,
  Presentation,
  Library,
  School,
  Blocks,
  BarChart3,
  Settings,
} from "lucide-react";

export type AppNavItem = {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
};

export const APP_NAV: readonly AppNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { id: "projects", label: "Projects", href: "/projects", icon: FolderKanban },
  {
    id: "assistant",
    label: "Copilot",
    href: "/assistant",
    icon: Sparkles,
  },
  {
    id: "lesson-builder",
    label: "Lesson Studio",
    href: "/builders/lesson",
    icon: BookOpen,
  },
  {
    id: "worksheet-builder",
    label: "Worksheet Builder",
    href: "/builders/worksheet",
    icon: FileText,
  },
  {
    id: "assessment-builder",
    label: "Assessment Builder",
    href: "/builders/assessment",
    icon: ClipboardCheck,
  },
  {
    id: "game-builder",
    label: "Game Builder",
    href: "/builders/game",
    icon: Gamepad2,
  },
  {
    id: "story-builder",
    label: "Story Builder",
    href: "/builders/story",
    icon: BookMarked,
  },
  {
    id: "presentation-builder",
    label: "Presentation Builder",
    href: "/builders/presentation",
    icon: Presentation,
  },
  {
    id: "resources",
    label: "Resource Studio",
    href: "/resources",
    icon: Library,
  },
  {
    id: "classroom",
    label: "Classroom Studio",
    href: "/builders/classroom",
    icon: School,
  },
  {
    id: "block-editor",
    label: "Block Editor",
    href: "/block-editor",
    icon: Blocks,
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
] as const;

export const APP_BRAND = {
  name: "P.R.R.I.M.A. ON",
  short: "PRIMA",
} as const;
