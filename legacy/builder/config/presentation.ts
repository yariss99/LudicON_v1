import { Layers, ListChecks, Presentation } from "lucide-react";

import {
  PresentationBody,
  newItemId,
  type PresentationBody as Body,
  type PresentationSlide,
} from "../bodies";
import { PresentationEditorPane } from "../editors/PresentationEditorPane";
import type {
  BuilderConfig,
  BuilderSection,
  BuilderSuggestion,
} from "../types";
import {
  collect,
  competenciesPresent,
  countFilled,
  durationBand,
  minimumItems,
  objectivesPresent,
  textLength,
  titlePresent,
} from "../validation";

const minutes = (body: Body): number =>
  Math.max(
    1,
    Math.round(
      body.slides.reduce((total, slide) => total + slide.estimatedSeconds, 0) /
        60,
    ),
  );

const sections: readonly BuilderSection<Body>[] = [
  {
    id: "objectives",
    label: "Obiective de învățare",
    hint: "Ce urmăresc elevii pe parcursul prezentării.",
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
    id: "slides",
    label: "Diapozitive",
    hint: "Fluxul orei, un ecran pe rând.",
    icon: Presentation,
    isComplete: (body) => body.slides.length >= 3,
  },
];

const slide = (
  type: PresentationSlide["type"],
  title: string,
  seconds: number,
): PresentationSlide => ({
  id: newItemId("slide"),
  type,
  title,
  body: "",
  bullets: [],
  speakerNotes: "",
  estimatedSeconds: seconds,
});

function createBody(): Body {
  return PresentationBody.parse({
    slides: [
      slide("title", "Titlul orei", 20),
      slide("objectives", "Ce învățăm azi", 45),
      slide("summary", "Ce reținem", 45),
    ],
  });
}

function suggest(document: { body: Body }): BuilderSuggestion<Body>[] {
  const { body } = document;
  const out: BuilderSuggestion<Body>[] = [];
  const types = new Set(body.slides.map((entry) => entry.type));

  if (!types.has("objectives") || !types.has("summary")) {
    out.push({
      id: "flow-incomplete",
      title: "Fluxul orei are un gol",
      detail:
        "O prezentare care începe cu ce învățăm și se încheie cu ce reținem le dă elevilor un cadru clar.",
      sectionId: "slides",
      apply: (current) => ({
        ...current,
        slides: [
          ...current.slides,
          ...(types.has("objectives")
            ? []
            : [slide("objectives", "Ce învățăm azi", 45)]),
          ...(types.has("summary") ? [] : [slide("summary", "Ce reținem", 45)]),
        ],
      }),
    });
  }

  const dense = body.slides.filter((entry) => entry.body.length > 420);
  if (dense.length > 0) {
    out.push({
      id: "slides-dense",
      title: `${dense.length} diapozitive au mult text`,
      detail:
        "Ce e pe ecran ar trebui să susțină ce spui, nu să-l repete. Mută detaliile în notele tale.",
      sectionId: "slides",
      apply: (current) => current,
    });
  }

  const withoutNotes = body.slides.filter(
    (entry) => entry.speakerNotes.trim().length === 0,
  ).length;
  if (body.slides.length > 0 && withoutNotes > body.slides.length / 2) {
    out.push({
      id: "notes-sparse",
      title: "Majoritatea diapozitivelor nu au note",
      detail:
        "Câteva cuvinte pentru tine pe fiecare ecran fac prezentarea reutilizabilă peste un an.",
      sectionId: "slides",
      apply: (current) => current,
    });
  }

  return out;
}

export const presentationConfig: BuilderConfig<Body> = {
  kind: "presentation",
  bodySchema: PresentationBody,
  createBody,
  sections,
  EditorPane: PresentationEditorPane,

  validate: (document) =>
    collect([
      titlePresent(document.title),
      objectivesPresent(document.body.objectives),
      competenciesPresent(document.body.competencies),
      minimumItems({
        code: "SLIDES",
        count: document.body.slides.length,
        minimum: 3,
        path: "slides",
        message: "Prezentarea are nevoie de cel puțin trei diapozitive.",
        remedy: "Titlu, ce învățăm și ce reținem sunt un start bun.",
      }),
      textLength({
        code: "DENSITY",
        count: document.body.slides.filter((entry) => entry.body.length > 420)
          .length,
        path: "slides",
        message: (count) => `${count} diapozitive au mult text pe ecran.`,
        remedy: "Mută detaliile în notele tale de prezentare.",
      }),
      durationBand({
        code: "DURATION",
        minutes: minutes(document.body),
        low: 1,
        high: 40,
        path: "slides",
        remedy: "Scurtează timpul pe diapozitiv sau elimină câteva ecrane.",
      }),
    ]),

  suggest,

  summarize: (body) => [
    { label: "Diapozitive", value: String(body.slides.length) },
    { label: "Durată", value: `${minutes(body)} min` },
    {
      label: "Cu note",
      value: String(
        body.slides.filter((entry) => entry.speakerNotes.trim().length > 0)
          .length,
      ),
    },
  ],
};
