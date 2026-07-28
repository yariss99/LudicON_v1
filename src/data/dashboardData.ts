import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Gamepad2,
  Layers,
  Presentation,
  FolderKanban,
  Activity,
  FileStack,
  Bot,
  Puzzle,
} from "lucide-react";
import { dashboardRo } from "../i18n";
import type {
  AISuggestion,
  DashboardStat,
  QuickAction,
  RecentProject,
  RecentResource,
} from "../types/dashboard";

const { builderTypes, time, resourceTypes, stats, recommendationTags } =
  dashboardRo;

/** Placeholder data for Phase 1 dashboard UI. Replace with API data in a later phase. */

export const builderActions: QuickAction[] = [
  {
    id: "lesson",
    title: builderTypes.lesson,
    description:
      "Proiectează o lecție completă, adaptată programei școlare.",
    icon: BookOpen,
    href: "/prima/lesson",
    iconClass: "bg-blue-600/[0.08] text-blue-600",
  },
  {
    id: "worksheet",
    title: builderTypes.worksheet,
    description:
      "Creează fișe personalizate pentru consolidare și evaluare.",
    icon: FileText,
    href: "/studio/create?type=worksheet",
    iconClass: "bg-indigo-600/[0.08] text-indigo-600",
  },
  {
    id: "game",
    title: builderTypes.game,
    description: "Transformă învățarea într-o experiență interactivă.",
    icon: Gamepad2,
    href: "/studio/create?type=game",
    iconClass: "bg-sky-600/[0.08] text-sky-700",
  },
  {
    id: "assessment",
    title: builderTypes.assessment,
    description:
      "Elaborează teste și instrumente de evaluare formative sau sumative.",
    icon: ClipboardCheck,
    href: "/studio/create?type=assessment",
    iconClass: "bg-indigo-600/[0.08] text-indigo-700",
  },
  {
    id: "story",
    title: builderTypes.story,
    description:
      "Construiește povești care dezvoltă imaginația și competențele elevilor.",
    icon: Layers,
    href: "/studio/create?type=story",
    iconClass: "bg-violet-600/[0.08] text-violet-600",
  },
  {
    id: "presentation",
    title: builderTypes.presentation,
    description:
      "Realizează prezentări moderne pentru activitățile didactice.",
    icon: Presentation,
    href: "/studio/create?type=presentation",
    iconClass: "bg-sky-600/[0.08] text-sky-600",
  },
  {
    id: "escape",
    title: builderTypes.mission,
    description:
      "Proiectează provocări interactive inspirate din mecanica Escape Room.",
    icon: Puzzle,
    href: "/studio/create?type=escape",
    iconClass: "bg-purple-600/[0.08] text-purple-600",
  },
];

/** @deprecated Use builderActions */
export const quickActions = builderActions;

export const recentProjects: RecentProject[] = [
  {
    id: "1",
    title: "Quiz Aventura Fracțiilor",
    type: builderTypes.game,
    progress: 72,
    updatedAt: time.twoHoursAgo,
    href: "/projects",
  },
  {
    id: "2",
    title: "Plan de lecție Fotosinteza",
    type: builderTypes.lesson,
    progress: 45,
    updatedAt: time.yesterday,
    href: "/projects",
  },
  {
    id: "3",
    title: "Fișă Gramatică Română",
    type: builderTypes.worksheet,
    progress: 90,
    updatedAt: time.threeDaysAgo,
    href: "/projects",
  },
];

export const primaRecommendations: AISuggestion[] = [
  {
    id: "1",
    title: "Îmbunătățește implicarea",
    description:
      "Lecțiile recente se concentrează pe vocabular. Un joc de memorie sau un quiz interactiv poate crește participarea și retenția.",
    tag: recommendationTags.engagement,
    href: "/studio/studio/create?type=game",
  },
  {
    id: "2",
    title: "Diferențiere pentru elevii cu dificultăți",
    description:
      "Adaugă exerciții scaffolded și instrucțiuni simplificate. PRIMA poate adapta activitatea pentru clase cu nivele mixte.",
    tag: recommendationTags.differentiation,
    href: "/create?intent=lesson",
  },
  {
    id: "3",
    title: "Creează o fișă de lucru printabilă",
    description:
      "Transformă ultima lecție într-o fișă gata de printat, cu barem — ideală pentru temă sau recapitulare.",
    tag: recommendationTags.resource,
    href: "/studio/studio/create?type=worksheet",
  },
];

/** @deprecated Use primaRecommendations */
export const aiSuggestions = primaRecommendations;

export const recentResources: RecentResource[] = [
  {
    id: "1",
    title: "Fișe Sistemul Solar",
    type: resourceTypes.flashcards,
    format: "PDF",
    updatedAt: time.today,
    href: "/library",
  },
  {
    id: "2",
    title: "Prezentare Ciclul apei",
    type: resourceTypes.presentation,
    format: "PPTX",
    updatedAt: time.yesterday,
    href: "/library",
  },
  {
    id: "3",
    title: "Fișă Înmulțire",
    type: resourceTypes.worksheet,
    format: "PDF",
    updatedAt: time.twoDaysAgo,
    href: "/library",
  },
  {
    id: "4",
    title: "Misiune Roma Antică",
    type: resourceTypes.escapeRoom,
    format: "Interactiv",
    updatedAt: time.lastWeek,
    href: "/library",
  },
];

export const dashboardStats: DashboardStat[] = [
  {
    id: "projects",
    label: stats.projects,
    value: 12,
    icon: FolderKanban,
    trend: stats.trendProjects,
  },
  {
    id: "activities",
    label: stats.activities,
    value: 28,
    icon: Activity,
    trend: stats.trendActivities,
  },
  {
    id: "resources",
    label: stats.resources,
    value: 46,
    icon: FileStack,
    trend: stats.trendResources,
  },
  {
    id: "ai-generations",
    label: stats.aiGenerations,
    value: 34,
    icon: Bot,
    trend: stats.trendAiGenerations,
  },
];
