import { createId } from "../../../utils/id";
import type { Project } from "../../../types/project";
import { buildProjectCoreContext } from "../../project-workspace/services/projectCoreBridge";
import { projectWorkspaceRepository } from "../../project-workspace/services/projectWorkspaceRepository";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import type {
  StoryAiActionId,
  StoryDocument,
  StoryScene,
  StorySectionId,
} from "../types";
import {
  createBlankCharacter,
  createBlankScene,
} from "./storyBuilderRepository";

export type StoryCorePromptPackage = {
  readonly system: string;
  readonly user: string;
  readonly action: StoryAiActionId;
  readonly projectId: string;
  readonly lessonId: string;
  readonly storyId: string;
  readonly engines: readonly string[];
};

export function buildStoryPromptPackage(input: {
  project: Project;
  story: StoryDocument;
  action: StoryAiActionId;
  sectionId?: StorySectionId;
}): StoryCorePromptPackage {
  const lesson = lessonBuilderRepository.getById(input.story.lessonId);
  const meta = projectWorkspaceRepository.getMetadata(input.project.id);
  const core = buildProjectCoreContext({
    project: input.project,
    activeTab: "stories",
    activeArtifactId: input.story.workspaceArtifactId,
    intent: `Story Builder · ${input.action} · ${input.story.title}`,
  });

  return {
    system:
      "PRIMA Story Builder — educational storytelling. Stories always belong to a lesson and project. Teacher remains in control.",
    user: [
      `Project: ${core.projectTitle}`,
      `Subject: ${core.subject}`,
      `Grade: ${core.grade}`,
      meta.curriculumRef ? `Curriculum: ${meta.curriculumRef}` : null,
      `Lesson: ${lesson?.general.title ?? input.story.lessonId}`,
      `Story: ${input.story.title} (${input.story.kind})`,
      `Reading level: ${input.story.readingLevel}`,
      `Action: ${input.action}`,
      input.sectionId ? `Section: ${input.sectionId}` : null,
      `Objectives: ${input.story.objectives.join("; ") || lesson?.objectives.join("; ") || "n/a"}`,
    ]
      .filter(Boolean)
      .join("\n"),
    action: input.action,
    projectId: input.project.id,
    lessonId: input.story.lessonId,
    storyId: input.story.id,
    engines: [
      "WorkflowEngine",
      "ContextEngine",
      "PromptBuilder",
      "AiOrchestrator",
      "ValidationEngine",
      "MemoryEngine",
      "ToolEngine",
      "Runtime",
    ],
  };
}

function seedScenes(title: string, subject: string): StoryScene[] {
  const intro = createBlankScene("introduction", 0);
  const dialogue = createBlankScene("dialogue", 1);
  const challenge = createBlankScene("challenge", 2);
  const decision = createBlankScene("decision", 3);
  const reflection = createBlankScene("reflection", 4);
  const ending = createBlankScene("ending", 5);

  const pathA = createBlankScene("exploration", 6);
  const pathB = createBlankScene("puzzle", 7);

  return [
    {
      ...intro,
      title: "Începutul călătoriei",
      narration: `Într-o zi obișnuită de ${subject}, clasa descoperă misterul „${title}".`,
    },
    {
      ...dialogue,
      title: "Prima întâlnire",
      narration: "Personajele se prezintă și anunță provocarea zilei.",
      dialogue: `— Hai să aflăm împreună ce înseamnă „${title}"!`,
    },
    {
      ...challenge,
      title: "Provocarea",
      narration: "Elevii trebuie să aplice ideea din lecție într-o situație din poveste.",
      challenge: `Rezolvă o situație legată de ${subject} pentru a avansa.`,
      activity: "Discută în perechi 1 minut, apoi propune o soluție.",
    },
    {
      ...decision,
      title: "Ce alegi?",
      narration: "Drumul se bifurcă. Alegerea schimbă următoarea scenă.",
      choices: [
        {
          id: createId("schoice"),
          label: "Explorăm împreună",
          targetSceneId: pathA.id,
          feedback: "Colaborarea deschide un drum nou.",
        },
        {
          id: createId("schoice"),
          label: "Rezolvăm puzzle-ul",
          targetSceneId: pathB.id,
          feedback: "Gândirea logică te duce mai departe.",
        },
      ],
    },
    {
      ...pathA,
      title: "Calea explorării",
      narration: "Personajele observă indicii și leagă ideile de viața reală.",
    },
    {
      ...pathB,
      title: "Calea puzzle-ului",
      narration: "Un puzzle scurt verifică înțelegerea conceptului-cheie.",
      challenge: "Ordonează pașii corecți ai soluției.",
    },
    {
      ...reflection,
      title: "Ce am învățat?",
      narration: "Povestea încetinește pentru o reflecție ghidată.",
      reflectionPrompt: "Ce decizie a fost cea mai utilă și de ce?",
      assessmentMoment: "Elevul explică pe scurt ideea principală din lecție.",
    },
    {
      ...ending,
      title: "Final",
      narration: `Călătoria se încheie: „${title}" nu mai e un mister, ci o idee pe care o poți folosi.`,
    },
  ];
}

