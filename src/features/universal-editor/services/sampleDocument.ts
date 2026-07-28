import type { UpeDocument } from "../types";
import { createBlock } from "./blockOps";

/** Demo worksheet for `/editor/demo` foundation. */
export function createSampleWorksheet(): UpeDocument {
  const blocks = [
    createBlock("heading", 0, { text: "Fracții echivalente" }),
    createBlock("paragraph", 1, {
      text: "Completează exercițiile. Poți folosi indiciul dacă ai nevoie.",
    }),
    createBlock("exercise", 2, {
      text: "Încercuiește perechile de fracții echivalente.",
      feedback: "Verifică dacă ai redus la același numitor.",
    }),
    {
      ...createBlock("hint", 3, { text: "1/2 și 2/4 reprezintă aceeași parte din întreg." }),
      visibility: "student" as const,
    },
    createBlock("success_criteria", 4, {
      text: "Știu că am reușit când pot da două exemple de fracții echivalente.",
    }),
    createBlock("teacher_note", 5, {
      text: "Observă strategiile elevilor — reprezentare vizuală vs. calcul.",
    }),
  ];

  return {
    id: "upe_demo_worksheet",
    objectType: "worksheet",
    title: "Fișă — Fracții echivalente",
    lessonProjectId: "lesson_demo",
    lessonTitle: "Proiectul lecției · Fracții",
    subject: "Matematică",
    grade: "Clasa a IV-a",
    language: "ro",
    blocks,
    versionLabel: "v1",
    updatedAt: new Date().toISOString(),
    competencies: ["Operarea cu fracții ordinare"],
    learningObjectives: [
      "Elevul să identifice fracții echivalente",
      "Elevul să explice echivalența cu reprezentări",
    ],
  };
}
