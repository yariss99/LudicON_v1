import { Info, Layers, ListChecks, Ruler, Target } from "lucide-react";

import {
  AssessmentBody,
  newItemId,
  type AssessmentBody as Body,
  type QuestionGroup,
} from "../bodies";
import { AssessmentEditorPane } from "../editors/AssessmentEditorPane";
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
  minimumItems,
  objectivesPresent,
  textLength,
  titlePresent,
} from "../validation";

const allQuestions = (body: Body) =>
  body.groups.flatMap((group) => group.questions);

const sections: readonly BuilderSection<Body>[] = [
  {
    id: "general",
    label: "Informații generale",
    hint: "Cât durează evaluarea și ce prag consideri reușit.",
    icon: Info,
    isComplete: (body) => body.durationMinutes > 0,
  },
  {
    id: "objectives",
    label: "Obiective de învățare",
    hint: "Ce verifică această evaluare.",
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
    id: "criteria",
    label: "Criterii de succes",
    hint: "Ce arată un răspuns bun, în cuvintele elevilor.",
    icon: Target,
    isComplete: (body) => countFilled(body.criteria) > 0,
  },
  {
    id: "questions",
    label: "Itemi",
    hint: "Întrebările, grupate pe secțiuni.",
    icon: Ruler,
    isComplete: (body) => allQuestions(body).length > 0,
  },
];

const starterGroup = (): QuestionGroup => ({
  id: newItemId("grup"),
  title: "Partea I",
  instructions: "Citește cu atenție și răspunde.",
  questions: [],
});

function createBody(): Body {
  return AssessmentBody.parse({ groups: [starterGroup()] });
}

function suggest(document: { body: Body }): BuilderSuggestion<Body>[] {
  const { body } = document;
  const questions = allQuestions(body);
  const out: BuilderSuggestion<Body>[] = [];

  if (body.groups.length === 0) {
    out.push({
      id: "group-first",
      title: "Începe cu o primă grupă de itemi",
      detail:
        "Grupele îți permit să dai o instrucțiune o singură dată pentru mai mulți itemi.",
      sectionId: "questions",
      apply: (current) => ({ ...current, groups: [starterGroup()] }),
    });
  }

  const levels = new Set(questions.map((question) => question.difficulty));
  if (questions.length >= 4 && levels.size < 3) {
    out.push({
      id: "difficulty-spread",
      title: "Toți itemii au aproape aceeași dificultate",
      detail:
        "Un item accesibil la început și unul provocator la final îți arată mai bine unde se află fiecare elev.",
      sectionId: "questions",
      apply: (current) => current,
    });
  }

  if (countFilled(body.criteria) === 0) {
    out.push({
      id: "criteria-empty",
      title: "Scrie criteriile de succes pentru elevi",
      detail:
        "Când elevii știu dinainte ce înseamnă un răspuns bun, evaluarea devine parte din învățare.",
      sectionId: "criteria",
      apply: (current) => ({
        ...current,
        criteria: [
          "Explic pașii pe care i-am urmat.",
          "Folosesc termenii învățați la oră.",
        ],
      }),
    });
  }

  return out;
}

export const assessmentConfig: BuilderConfig<Body> = {
  kind: "assessment",
  bodySchema: AssessmentBody,
  createBody,
  sections,
  EditorPane: AssessmentEditorPane,

  validate: (document) =>
    collect([
      titlePresent(document.title),
      objectivesPresent(document.body.objectives),
      competenciesPresent(document.body.competencies),
      minimumItems({
        code: "QUESTIONS",
        count: allQuestions(document.body).length,
        minimum: 1,
        path: "questions",
        message: "Evaluarea nu are încă niciun item.",
        remedy: "Adaugă cel puțin o întrebare în prima grupă.",
      }),
      textLength({
        code: "PROMPT_SHORT",
        count: allQuestions(document.body).filter(
          (question) => question.prompt.trim().length < 8,
        ).length,
        path: "questions",
        message: (count) => `${count} itemi au enunțuri foarte scurte.`,
        remedy: "Formulează enunțul complet, ca elevii să știe ce se cere.",
      }),
      duplicates({
        values: allQuestions(document.body).map((question) => question.prompt),
        path: "questions",
        message: "Doi itemi au același enunț.",
        remedy: "Reformulează unul dintre ei sau elimină-l.",
      }),
    ]),

  suggest,

  summarize: (body) => [
    { label: "Itemi", value: String(allQuestions(body).length) },
    {
      label: "Punctaj",
      value: String(
        allQuestions(body).reduce(
          (total, question) => total + question.points,
          0,
        ),
      ),
    },
    { label: "Durată", value: `${body.durationMinutes} min` },
  ],
};