export function applyStoryAiAction(input: {
  project: Project;
  story: StoryDocument;
  action: StoryAiActionId;
  sectionId?: StorySectionId;
}): { story: StoryDocument; prompt: StoryCorePromptPackage } {
  const prompt = buildStoryPromptPackage(input);
  const lesson = lessonBuilderRepository.getById(input.story.lessonId);
  const doc = input.story;
  const subject = doc.subject || input.project.subject;
  const objectives =
    doc.objectives.length > 0
      ? doc.objectives
      : lesson?.objectives ?? [`Explorează ideea: ${doc.title}`];
  const competencies =
    doc.competencies.length > 0
      ? doc.competencies
      : lesson?.competencies ?? [`Competență · ${subject}`];

  let next: StoryDocument = { ...doc };

  switch (input.action) {
    case "generate_story": {
      const characters = [
        {
          ...createBlankCharacter(),
          name: "Aria",
          role: "Ghid curios",
          traits: "Întreabă, ascultă, încurajează",
          illustrationPrompt: "Copil prietenos, stil watercolor calm",
        },
        {
          ...createBlankCharacter(),
          name: "Nico",
          role: "Explorator",
          traits: "Observă detalii, propune idei",
          illustrationPrompt: "Elev explorator cu carnet de note",
        },
      ];
      next = {
        ...doc,
        objectives,
        competencies,
        setting: doc.setting || `Sala de clasă și lumea din jur — ${subject}`,
        storyArc:
          "Introducere → Dialog → Provocare → Decizie → Explorare/Puzzle → Reflecție → Final",
        characters,
        scenes: seedScenes(doc.title, subject),
        activities: [
          "Discuție în perechi",
          "Alegere ghidată",
          "Întrebare de reflecție",
        ],
        reflection:
          "Ce am descoperit? Ce aș face diferit într-o situație similară?",
        assessmentMoments: [
          "Elevul explică ideea-cheie la finalul poveștii.",
        ],
        vocabulary: ["descoperire", "alegere", "explicație"],
        differentiation:
          "Suport: indicii vizuale. Extensie: creează o scenă alternativă.",
        accessibilityNotes:
          "Text scurt pe scenă, contrast bun, alegeri clare.",
        teacherNotes: `Generat pentru lecția ${lesson?.general.title ?? doc.lessonId}.`,
      };
      break;
    }
    case "generate_characters":
      next = {
        ...doc,
        characters: [
          ...doc.characters,
          {
            ...createBlankCharacter(),
            name: "Lina",
            role: "Mediator",
            traits: "Ajută la colaborare",
          },
        ],
      };
      break;
    case "generate_dialogues":
      next = {
        ...doc,
        scenes: doc.scenes.map((s) =>
          s.type === "dialogue" || !s.dialogue
            ? {
                ...s,
                dialogue:
                  s.dialogue ||
                  `— Hai să vedem cum ne ajută ideea din lecție aici.`,
              }
            : s,
        ),
      };
      break;
    case "generate_scenes":
      if (doc.scenes.length === 0) {
        next = { ...doc, scenes: seedScenes(doc.title, subject) };
      } else {
        next = {
          ...doc,
          scenes: [
            ...doc.scenes,
            {
              ...createBlankScene("exploration", doc.scenes.length),
              title: "Scenă nouă de explorare",
              narration: "Personajele descoperă un indiciu nou.",
            },
          ],
        };
      }
      break;
    case "generate_challenges":
      next = {
        ...doc,
        scenes: doc.scenes.map((s) =>
          s.type === "challenge" || s.type === "puzzle"
            ? {
                ...s,
                challenge:
                  s.challenge ||
                  `Aplică un concept din ${subject} pentru a debloca următorul pas.`,
                activity:
                  s.activity || "Rezolvă pe caiet, apoi verifică cu colegul.",
              }
            : s,
        ),
        assessmentMoments: [
          ...doc.assessmentMoments,
          "Întrebare scurtă după scena de provocare.",
        ],
      };
      break;
    case "adapt_grade":
      next = {
        ...doc,
        teacherNotes: `${doc.teacherNotes}\n\n[PRIMA] Adaptat pentru ${doc.grade}: vocabular mai apropiat de clasă, scene scurte.`.trim(),
        scenes: doc.scenes.map((s) => ({
          ...s,
          narration: s.narration
            ? `${s.narration}\n\n(Adaptare ${doc.grade})`
            : s.narration,
        })),
      };
      break;
    case "adjust_reading_level":
      next = {
        ...doc,
        readingLevel:
          doc.readingLevel === "advanced"
            ? "fluent"
            : doc.readingLevel === "fluent"
              ? "developing"
              : doc.readingLevel === "developing"
                ? "emerging"
                : "developing",
        vocabulary:
          doc.vocabulary.length > 0
            ? doc.vocabulary
            : ["idee", "pas", "alegere", "explicație"],
      };
      break;
    case "differentiate":
      next = {
        ...doc,
        differentiation:
          "Nivel A: alegere cu indiciu. Nivel B: alegere standard. Nivel C: creează o ramură nouă.",
        accessibilityNotes:
          "Font generos, instrucțiuni scurte, alternative text pentru ilustrații.",
      };
      break;
    case "generate_illustration_prompts":
      next = {
        ...doc,
        characters: doc.characters.map((c) => ({
          ...c,
          illustrationPrompt:
            c.illustrationPrompt ||
            `${c.name}, ${c.role}, stil carte ilustrată calmă`,
        })),
        scenes: doc.scenes.map((s) => ({
          ...s,
          illustrationPrompt:
            s.illustrationPrompt ||
            `Scenă „${s.title}", atmosferă didactica prietenoasă, fără text pe imagine`,
        })),
      };
      break;
    case "generate_audio_script":
      next = {
        ...doc,
        scenes: doc.scenes.map((s) => ({
          ...s,
          audioScript:
            s.audioScript ||
            `Narator: ${s.narration || s.title}. Pauză. ${s.dialogue ?? ""}`.trim(),
        })),
      };
      break;
    default:
      break;
  }

  return { story: next, prompt };
}

