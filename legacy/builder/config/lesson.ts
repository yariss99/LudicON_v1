import {
  BookOpen,
  ClipboardCheck,
  Info,
  Layers,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Users,
} from "lucide-react";

import {
  LessonBody,
  LESSON_PHASE_TEMPLATE,
  type LessonBody as Body,
} from "../bodies";
import { LessonEditorPane } from "../editors/LessonEditorPane";
import type {
  BuilderConfig,
  BuilderSection,
  BuilderSuggestion,
} from "../types";
import {
  collect,
  competenciesPresent,
  contextPresent,
  countFilled,
  durationMatches,
  emptyFields,
  objectivesPresent,
  titlePresent,
} from "../validation";

const filled = (value: string): boolean => value.trim().length > 0;

const sections: readonly BuilderSection<Body>[] = [
  {
    id: "general",
    label: "Informații generale",
    hint: "Cât durează ora și de la ce pornesc elevii.",
    icon: Info,
    isComplete: (body) => body.durationMinutes > 0,
  },
  {
    id: "objectives",
    label: "Obiective de învățare",
    hint: "Ce vor putea face elevii la finalul orei.",
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
    id: "phases",
    label: "Secvența de învățare",
    hint: "Etapele orei, cu timpul alocat fiecăreia.",
    icon: BookOpen,
    isComplete: (body) => body.phases.some((phase) => filled(phase.content)),
  },
  {
    id: "resources",
    label: "Resurse",
    hint: "Ce ai nevoie la clasă.",
    icon: Lightbulb,
    isComplete: (body) => countFilled(body.resources) > 0,
  },
  {
    id: "differentiation",
    label: "Diferențiere",
    hint: "Cum ajungi la elevii cu ritmuri diferite.",
    icon: Users,
    isComplete: (body) => filled(body.differentiation),
  },
  {
    id: "assessment",
    label: "Evaluare",
    hint: "Cum vezi dacă obiectivele au fost atinse.",
    icon: ClipboardCheck,
    isComplete: (body) => filled(body.assessment),
  },
  {
    id: "reflection",
    label: "Reflecție",
    hint: "Ce reții pentru data viitoare.",
    icon: MessageSquare,
    isComplete: (body) => filled(body.reflection),
  },
];

function createBody(): Body {
  return LessonBody.parse({
    phases: LESSON_PHASE_TEMPLATE.map((phase) => ({ ...phase, content: "" })),
  });
}

function suggest(document: { body: Body }): BuilderSuggestion<Body>[] {
  const { body } = document;
  const out: BuilderSuggestion<Body>[] = [];

  if (body.phases.length === 0) {
    out.push({
      id: "phases-template",
      title: "Pornește de la secvența clasică a unei ore",
      detail:
        "Șapte etape, de la captarea atenției la extindere, cu minutele deja repartizate. Le poți schimba oricând.",
      sectionId: "phases",
      apply: (current) => ({
        ...current,
        phases: LESSON_PHASE_TEMPLATE.map((phase) => ({
          ...phase,
          content: "",
        })),
      }),
    });
  }

  const practice = body.phases.find((phase) => phase.id === "practice");
  if (practice !== undefined && !filled(practice.content)) {
    out.push({
      id: "practice-empty",
      title: "Practica ghidată e încă goală",
      detail:
        "Este etapa în care elevii încearcă singuri, cu tine aproape. O activitate scurtă aici schimbă mult ritmul orei.",
      sectionId: "phases",
      apply: (current) => current,
    });
  }

  if (!filled(body.assessment)) {
    out.push({
      id: "assessment-empty",
      title: "Adaugă un moment scurt de verificare",
      detail:
        "Un bilet de ieșire de două minute îți arată cine a înțeles, înainte să treci mai departe.",
      sectionId: "assessment",
      apply: (current) => ({
        ...current,
        assessment:
          "Bilet de ieșire: fiecare elev scrie un lucru pe care l-a înțeles și o întrebare rămasă.",
      }),
    });
  }

  if (!filled(body.differentiation)) {
    out.push({
      id: "differentiation-empty",
      title: "Gândește-te la elevii cu ritmuri diferite",
      detail:
        "O variantă mai simplă și una de aprofundare pentru aceeași sarcină acoperă cea mai mare parte a clasei.",
      sectionId: "differentiation",
      apply: (current) => ({
        ...current,
        differentiation:
          "Variantă accesibilă: sarcina cu sprijin vizual. Variantă de aprofundare: elevii formulează propriul exemplu.",
      }),
    });
  }

  return out;
}

export const lessonConfig: BuilderConfig<Body> = {
  kind: "lesson_plan",
  bodySchema: LessonBody,
  createBody,
  sections,
  EditorPane: LessonEditorPane,

  validate: (document) =>
    collect([
      titlePresent(document.title),
      contextPresent(document.subject, document.grade),
      objectivesPresent(document.body.objectives),
      competenciesPresent(document.body.competencies),
      emptyFields({
        code: "PHASES_SPARSE",
        count: document.body.phases.filter((phase) => !filled(phase.content))
          .length,
        path: "phases",
        message: (count) => `${count} etape nu au încă un conținut.`,
        remedy: "Completează măcar etapele de predare și practică.",
      }),
      durationMatches({
        planned: document.body.durationMinutes,
        actual: document.body.phases.reduce(
          (total, phase) => total + phase.durationMinutes,
          0,
        ),
        tolerance: 10,
        path: "phases",
      }),
    ]),

  suggest,

  summarize: (body) => [
    { label: "Etape", value: String(body.phases.length) },
    { label: "Obiective", value: String(countFilled(body.objectives)) },
    { label: "Durată", value: `${body.durationMinutes} min` },
  ],
};
