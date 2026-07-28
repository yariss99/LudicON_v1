import type {
  AssetTypeDefinition,
  AssetTypeId,
  PipelineStage,
} from "./types";

export const GENERATION_STORAGE_KEY = "prima.generation.workspace.v1";

export const PIPELINE_STAGES: PipelineStage[] = [
  "queued",
  "preparing",
  "generating",
  "reviewing",
  "completed",
  "available",
];

export const PIPELINE_STAGE_LABEL: Record<PipelineStage, string> = {
  queued: "În așteptare",
  preparing: "Pregătim proiectul lecției…",
  generating: "Pregătim materialele didactice…",
  reviewing: "Verificăm împreună…",
  completed: "Gata",
  available: "Disponibil",
};

export const ASSET_STATUS_LABEL = {
  not_generated: "Neînceput",
  queued: "În așteptare",
  generating: "Se pregătesc…",
  completed: "Pregătit",
  needs_update: "De actualizat",
  failed: "Reîncercăm împreună",
} as const;

/** Catalog — future assets append here and appear automatically */
export const ASSET_CATALOG: AssetTypeDefinition[] = [
  {
    id: "lesson_plan",
    title: "Plan de lecție",
    description: "Plan structurat pe parcursul și activitățile lecției.",
    icon: "book",
    sourceSections: ["learning_context", "objectives", "learning_flow", "activities"],
    dependencies: [],
  },
  {
    id: "worksheet",
    title: "Fișă de lucru",
    description: "Exerciții pentru elevi, aliniate obiectivelor.",
    icon: "file",
    sourceSections: ["objectives", "activities", "assessment"],
    dependencies: [{ assetTypeId: "lesson_plan", reason: "Urmează activitățile lecției" }],
  },
  {
    id: "assessment",
    title: "Evaluare",
    description: "Verifică învățarea față de obiective.",
    icon: "check",
    sourceSections: ["objectives", "assessment"],
    dependencies: [],
  },
  {
    id: "presentation",
    title: "Prezentare",
    description: "Diapozitive pe fazele parcursului lecției.",
    icon: "presentation",
    sourceSections: ["learning_flow", "activities", "resources"],
    dependencies: [{ assetTypeId: "lesson_plan", reason: "Urmează fazele lecției" }],
  },
  {
    id: "educational_game",
    title: "Joc didactic",
    description: "Exersare prin joc, legată de temă și obiective.",
    icon: "game",
    sourceSections: ["objectives", "activities", "differentiation"],
    dependencies: [],
  },
  {
    id: "story",
    title: "Poveste",
    description: "Poveste de captare legată de contextul lecției.",
    icon: "story",
    sourceSections: ["learning_context", "objectives"],
    dependencies: [],
  },
  {
    id: "visual_resources",
    title: "Resurse vizuale",
    description: "Suporturi vizuale pentru activități.",
    icon: "image",
    sourceSections: ["resources", "activities"],
    dependencies: [],
  },
  {
    id: "homework",
    title: "Temă pentru acasă",
    description: "Exersare acasă, ca urmare a activităților din clasă.",
    icon: "home",
    sourceSections: ["objectives", "activities", "assessment"],
    dependencies: [{ assetTypeId: "worksheet", reason: "Continuă exersarea" }],
  },
  {
    id: "rubric",
    title: "Grilă de evaluare",
    description: "Criterii legate de obiective și evaluare.",
    icon: "rubric",
    sourceSections: ["objectives", "assessment"],
    dependencies: [{ assetTypeId: "assessment", reason: "Evaluează aceleași rezultate" }],
  },
  {
    id: "observation_sheet",
    title: "Fișă de observație",
    description: "Indicii de observație pentru tine, în timpul lecției.",
    icon: "eye",
    sourceSections: ["activities", "assessment", "reflection"],
    dependencies: [],
  },
  {
    id: "parent_communication",
    title: "Mesaj pentru părinți",
    description: "Notă scurtă pentru familie despre lecție.",
    icon: "mail",
    sourceSections: ["learning_context", "objectives"],
    dependencies: [],
  },
  {
    id: "classroom_activities",
    title: "Activități de clasă",
    description: "Carduri de activitate, inclusiv diferențiere.",
    icon: "users",
    sourceSections: ["activities", "differentiation", "learning_flow"],
    dependencies: [{ assetTypeId: "lesson_plan", reason: "Se potrivesc timpului lecției" }],
  },
  {
    id: "teacher_notes",
    title: "Note pentru profesor",
    description: "Note de implementare și semnale pedagogice.",
    icon: "notes",
    sourceSections: ["learning_context", "differentiation", "reflection"],
    dependencies: [],
  },
];

export const ASSET_TYPE_IDS: AssetTypeId[] = ASSET_CATALOG.map((a) => a.id);

/** Stage dwell used for live UX (ms). Tests may inject 0. */
export const DEFAULT_STAGE_DELAY_MS = 120;
