/** CE-003 — Planul lecției (teacher-facing labels) */
export const CANVAS_SECTIONS = [
  { id: "topic", label: "Temă" },
  { id: "subject", label: "Disciplină" },
  { id: "grade", label: "Clasă" },
  { id: "curriculum", label: "Curriculum" },
  { id: "general_competencies", label: "Competențe generale" },
  { id: "specific_competencies", label: "Competențe specifice" },
  { id: "learning_objectives", label: "Obiective de învățare" },
  { id: "learning_activities", label: "Activități de învățare" },
  { id: "assessment", label: "Evaluare" },
  { id: "resources", label: "Resurse" },
  { id: "differentiation", label: "Diferențiere" },
  { id: "accessibility", label: "Accesibilitate" },
  { id: "digital_integration", label: "Integrare digitală" },
  { id: "generated_assets", label: "Materiale pregătite" },
] as const;

export const CANVAS_STATE_LABEL = {
  unknown: "Încă necompletat",
  detected: "Identificat",
  in_progress: "În lucru",
  completed: "Completat",
  needs_review: "De revăzut",
} as const;

export const UNDERSTANDING_LABEL = {
  excellent: "Excelent",
  good: "Bine",
  needs_one_detail: "Mai lipsește un detaliu",
  needs_clarification: "Mai clarificăm un aspect",
} as const;

export const LEARNING_CANVAS_TITLE = "Planul lecției" as const;

export const LEARNING_CANVAS_EMPTY_HINT =
  "Deocamdată e aproape gol. Pe măsură ce scrii, planul lecției se umple natural." as const;

export const CANVAS_NEW_HIGHLIGHT_MS = 2200;

/** @deprecated Use CANVAS_SECTIONS */
export const LEARNING_CANVAS_FIELDS = [
  { id: "topic", label: "Temă" },
  { id: "subject", label: "Disciplină" },
  { id: "grade", label: "Clasă" },
  { id: "objectives", label: "Obiective" },
  { id: "activities", label: "Activități" },
  { id: "assessment", label: "Evaluare" },
  { id: "resources", label: "Resurse" },
] as const;
