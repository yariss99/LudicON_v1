import {
  BookOpen,
  Info,
  Layers,
  ListChecks,
  MessageSquare,
  Users,
} from "lucide-react";

import { StoryBody, newItemId, type StoryBody as Body } from "../bodies";
import { StoryEditorPane } from "../editors/StoryEditorPane";
import type {
  BuilderConfig,
  BuilderSection,
  BuilderSuggestion,
} from "../types";
import {
  collect,
  competenciesPresent,
  countFilled,
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
    hint: "Unde se petrece povestea și pentru ce nivel de lectură.",
    icon: Info,
    isComplete: (body) => filled(body.setting),
  },
  {
    id: "objectives",
    label: "Obiective de învățare",
    hint: "Ce înțeleg elevii prin această poveste.",
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
    id: "characters",
    label: "Personaje",
    hint: "Cine duce povestea mai departe.",
    icon: Users,
    isComplete: (body) => body.characters.length > 0,
  },
  {
    id: "scenes",
    label: "Scene",
    hint: "Firul narativ, de la introducere la final.",
    icon: BookOpen,
    isComplete: (body) => body.scenes.length >= 2,
  },
  {
    id: "reflection",
    label: "Reflecție",
    hint: "Ce discutați după ce se termină povestea.",
    icon: MessageSquare,
    isComplete: (body) => filled(body.reflection),
  },
];

function createBody(): Body {
  return StoryBody.parse({
    scenes: [
      {
        id: newItemId("scena"),
        type: "introduction",
        title: "Începutul",
        narration: "",
        reflectionPrompt: "",
      },
      {
        id: newItemId("scena"),
        type: "ending",
        title: "Finalul",
        narration: "",
        reflectionPrompt: "",
      },
    ],
  });
}

function suggest(document: { body: Body }): BuilderSuggestion<Body>[] {
  const { body } = document;
  const out: BuilderSuggestion<Body>[] = [];
  const types = new Set(body.scenes.map((scene) => scene.type));

  if (!types.has("introduction") || !types.has("ending")) {
    out.push({
      id: "arc-incomplete",
      title: "Povestea are nevoie de un început și un final",
      detail:
        "Arcul complet ajută elevii să urmărească firul și să rețină ideea centrală.",
      sectionId: "scenes",
      apply: (current) => ({
        ...current,
        scenes: [
          ...(types.has("introduction")
            ? []
            : [
                {
                  id: newItemId("scena"),
                  type: "introduction" as const,
                  title: "Începutul",
                  narration: "",
                  reflectionPrompt: "",
                },
              ]),
          ...current.scenes,
          ...(types.has("ending")
            ? []
            : [
                {
                  id: newItemId("scena"),
                  type: "ending" as const,
                  title: "Finalul",
                  narration: "",
                  reflectionPrompt: "",
                },
              ]),
        ],
      }),
    });
  }

  if (body.characters.length === 0) {
    out.push({
      id: "characters-empty",
      title: "Adaugă cel puțin un personaj",
      detail:
        "Elevii se leagă de povești prin cineva. Un nume și o trăsătură sunt de ajuns pentru început.",
      sectionId: "characters",
      apply: (current) => ({
        ...current,
        characters: [
          {
            id: newItemId("pers"),
            name: "Personajul principal",
            role: "Cel care descoperă",
            traits: "Curios, pune multe întrebări",
          },
        ],
      }),
    });
  }

  if (countFilled(body.vocabulary) === 0) {
    out.push({
      id: "vocabulary-empty",
      title: "Notează cuvintele noi din poveste",
      detail:
        "O listă scurtă de cuvinte îți dă un punct de plecare pentru discuția de după lectură.",
      sectionId: "general",
      apply: (current) => current,
    });
  }

  return out;
}

export const storyConfig: BuilderConfig<Body> = {
  kind: "story",
  bodySchema: StoryBody,
  createBody,
  sections,
  EditorPane: StoryEditorPane,

  validate: (document) =>
    collect([
      titlePresent(document.title),
      objectivesPresent(document.body.objectives),
      competenciesPresent(document.body.competencies),
      minimumItems({
        code: "SCENES",
        count: document.body.scenes.length,
        minimum: 2,
        path: "scenes",
        message: "Povestea are nevoie de cel puțin două scene.",
        remedy: "Adaugă o introducere și un final.",
      }),
      emptyFields({
        code: "SCENE_EMPTY",
        count: document.body.scenes.filter((scene) => !filled(scene.narration))
          .length,
        path: "scenes",
        message: (count) => `${count} scene nu au încă text.`,
        remedy: "Scrie măcar câteva rânduri pentru fiecare scenă.",
      }),
    ]),

  suggest,

  summarize: (body) => [
    { label: "Scene", value: String(body.scenes.length) },
    { label: "Personaje", value: String(body.characters.length) },
    { label: "Cuvinte noi", value: String(countFilled(body.vocabulary)) },
  ],
};