export function syncStoryToWorkspace(story: StoryDocument): string {
  const existingId = story.workspaceArtifactId;
  if (existingId) {
    const existing = projectWorkspaceRepository.getArtifact(existingId);
    if (existing && existing.projectId === story.projectId) {
      projectWorkspaceRepository.updateArtifact(existingId, {
        title: story.title,
        status:
          story.status === "published"
            ? "ready"
            : story.status === "archived"
              ? "archived"
              : "draft",
        payload: {
          storyId: story.id,
          lessonId: story.lessonId,
          version: story.version,
          kind: story.kind,
        },
        note: `story-sync v${story.version}`,
        actor: "system",
      });
      return existingId;
    }
  }

  const unit = projectWorkspaceRepository.ensureDefaultUnit(story.projectId);
  const artifact = projectWorkspaceRepository.createArtifact({
    projectId: story.projectId,
    kind: "story",
    title: story.title,
    unitId: unit.id,
    createdBy: story.createdBy,
    payload: {
      storyId: story.id,
      lessonId: story.lessonId,
      version: story.version,
      kind: story.kind,
    },
    tags: ["story-builder", story.kind],
  });
  return artifact.id;
}

export function ensureLessonForProject(project: Project): string {
  const existing = lessonBuilderRepository.listByProject(project.id)[0];
  if (existing) return existing.id;
  const created = lessonBuilderRepository.create({
    projectId: project.id,
    general: {
      title: `Lecție pentru povești · ${project.title}`,
      subject: project.subject,
      grade: project.grade,
    },
  });
  return created.id;
}
