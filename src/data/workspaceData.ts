import {
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Gamepad2,
  Library,
  Sparkles,
} from "lucide-react";
import type {
  HomeActivity,
  IntentionAction,
} from "../types/project";
import type { AISuggestion } from "../types/dashboard";
import { SEED_PROJECTS } from "./seedProjects";

export const teacherProfile = {
  firstName: "Octavian",
  fullName: "Octavian Popescu",
  role: "Profesor",
  initials: "OP",
};

export const homeIntentions: IntentionAction[] = [
  {
    id: "lesson",
    title: "Creează o lecție",
    description: "Proiectează o experiență de învățare completă.",
    icon: BookOpen,
    href: "/create?intent=lesson",
    iconClass: "bg-blue-600/[0.08] text-blue-600",
  },
  {
    id: "worksheet",
    title: "Creează o fișă",
    description: "Exerciții aliniate obiectivelor tale.",
    icon: FileText,
    href: "/create?intent=worksheet",
    iconClass: "bg-sky-600/[0.08] text-sky-700",
  },
  {
    id: "assessment",
    title: "Creează o evaluare",
    description: "Verifică învățarea cu criterii clare.",
    icon: ClipboardCheck,
    href: "/create?intent=assessment",
    iconClass: "bg-indigo-600/[0.08] text-indigo-700",
  },
  {
    id: "game",
    title: "Creează un joc",
    description: "Învățare prin joacă, cu obiectiv pedagogic.",
    icon: Gamepad2,
    href: "/create?intent=game",
    iconClass: "bg-teal-600/[0.08] text-teal-700",
  },
  {
    id: "continue",
    title: "Continuă lecția",
    description: "Return exactly where you left off.",
    icon: FolderOpen,
    href: "/",
    iconClass: "bg-slate-600/[0.08] text-slate-700",
  },
  {
    id: "library",
    title: "Deschide biblioteca",
    description: "Refolosește ce ai creat deja.",
    icon: Library,
    href: "/library",
    iconClass: "bg-amber-600/[0.08] text-amber-700",
  },
];

/** @deprecated Prefer useProjects() — kept for non-reactive seed consumers */
export const projects = SEED_PROJECTS;

export const homeAiSuggestions: AISuggestion[] = [
  {
    id: "1",
    title: "Finalizează planul pentru Fotosinteză",
    description:
      "Planul pedagogic e aproape gata. Revizuiește obiectivele și aprobă-l ca să poți genera lecția.",
    tag: "Continuă",
    href: "/projects/prj_photosynthesis",
  },
  {
    id: "2",
    title: "Adaugă o fișă la Fracții",
    description:
      "Ai deja lecția. O fișă de consolidare ar completa pachetul pentru mâine.",
    tag: "Sugestie",
    href: "/create?intent=worksheet&project=prj_fractions",
  },
  {
    id: "3",
    title: "Refolosește gramatica de săptămâna trecută",
    description:
      "Poți adapta fișa de substantive pentru o nouă clasă în câteva minute.",
    tag: "Reutilizare",
    href: "/library",
  },
];

export const recentActivity: HomeActivity[] = [
  {
    id: "1",
    title: "Ai editat lecția despre Fracții",
    detail: "Material actualizat în lecție",
    time: "acum 2 ore",
  },
  {
    id: "2",
    title: "PRIMA a propus proiectul lecției despre Fotosinteză",
    detail: "Așteaptă verificarea ta",
    time: "ieri",
  },
  {
    id: "3",
    title: "Ai exportat fișa de gramatică",
    detail: "PDF salvat în Bibliotecă",
    time: "acum 3 zile",
  },
];

export const createIntentions = [
  {
    id: "lesson",
    prompt: "Vreau să pregătesc lecția de mâine.",
    helper: "PRIMA te ajută să structurezi obiectivele, activitățile și evaluarea.",
    href: "/prima/lesson",
    icon: BookOpen,
  },
  {
    id: "assessment",
    prompt: "Am nevoie de o evaluare.",
    helper: "Pornești de la intenție — planul pedagogic vine înainte de itemi.",
    href: "/studio/create?type=assessment",
    icon: ClipboardCheck,
  },
  {
    id: "improve",
    prompt: "Vreau să îmbunătățesc o fișă existentă.",
    helper: "Alege din Bibliotecă sau din lecțiile tale — fără să o iei de la capăt.",
    href: "/library",
    icon: FileText,
  },
  {
    id: "game",
    prompt: "Am nevoie de un joc educațional.",
    helper: "Obiectivul de învățare rămâne în centru — joaca urmează designul.",
    href: "/studio/create?type=game",
    icon: Gamepad2,
  },
];

export const createExamples = [
  "Pregătesc o lecție despre fracții pentru clasa a III-a.",
  "Am nevoie de o fișă de consolidare la științe.",
  "Vreau o evaluare formativă după lecția de ieri.",
  "Îmbunătățesc jocul de vocabular din biblioteca mea.",
];

export { Sparkles };
