import {
  BookOpen,
  BookTemplate,
  Brain,
  Home,
  Library,
  LineChart,
  MessageCircle,
  Settings,
  Sparkles,
} from "lucide-react";
import type {
  DeskNavItem,
  QuickAccessItem,
  TeachingInsight,
  TeachingTimelineItem,
} from "../types";

export const DESK_NAV: DeskNavItem[] = [
  { id: "atelier", label: "Atelier", href: "/", icon: Home },
  { id: "lessons", label: "Lecțiile mele", href: "/library", icon: BookOpen },
  { id: "create", label: "Creează", href: "/create/experience", icon: Sparkles },
  { id: "library", label: "Biblioteca", href: "/knowledge", icon: Library },
  { id: "prima", label: "PRIMA", href: "/#recomandari-prima", icon: Brain },
  { id: "growth", label: "Evoluția mea", href: "/reflection", icon: LineChart },
  { id: "settings", label: "Setări", href: "/settings", icon: Settings },
];

export const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
  {
    id: "library",
    title: "Biblioteca",
    description: "Lecții, fișe și resurse pentru clasă.",
    href: "/library",
    icon: Library,
  },
  {
    id: "templates",
    title: "Modele",
    description: "Pornește de la tipare didactice dovedite.",
    icon: BookTemplate,
    disabled: true,
  },
  {
    id: "ask_prima",
    title: "Întreabă PRIMA",
    description: "Vezi sugestia de azi pentru lecția la care lucrezi.",
    href: "#recomandari-prima",
    icon: MessageCircle,
  },
  {
    id: "settings",
    title: "Setări",
    description: "Preferințele tale personale.",
    href: "/settings",
    icon: Settings,
  },
];

export const TEACHING_INSIGHTS: readonly TeachingInsight[] = [
  {
    id: "assess-o3",
    category: "Evaluare",
    title: "Întărește dovezile de învățare",
    explanation:
      "Obiectivele tale sunt bine definite. Elevii ar mai avea nevoie de o ocazie scurtă să arate că au atins obiectivul O3.",
    whyItMatters:
      "O verificare formativă îmbunătățește alinierea didactică.",
    expectedImpact: "Elevii primesc feedback imediat.",
    impactLabel: "Feedback imediat",
    suggestedAction: "Verifică evaluarea",
  },
  {
    id: "differentiate",
    category: "Diferențiere",
    title: "Deschide o a doua cale pentru elevi",
    explanation:
      "Activitatea principală funcționează bine pentru majoritate. O variantă de sprijin ar ajuta elevii care au nevoie de mai mult timp.",
    whyItMatters:
      "Diferențierea păstrează ambiția clasei fără să lase pe nimeni în urmă.",
    expectedImpact: "Mai mulți elevi rămân angajați în sarcină.",
    impactLabel: "Implicare crescută",
    suggestedAction: "Adaugă o variantă de sprijin",
  },
  {
    id: "time-balance",
    category: "Calitatea planului",
    title: "Echilibrează timpul lecției",
    explanation:
      "Faza de practică pare densă față de deschidere. Un minut mutat la activarea cunoștințelor ar ajuta ritmul.",
    whyItMatters: "Un ritm echilibrat susține atenția pe toată durata orei.",
    expectedImpact: "Lecția respiră mai natural.",
    impactLabel: "Ritm mai bun",
    suggestedAction: "Ajustează secvența",
  },
];

export const TEACHING_TIMELINE: readonly TeachingTimelineItem[] = [
  {
    id: "tl-1",
    kind: "blueprint_approved",
    title: "Proiect de lecție actualizat",
    detail: "Ai rafinat obiectivele și evaluarea.",
    timestampLabel: "Ieri",
  },
  {
    id: "tl-2",
    kind: "worksheet_generated",
    title: "Fișă de lucru pregătită",
    detail: "Materialul e gata de revizie în atelier.",
    timestampLabel: "Acum 2 zile",
  },
];
