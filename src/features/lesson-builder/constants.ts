import type {
  LessonAiActionId,
  LessonBlockKind,
  LessonPhaseId,
  LessonSectionId,
} from "./types";

export const LESSON_PHASES: readonly {
  id: LessonPhaseId;
  label: string;
  defaultMinutes: number;
}[] = [
  { id: "introduction", label: "Introducere", defaultMinutes: 3 },
  { id: "motivation", label: "Motivație", defaultMinutes: 5 },
  { id: "knowledge_construction", label: "Construcție", defaultMinutes: 12 },
  { id: "practice", label: "Practică", defaultMinutes: 12 },
  { id: "assessment", label: "Evaluare", defaultMinutes: 5 },
  { id: "reflection", label: "Reflecție", defaultMinutes: 4 },
  { id: "closure", label: "Încheiere", defaultMinutes: 4 },
] as const;

export const LESSON_SECTIONS: readonly {
  id: LessonSectionId;
  label: string;
}[] = [
  { id: "general", label: "Informații generale" },
  { id: "objectives", label: "Obiective" },
  { id: "competencies", label: "Competențe" },
  { id: "prerequisites", label: "Cunoștințe anterioare" },
  { id: "resources", label: "Resurse" },
  { id: "phases", label: "Faze" },
  { id: "activities", label: "Activități / Blocuri" },
  { id: "differentiation", label: "Diferențiere" },
  { id: "assessment", label: "Evaluare" },
  { id: "homework", label: "Temă" },
  { id: "reflection", label: "Reflecție" },
  { id: "notes", label: "Note profesor" },
] as const;

export const BLOCK_KINDS: readonly {
  id: LessonBlockKind;
  label: string;
}[] = [
  { id: "text", label: "Text" },
  { id: "activity", label: "Activitate" },
  { id: "resource", label: "Resursă" },
  { id: "assessment", label: "Evaluare" },
  { id: "note", label: "Notă" },
  { id: "prompt", label: "Prompt AI" },
] as const;

export const AI_ACTIONS: readonly {
  id: LessonAiActionId;
  label: string;
  description: string;
}[] = [
  {
    id: "generate_complete",
    label: "Generează lecția completă",
    description: "Schiță didactică pe toate fazele, în contextul proiectului.",
  },
  {
    id: "generate_section",
    label: "Generează secțiunea activă",
    description: "Completează doar secțiunea selectată.",
  },
  {
    id: "improve",
    label: "Îmbunătățește lecția",
    description: "Claritate, ritm și aliniere la obiective.",
  },
  {
    id: "differentiate",
    label: "Diferențiază activitățile",
    description: "Variante pentru ritmuri diferite de învățare.",
  },
  {
    id: "adapt_difficulty",
    label: "Adaptează dificultatea",
    description: "Ajustează cerințele fără a pierde obiectivele.",
  },
  {
    id: "suggest_resources",
    label: "Sugerează resurse",
    description: "Materiale și suporturi pentru oră.",
  },
  {
    id: "suggest_assessment",
    label: "Sugerează evaluare",
    description: "Verificare formativă aliniată.",
  },
  {
    id: "suggest_homework",
    label: "Sugerează temă",
    description: "Temă scurtă, fezabilă acasă.",
  },
  {
    id: "generate_reflection",
    label: "Întrebări de reflecție",
    description: "Întrebări pentru elevi și profesor.",
  },
] as const;

export const REUSABLE_BLOCK_TEMPLATES: readonly {
  kind: LessonBlockKind;
  title: string;
  content: string;
  phaseId?: LessonPhaseId;
}[] = [
  {
    kind: "activity",
    title: "Activare cunoștințe",
    content: "Întrebare-cheie + brainstorming 2 minute.",
    phaseId: "introduction",
  },
  {
    kind: "activity",
    title: "Lucru în perechi",
    content: "Elevii rezolvă un item, apoi compară soluțiile.",
    phaseId: "practice",
  },
  {
    kind: "assessment",
    title: "Exit ticket",
    content: "Un item scurt înainte de încheiere.",
    phaseId: "assessment",
  },
  {
    kind: "note",
    title: "Notă de diferențiere",
    content: "Suport vizual pentru elevii care au nevoie de schelă.",
  },
];

export const AUTOSAVE_DELAY_MS = 900;
