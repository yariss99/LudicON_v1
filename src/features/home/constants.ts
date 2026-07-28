import {
  Archive,
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderKanban,
  Gamepad2,
  Mail,
  Presentation,
  ScrollText,
  Star,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StudioSuggestionId } from "../../types/studio";

export const HOME_PROMPT_EXAMPLES = [
  "What would you like to create today?",
  "A Mathematics lesson about fractions for Grade 3.",
  "A differentiated worksheet for tomorrow.",
  "Help me finish the assessment for Class III A.",
  "A short parent newsletter for this week.",
] as const;

export type DeskSpaceId =
  | "class-3a"
  | "class-3b"
  | "projects"
  | "favorites"
  | "archive";

export type DeskSpace = {
  id: DeskSpaceId;
  label: string;
  icon: LucideIcon;
  kind: "class" | "collection";
};

export const DESK_SPACES: DeskSpace[] = [
  { id: "class-3a", label: "Class III A", icon: Users, kind: "class" },
  { id: "class-3b", label: "Class III B", icon: Users, kind: "class" },
  { id: "projects", label: "Lecțiile mele", icon: FolderKanban, kind: "collection" },
  { id: "favorites", label: "Favorites", icon: Star, kind: "collection" },
  { id: "archive", label: "Archive", icon: Archive, kind: "collection" },
];

export type QuickCreateItem = {
  id: StudioSuggestionId;
  label: string;
  prompt: string;
  icon: LucideIcon;
};

export const QUICK_CREATE_ITEMS: QuickCreateItem[] = [
  {
    id: "lesson",
    label: "Lesson",
    prompt: "Create a clear, engaging lesson for my next class.",
    icon: BookOpen,
  },
  {
    id: "worksheet",
    label: "Worksheet",
    prompt: "Create a differentiated worksheet with practice and challenge tasks.",
    icon: FileText,
  },
  {
    id: "presentation",
    label: "Presentation",
    prompt: "Design a presentation that supports tomorrow's lesson.",
    icon: Presentation,
  },
  {
    id: "assessment",
    label: "Assessment",
    prompt: "Create a formative assessment aligned to learning objectives.",
    icon: ClipboardCheck,
  },
  {
    id: "game",
    label: "Game",
    prompt: "Design an educational game that reinforces key concepts.",
    icon: Gamepad2,
  },
  {
    id: "story",
    label: "Story",
    prompt: "Create an educational story that introduces a new concept.",
    icon: ScrollText,
  },
  {
    id: "parent",
    label: "Newsletter",
    prompt: "Create a warm parent newsletter about this week's learning.",
    icon: Mail,
  },
];

export type ScheduleItem = {
  id: string;
  time: string;
  subject: string;
  note?: string;
};

export const TODAY_SCHEDULE: ScheduleItem[] = [
  {
    id: "math",
    time: "08:00",
    subject: "Mathematics",
    note: "Fractions — intro",
  },
  {
    id: "science",
    time: "10:00",
    subject: "Science",
    note: "Plant life",
  },
  {
    id: "pd",
    time: "12:00",
    subject: "Personal Development",
  },
];

export type CoachSuggestion = {
  id: string;
  title: string;
  detail: string;
  prompt?: string;
  href?: string;
  action?: "continue";
};

export function buildCoachSuggestions(
  continueTitle?: string,
): CoachSuggestion[] {
  return [
    {
      id: "continue",
      title: "Continue yesterday's lesson",
      detail: continueTitle
        ? `Resume “${continueTitle}”.`
        : "Pick up your most recent learning experience.",
      action: "continue",
    },
    {
      id: "timeline",
      title: "Open your year timeline",
      detail: "Jump to any week — navigate time, don't search folders.",
      href: "/timeline",
    },
    {
      id: "classroom",
      title: "See what your teaching taught you",
      detail: "Class insights and experience memory — never student profiles.",
      href: "/classroom",
    },
    {
      id: "dna",
      title: "Open your Pedagogical DNA",
      detail: "Your teaching style, remembered — never scored or ranked.",
      href: "/dna",
    },
    {
      id: "assessment",
      title: "Creează o evaluare",
      detail: "Verifică înțelegerea după Matematică de azi.",
      prompt: "Creează o evaluare formativă la Matematică, clasa a III-a, despre fracții.",
    },
    {
      id: "differentiate",
      title: "Diferențiază fișa",
      detail: "Sprijină fiecare elev din clasa a III-a A.",
      prompt: "Diferențiază o fișă pentru elevi cu ritmuri diferite, clasa a III-a A.",
    },
    {
      id: "presentation",
      title: "Creează o prezentare",
      detail: "Suport vizual pentru lecția de Științe.",
      prompt: "Creează o prezentare scurtă pentru o lecție de Științe despre plante.",
    },
    {
      id: "objectives",
      title: "Îmbunătățește obiectivele",
      detail: "Fă obiectivele mai clare și observabile.",
      prompt: "Îmbunătățește obiectivele de învățare pentru lecția mea actuală.",
    },
    {
      id: "formative",
      title: "Adaugă evaluare formativă",
      detail: "Verificări scurte pe parcursul lecției.",
      prompt: "Adaugă momente de evaluare formativă în lecția mea actuală.",
    },
  ];
}
