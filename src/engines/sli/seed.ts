import type {
  LearningEvidence,
  LearnerAlias,
  LearnerPortfolioItem,
  ProgressTimelinePoint,
  TeacherObservation,
} from "./types";

const CLASS_ID = "class_iii_a";
const LESSON_ID = "lesson_fractions";

export function createSeedLearners(): LearnerAlias[] {
  return [
    { id: "lrn_01", displayName: "Elev A", classId: CLASS_ID },
    { id: "lrn_02", displayName: "Elev B", classId: CLASS_ID },
    { id: "lrn_03", displayName: "Elev C", classId: CLASS_ID },
    { id: "lrn_04", displayName: "Elev D", classId: CLASS_ID },
    { id: "lrn_05", displayName: "Elev E", classId: CLASS_ID },
  ];
}

export function createSeedEvidence(): LearningEvidence[] {
  const at = (offsetDays: number) =>
    new Date(Date.now() - offsetDays * 86400000).toISOString();

  return [
    {
      id: "ev_1",
      learnerId: "lrn_01",
      source: "assessment",
      title: "Exit ticket — fracții",
      summary: "A identificat corect 2/4 = 1/2",
      objectiveIds: ["obj_equiv"],
      competencyIds: ["comp_fractions"],
      recordedAt: at(1),
      lessonProjectId: LESSON_ID,
      strengthSignal: true,
    },
    {
      id: "ev_2",
      learnerId: "lrn_02",
      source: "worksheet",
      title: "Fișă — perimetru vs. arie",
      summary: "A confuzat perimetrul cu aria pe două itemi",
      objectiveIds: ["obj_measure"],
      competencyIds: ["comp_measure"],
      recordedAt: at(2),
      lessonProjectId: LESSON_ID,
      needSignal: true,
      misconceptionTag: "perimeter_vs_area",
    },
    {
      id: "ev_3",
      learnerId: "lrn_03",
      source: "worksheet",
      title: "Fișă — perimetru vs. arie",
      summary: "Aceeași confuzie pe itemul cu dreptunghi",
      objectiveIds: ["obj_measure"],
      competencyIds: ["comp_measure"],
      recordedAt: at(2),
      lessonProjectId: LESSON_ID,
      needSignal: true,
      misconceptionTag: "perimeter_vs_area",
    },
    {
      id: "ev_4",
      learnerId: "lrn_04",
      source: "interactive",
      title: "Explorare în perechi",
      summary: "Participare activă, explică ideea partenerului",
      objectiveIds: ["obj_equiv"],
      competencyIds: ["comp_fractions"],
      recordedAt: at(1),
      lessonProjectId: LESSON_ID,
      strengthSignal: true,
    },
    {
      id: "ev_5",
      learnerId: "lrn_05",
      source: "homework",
      title: "Temă — fracții",
      summary: "Temă incompletă; a omis exercițiile 3–4",
      objectiveIds: ["obj_equiv"],
      competencyIds: ["comp_fractions"],
      recordedAt: at(3),
      lessonProjectId: LESSON_ID,
      needSignal: true,
    },
    {
      id: "ev_6",
      learnerId: "lrn_02",
      source: "assessment",
      title: "Item deschis — măsurători",
      summary: "Din nou confuzie perimetru/arie",
      objectiveIds: ["obj_measure"],
      competencyIds: ["comp_measure"],
      recordedAt: at(0),
      lessonProjectId: LESSON_ID,
      needSignal: true,
      misconceptionTag: "perimeter_vs_area",
    },
    {
      id: "ev_7",
      learnerId: "lrn_01",
      source: "project",
      title: "Poster — fracții în viața reală",
      summary: "Lucrare selectată pentru portofoliu",
      objectiveIds: ["obj_equiv"],
      competencyIds: ["comp_fractions"],
      recordedAt: at(4),
      lessonProjectId: LESSON_ID,
      strengthSignal: true,
    },
  ];
}

export function createSeedObservations(): TeacherObservation[] {
  return [
    {
      id: "obs_1",
      learnerId: "lrn_02",
      note: "Are nevoie de suport vizual la măsurători.",
      recordedAt: new Date().toISOString(),
      tags: ["vizual", "măsurători"],
      editable: true,
    },
    {
      id: "obs_2",
      learnerId: "lrn_04",
      note: "Colaborare excelentă în perechi.",
      recordedAt: new Date().toISOString(),
      tags: ["colaborare"],
      editable: true,
    },
    {
      id: "obs_3",
      learnerId: "lrn_05",
      note: "Necesită practică suplimentară cu fracțiile.",
      recordedAt: new Date().toISOString(),
      tags: ["fracții", "practică"],
      editable: true,
    },
  ];
}

export function createSeedPortfolio(): LearnerPortfolioItem[] {
  return [
    {
      id: "pf_1",
      learnerId: "lrn_01",
      title: "Poster — fracții în viața reală",
      kind: "project",
      includedByTeacher: true,
      createdAt: new Date().toISOString(),
      notes: "Evidență de competență — selectat de profesor",
    },
  ];
}

export function createSeedTimeline(): ProgressTimelinePoint[] {
  return [
    {
      id: "tl_1",
      phase: "beginning",
      labelRo: "Începutul unității",
      at: new Date(Date.now() - 14 * 86400000).toISOString(),
      note: "Activare: reprezentări vizuale ale fracțiilor",
    },
    {
      id: "tl_2",
      phase: "middle",
      labelRo: "Mijlocul unității",
      at: new Date(Date.now() - 7 * 86400000).toISOString(),
      note: "Apare confuzia perimetru/arie la un grup mic",
    },
    {
      id: "tl_3",
      phase: "between_lessons",
      labelRo: "Între lecții",
      at: new Date(Date.now() - 2 * 86400000).toISOString(),
      note: "Activitățile cooperative au crescut participarea",
    },
    {
      id: "tl_4",
      phase: "end",
      labelRo: "Final de unitate (în curs)",
      at: new Date().toISOString(),
      note: "Majoritatea elevilor arată progres la obiectivul de echivalență",
    },
  ];
}

export const SLI_SEED_META = {
  classId: CLASS_ID,
  lessonProjectId: LESSON_ID,
  lessonTitle: "Fracții & măsurători",
  objectives: [
    { id: "obj_equiv", labelRo: "Identifică fracții echivalente" },
    { id: "obj_measure", labelRo: "Distinge perimetrul de arie" },
  ],
  competencies: [
    { id: "comp_fractions", labelRo: "Operarea cu fracții" },
    { id: "comp_measure", labelRo: "Măsurători în plan" },
  ],
};
