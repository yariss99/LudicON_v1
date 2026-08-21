import type {
  AssessmentAiActionId,
  AssessmentKind,
  AssessmentSectionId,
  BloomLevel,
  DifficultyLevel,
  QuestionType,
  ScoringMode,
} from "./types";

export const ASSESSMENT_KINDS: readonly {
  id: AssessmentKind;
  label: string;
}[] = [
  { id: "initial", label: "Evaluare inițială" },
  { id: "formative", label: "Evaluare formativă" },
  { id: "summative", label: "Evaluare sumativă" },
  { id: "diagnostic", label: "Evaluare diagnostică" },
  { id: "competency", label: "Evaluare pe competențe" },
  { id: "practical", label: "Evaluare practică" },
  { id: "observation_grid", label: "Grilă de observație" },
  { id: "rubric", label: "Rubrică" },
  { id: "portfolio", label: "Portofoliu" },
  { id: "self", label: "Auto-evaluare" },
  { id: "peer", label: "Evaluare între elevi" },
] as const;

export const QUESTION_TYPES: readonly {
  id: QuestionType;
  label: string;
  autoScore: boolean;
}[] = [
  { id: "multiple_choice", label: "Alegere multiplă", autoScore: true },
  { id: "short_answer", label: "Răspuns scurt", autoScore: false },
  { id: "long_answer", label: "Răspuns lung", autoScore: false },
  { id: "fill_blank", label: "Completare", autoScore: true },
  { id: "matching", label: "Potrivire", autoScore: true },
  { id: "ordering", label: "Ordonare", autoScore: true },
  { id: "classification", label: "Clasificare", autoScore: true },
  { id: "calculation", label: "Calcul", autoScore: true },
  { id: "creative_writing", label: "Scriere creativă", autoScore: false },
  { id: "drawing", label: "Desen", autoScore: false },
  { id: "observation", label: "Observare", autoScore: false },
  { id: "project_task", label: "Sarcină de proiect", autoScore: false },
] as const;

export const BLOOM_LEVELS: readonly { id: BloomLevel; label: string }[] = [
  { id: "remember", label: "Memorare" },
  { id: "understand", label: "Înțelegere" },
  { id: "apply", label: "Aplicare" },
  { id: "analyze", label: "Analiză" },
  { id: "evaluate", label: "Evaluare" },
  { id: "create", label: "Creare" },
] as const;

export const DIFFICULTIES: readonly { id: DifficultyLevel; label: string }[] = [
  { id: "easy", label: "Ușor" },
  { id: "medium", label: "Mediu" },
  { id: "hard", label: "Greu" },
] as const;

export const SCORING_MODES: readonly { id: ScoringMode; label: string }[] = [
  { id: "automatic", label: "Automat" },
  { id: "manual", label: "Manual" },
  { id: "rubric", label: "Rubrică" },
  { id: "weighted", label: "Ponderat" },
  { id: "competency", label: "Pe competențe" },
  { id: "custom", label: "Model personalizat" },
] as const;

export const ASSESSMENT_SECTIONS: readonly {
  id: AssessmentSectionId;
  label: string;
}[] = [
  { id: "general", label: "Informații generale" },
  { id: "objectives", label: "Obiective" },
  { id: "competencies", label: "Competențe" },
  { id: "criteria", label: "Criterii de evaluare" },
  { id: "questions", label: "Grupuri de itemi" },
  { id: "scoring", label: "Punctaj" },
  { id: "rubrics", label: "Rubrici" },
  { id: "answer_key", label: "Bareme" },
  { id: "notes", label: "Note profesor" },
  { id: "metadata", label: "Metadate" },
  { id: "analytics", label: "Analitică" },
  { id: "export", label: "Export" },
] as const;

/**
 * Reading order for the section nav. Every id in ASSESSMENT_SECTIONS appears
 * exactly once — grouping is presentation only, the sections themselves are
 * unchanged.
 */
export const ASSESSMENT_SECTION_GROUPS: readonly {
  id: string;
  label: string;
  sectionIds: readonly AssessmentSectionId[];
}[] = [
  {
    id: "about",
    label: "Despre evaluare",
    sectionIds: ["general", "objectives", "competencies", "criteria"],
  },
  {
    id: "content",
    label: "Conținutul evaluării",
    sectionIds: ["questions", "answer_key"],
  },
  { id: "grading", label: "Notare", sectionIds: ["scoring", "rubrics"] },
  {
    id: "finish",
    label: "Finalizare",
    sectionIds: ["notes", "metadata", "analytics", "export"],
  },
] as const;

export const AI_ACTIONS: readonly {
  id: AssessmentAiActionId;
  label: string;
  description: string;
}[] = [
  {
    id: "generate_complete",
    label: "Generează evaluarea completă",
    description: "Structură + itemi aliniați la lecție și proiect.",
  },
  {
    id: "generate_bank",
    label: "Generează bancă de itemi",
    description: "Adaugă itemi în banca reutilizabilă.",
  },
  {
    id: "generate_variants",
    label: "Generează variante",
    description: "Creează variante alternative pentru itemii existenți.",
  },
  {
    id: "adjust_difficulty",
    label: "Ajustează dificultatea",
    description: "Reechilibrează easy / medium / hard.",
  },
  {
    id: "generate_rubrics",
    label: "Generează rubrici",
    description: "Criterii și niveluri de performanță.",
  },
  {
    id: "generate_answer_keys",
    label: "Generează bareme",
    description: "Completează cheile de răspuns.",
  },
  {
    id: "generate_feedback",
    label: "Generează feedback",
    description: "Feedback pentru răspunsuri corecte/incorecte.",
  },
  {
    id: "competency_mapping",
    label: "Mapare pe competențe",
    description: "Leagă itemii de competențele lecției.",
  },
  {
    id: "detect_duplicates",
    label: "Detectează itemi repetați",
    description: "Semnalează prompturi foarte similare.",
  },
  {
    id: "suggest_improvements",
    label: "Sugerează îmbunătățiri",
    description: "Recomandări de calitate didactică.",
  },
] as const;

/** Groups the existing AI actions by what the teacher is trying to achieve. */
export const AI_ACTION_GROUPS: readonly {
  id: string;
  label: string;
  actionIds: readonly AssessmentAiActionId[];
}[] = [
  {
    id: "create",
    label: "Creează conținut",
    actionIds: ["generate_complete", "generate_bank", "generate_variants"],
  },
  {
    id: "refine",
    label: "Îmbunătățește",
    actionIds: [
      "adjust_difficulty",
      "detect_duplicates",
      "suggest_improvements",
    ],
  },
  {
    id: "grading",
    label: "Notare și feedback",
    actionIds: [
      "generate_rubrics",
      "generate_answer_keys",
      "generate_feedback",
      "competency_mapping",
    ],
  },
] as const;

export const AUTOSAVE_DELAY_MS = 900;
