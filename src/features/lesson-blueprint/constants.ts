import type { PlannedMaterialId } from "../blueprint-review/types";

export const LESSON_BLUEPRINT_TITLE = "Proiectul lecției";
export const LESSON_BLUEPRINT_SUBTITLE =
  "Revizuiește, completează și personalizează lecția înainte de a crea materialele didactice.";

export const AUTO_SAVE_SAVED = "✓ Toate modificările sunt salvate.";
export const AUTO_SAVE_SYNCING = "Se salvează...";
export const AUTO_SAVE_HEADER = "✓ Salvat automat";

export const EMPTY_SECTION_HINT =
  "Poți completa această secțiune acum sau mai târziu.";

export const SECTION_NEED_INFO =
  "Mai avem nevoie de câteva informații pentru această secțiune.";

export const DEFAULT_ACTIVITY_TITLES = [
  "Captarea atenției",
  "Reactualizarea cunoștințelor",
  "Explorare",
  "Activitate practică",
  "Consolidare",
  "Evaluare",
  "Reflecție",
] as const;

export const LESSON_TYPE_OPTIONS = [
  "Lecție de predare",
  "Lecție de consolidare",
  "Lecție mixtă",
  "Lecție de evaluare",
  "Lecție de recapitulare",
] as const;

export const PLANNED_MATERIAL_OPTIONS: Array<{
  id: PlannedMaterialId;
  label: string;
}> = [
  { id: "worksheet", label: "Fișă de lucru" },
  { id: "presentation", label: "Prezentare" },
  { id: "educational_game", label: "Joc educațional" },
  { id: "assessment", label: "Evaluare" },
  { id: "rubric", label: "Rubrică" },
  { id: "differentiated_plan", label: "Plan diferențiat" },
  { id: "remedial_sheet", label: "Fișă remedială" },
  { id: "homework_sheet", label: "Fișă pentru acasă" },
];

export const MATERIAL_ESTIMATE_MINUTES: Record<PlannedMaterialId, number> = {
  worksheet: 3,
  presentation: 4,
  educational_game: 5,
  assessment: 3,
  rubric: 2,
  differentiated_plan: 4,
  remedial_sheet: 3,
  homework_sheet: 2,
};

export const DEFAULT_PLANNED_MATERIALS: PlannedMaterialId[] = [
  "worksheet",
  "presentation",
  "assessment",
];
