import {
  Gamepad2,
  Info,
  Layers,
  ListChecks,
  Puzzle,
  Trophy,
} from "lucide-react";

import {
  GameBody,
  MECHANICS_LIBRARY,
  newItemId,
  type GameBody as Body,
} from "../bodies";
import { GameEditorPane } from "../editors/GameEditorPane";
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
  titlePresent,
} from "../validation";

const filled = (value: string): boolean => value.trim().length > 0;

const sections: readonly BuilderSection<Body>[] = [
  {
    id: "general",
    label: "Informații generale",
    hint: "Cât durează jocul și cum se joacă.",
    icon: Info,
    isComplete: (body) => filled(body.rules),
  },
  {
    id: "objectives",
    label: "Obiective de învățare",
    hint: "Ce exersează elevii în timp ce se joacă.",
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
    id: "mechanics",
    label: "Mod de joc",
    hint: "Puncte, vieți, echipe — cât de mult sau de puțin vrei.",
    icon: Gamepad2,
    isComplete: (body) => body.mechanics.some((mechanic) => mechanic.enabled),
  },
  {
    id: "levels",
    label: "Etape",
    hint: "Cum crește dificultatea de la o etapă la alta.",
    icon: Puzzle,
    isComplete: (body) => body.levels.length > 0,
  },
  {
    id: "questions",
    label: "Întrebări",
    hint: "Conținutul propriu-zis al jocului.",
    icon: Trophy,
    isComplete: (body) => body.questions.length > 0,
  },
];

function createBody(): Body {
  return GameBody.parse({
    mechanics: MECHANICS_LIBRARY.map((entry) => ({ ...entry })),
  });
}

function suggest(document: { body: Body }): BuilderSuggestion<Body>[] {
  const { body } = document;
  const out: BuilderSuggestion<Body>[] = [];

  if (body.questions.length === 0 && body.levels.length === 0) {
    out.push({
      id: "content-empty",
      title: "Jocul nu are încă nimic de jucat",
      detail:
        "Pornește de la întrebările pe care le-ai pune oricum la finalul orei — ele devin conținutul jocului.",
      sectionId: "questions",
      apply: (current) => ({
        ...current,
        questions: [
          {
            id: newItemId("intreb"),
            prompt: "",
            choices: ["", ""],
            correctIndex: 0,
            points: 10,
          },
        ],
      }),
    });
  }

  const enabled = body.mechanics.filter((mechanic) => mechanic.enabled).length;
  if (enabled > 4) {
    out.push({
      id: "mechanics-overload",
      title: "Sunt active multe reguli deodată",
      detail:
        "Trei sau patru elemente de joc sunt de obicei suficiente. Prea multe mută atenția de la conținut la reguli.",
      sectionId: "mechanics",
      apply: (current) => current,
    });
  }

  const levels = new Set(body.levels.map((level) => level.difficulty));
  if (body.levels.length >= 3 && levels.size < 2) {
    out.push({
      id: "difficulty-flat",
      title: "Toate etapele au aceeași dificultate",
      detail:
        "O curbă crescătoare ține elevii în joc: primii pași accesibili, ultimii provocatori.",
      sectionId: "levels",
      apply: (current) => current,
    });
  }

  return out;
}

export const gameConfig: BuilderConfig<Body> = {
  kind: "game",
  bodySchema: GameBody,
  createBody,
  sections,
  EditorPane: GameEditorPane,

  validate: (document) =>
    collect([
      titlePresent(document.title),
      objectivesPresent(document.body.objectives),
      competenciesPresent(document.body.competencies),
      minimumItems({
        code: "PLAYABLE",
        count: document.body.questions.length + document.body.levels.length,
        minimum: 1,
        path: "questions",
        message: "Jocul nu are încă nimic de jucat.",
        remedy: "Adaugă o întrebare sau o etapă.",
      }),
      durationBand({
        code: "DURATION",
        minutes: document.body.estimatedMinutes,
        low: 5,
        high: 45,
        path: "general",
        remedy: "Ajustează numărul de etape ca să încapă într-o oră.",
      }),
    ]),

  suggest,

  summarize: (body) => [
    { label: "Etape", value: String(body.levels.length) },
    { label: "Întrebări", value: String(body.questions.length) },
    { label: "Durată", value: `${body.estimatedMinutes} min` },
  ],
};
