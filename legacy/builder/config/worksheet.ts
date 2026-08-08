import {
  HeartHandshake,
  Info,
  Layers,
  ListChecks,
  PenLine,
} from "lucide-react";

import {
  WorksheetBody,
  newItemId,
  type WorksheetBody as Body,
} from "../bodies";
import { WorksheetEditorPane } from "../editors/WorksheetEditorPane";
import type {
  BuilderConfig,
  BuilderSection,
  BuilderSuggestion,
} from "../types";
import {
  collect,
  competenciesPresent,
  countFilled,
  duplicates,
  emptyFields,
  minimumItems,
  objectivesPresent,
  titlePresent,
} from "../validation";

const filled = (value: string): boolean => value.trim().length > 0;

const sections: readonly BuilderSection<Body>[] = [
  {
    id: "general",
    label: "Informații generale",
    hint: "Durata și instrucțiunile pe care le citesc elevii.",
    icon: Info,
    isComplete: (body) => filled(body.instructions),
  },
  {
    id: "objectives",
    label: "Obiective de învățare",
    hint: "Ce exersează elevii prin această fișă.",
    icon: ListChecks,
    isComplete: (body) => countFilled(body.objectives) > 0,
  },
  {
    id: "competencies",
    label: "Competențe",
    hint: "Legătura cu programa clasei.",
    icon: Layers,
    isComplete: (body) => countFilled(body.competencies) > 0,
  },
  {
    id: "exercises",
    label: "Exerciții",
    hint: "Cerințele, în ordinea rezolvării.",
    icon: PenLine,
    isComplete: (body) =>
      body.exercises.length > 0 &&
      body.exercises.every((exercise) => filled(exercise.prompt)),
  },
  {
    id: "differentiation",
    label: "Sprijin și extindere",
    hint: "Pentru cine termină primul și pentru cine se blochează.",
    icon: HeartHandshake,
    isComplete: (body) => filled(body.differentiation),
  },
];

function createBody(): Body {
  return WorksheetBody.parse({
    instructions:
      "Citește cu atenție fiecare cerință și rezolvă în spațiul dat.",
    exercises: [{ id: newItemId("ex"), prompt: "" }],
  });
}

function suggest(document: { body: Body }): BuilderSuggestion<Body>[] {
  const { body } = document;
  const out: BuilderSuggestion<Body>[] = [];

  if (!filled(body.instructions)) {
    out.push({
      id: "instructions-empty",
      title: "Scrie primul lucru pe care îl citesc elevii",
      detail:
        "O singură propoziție la începutul fișei le spune ce au de făcut fără să te întrebe pe rând.",
      sectionId: "general",
      apply: (current) => ({
        ...current,
        instructions:
          "Citește cu atenție fiecare cerință și rezolvă în spațiul dat.",
      }),
    });
  }

  const noRoom = body.exercises.filter((exercise) => exercise.lines === 0);
  if (body.exercises.length > 0 && noRoom.length === body.exercises.length) {
    out.push({
      id: "no-writing-space",
      title: "Niciun exercițiu nu are loc de scris",
      detail:
        "Dacă fișa se tipărește, elevii au nevoie de câteva rânduri sub fiecare cerință.",
      sectionId: "exercises",
      apply: (current) => ({
        ...current,
        exercises: current.exercises.map((exercise) => ({
          ...exercise,
          lines: 3,
        })),
      }),
    });
  }

  if (!filled(body.differentiation) && body.exercises.length >= 3) {
    out.push({
      id: "differentiation-empty",
      title: "Gândește-te la cine termină primul",
      detail:
        "Un exercițiu în plus sau o întrebare deschisă țin ocupat elevul rapid, fără să grăbești restul clasei.",
      sectionId: "differentiation",
      apply: (current) => current,
    });
  }

  return out;
}

export const worksheetConfig: BuilderConfig<Body> = {
  kind: "worksheet",
  bodySchema: WorksheetBody,
  createBody,
  sections,
  EditorPane: WorksheetEditorPane,

  validate: (document) =>
    collect([
      titlePresent(document.title),
      objectivesPresent(document.body.objectives),
      competenciesPresent(document.body.competencies),
      minimumItems({
        code: "EXERCISES",
        count: document.body.exercises.length,
        minimum: 1,
        path: "exercises",
        message: "Fișa nu are încă niciun exercițiu.",
        remedy: "Adaugă prima cerință — poți începe cu una singură.",
      }),
      emptyFields({
        code: "PROMPT_EMPTY",
        count: document.body.exercises.filter(
          (exercise) => !filled(exercise.prompt),
        ).length,
        path: "exercises",
        message: (count) => `${count} exerciții nu au încă o cerință scrisă.`,
        remedy: "Completează ce au de făcut elevii la fiecare.",
      }),
      duplicates({
        values: document.body.exercises.map((exercise) => exercise.prompt),
        path: "exercises",
        message: "Două exerciții cer același lucru.",
        remedy: "Schimbă unul dintre ele sau elimină-l.",
      }),
    ]),

  suggest,

  summarize: (body) => [
    { label: "Exerciții", value: String(body.exercises.length) },
    { label: "Durată", value: `${body.estimatedMinutes} min` },
    {
      label: "Rânduri",
      value: String(
        body.exercises.reduce((total, exercise) => total + exercise.lines, 0),
      ),
    },
  ],
};
