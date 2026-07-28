import type { Project } from "../../../types/project";
import { buildProjectCoreContext } from "../../project-workspace/services/projectCoreBridge";
import { projectWorkspaceRepository } from "../../project-workspace/services/projectWorkspaceRepository";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import { assessmentBuilderRepository } from "../../assessment-builder/services/assessmentBuilderRepository";
import { storyBuilderRepository } from "../../story-builder/services/storyBuilderRepository";
import type {
  GameAiActionId,
  GameChallenge,
  GameDocument,
  GameLevel,
  GameQuestion,
  GameReward,
  GameSectionId,
  GameSourceKind,
} from "../types";
import {
  createBlankChallenge,
  createBlankLevel,
  createBlankQuestion,
  createBlankReward,
  defaultMechanics,
} from "./gameBuilderRepository";

export type GameCorePromptPackage = {
  readonly system: string;
  readonly user: string;
  readonly action: GameAiActionId;
  readonly projectId: string;
  readonly lessonId: string;
  readonly gameId: string;
  readonly engines: readonly string[];
};

export function buildGamePromptPackage(input: {
  project: Project;
  game: GameDocument;
  action: GameAiActionId;
  sectionId?: GameSectionId;
}): GameCorePromptPackage {
  const lesson = lessonBuilderRepository.getById(input.game.lessonId);
  const meta = projectWorkspaceRepository.getMetadata(input.project.id);
  const core = buildProjectCoreContext({
    project: input.project,
    activeTab: "games",
    activeArtifactId: input.game.workspaceArtifactId,
    intent: `Game Builder · ${input.action} · ${input.game.title}`,
  });

  return {
    system:
      "PRIMA Game Builder — curriculum-aligned educational games from existing resources. Never start from an empty canvas. Teacher remains in control.",
    user: [
      `Project: ${core.projectTitle}`,
      `Subject: ${core.subject}`,
      `Grade: ${core.grade}`,
      meta.curriculumRef ? `Curriculum: ${meta.curriculumRef}` : null,
      `Lesson: ${lesson?.general.title ?? input.game.lessonId}`,
      `Game: ${input.game.title} (${input.game.kind})`,
      `Source: ${input.game.source.kind} · ${input.game.source.label}`,
      `Action: ${input.action}`,
      input.sectionId ? `Section: ${input.sectionId}` : null,
      `Objectives: ${input.game.objectives.join("; ") || lesson?.objectives.join("; ") || "n/a"}`,
    ]
      .filter(Boolean)
      .join("\n"),
    action: input.action,
    projectId: input.project.id,
    lessonId: input.game.lessonId,
    gameId: input.game.id,
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

function seedPlayableContent(
  title: string,
  subject: string,
  prompts: string[],
): {
  levels: GameLevel[];
  challenges: GameChallenge[];
  questions: GameQuestion[];
  rewards: GameReward[];
} {
  const q1 = {
    ...createBlankQuestion(0),
    prompt: prompts[0] ?? `Ce idee din „${title}" este esențială?`,
    choices: ["Ideea principală", "Un detaliu secundar", "O digresiune", "Nimic relevant"],
    correctIndex: 0,
    points: 10,
    hint: "Reamintește-ți obiectivul lecției.",
    feedbackCorrect: "Corect — ai identificat ideea-cheie.",
    feedbackIncorrect: "Revino la obiectivul principal.",
  };
  const q2 = {
    ...createBlankQuestion(1),
    prompt: prompts[1] ?? `Aplică un concept din ${subject} într-o situație scurtă.`,
    choices: ["Aplic corect", "Ghicesc", "Sar peste", "Copiez"],
    correctIndex: 0,
    points: 15,
    hint: "Gândește în pași.",
  };

  const c1 = {
    ...createBlankChallenge("question", 0),
    title: "Start warm-up",
    description: "Răspunde la întrebarea de activare.",
    difficulty: "easy" as const,
    points: 10,
  };
  const c2 = {
    ...createBlankChallenge("puzzle", 1),
    title: "Puzzle de aplicare",
    description: `Ordonează pașii pentru a rezolva o situație din ${subject}.`,
    difficulty: "medium" as const,
    points: 20,
    hint: "Începe de la ce știi deja.",
  };
  const c3 = {
    ...createBlankChallenge("boss", 2),
    title: "Provocare finală",
    description: `Demonstrează înțelegerea pe „${title}".`,
    difficulty: "hard" as const,
    points: 30,
  };

  const level1 = {
    ...createBlankLevel(0),
    title: "Nivel 1 · Activare",
    objective: "Activează cunoștințele anterioare.",
    challengeIds: [c1.id],
  };
  const level2 = {
    ...createBlankLevel(1),
    title: "Nivel 2 · Practică",
    objective: "Aplică conceptul-cheie.",
    unlockAfter: level1.id,
    challengeIds: [c2.id],
  };
  const level3 = {
    ...createBlankLevel(2),
    title: "Nivel 3 · Misiune finală",
    objective: "Transferă învățarea.",
    unlockAfter: level2.id,
    challengeIds: [c3.id],
  };

  const rewards: GameReward[] = [
    {
      ...createBlankReward(),
      title: "Explorator",
      kind: "badge",
      description: "Ai terminat nivelul 1.",
      threshold: 10,
    },
    {
      ...createBlankReward(),
      title: "3 stele",
      kind: "star",
      description: "Scor excelent pe nivel.",
      threshold: 40,
    },
    {
      ...createBlankReward(),
      title: "Deblocare finală",
      kind: "unlock",
      description: "Ai deblocat misiunea finală.",
      threshold: 30,
    },
  ];

  return {
    levels: [level1, level2, level3],
    challenges: [c1, c2, c3],
    questions: [q1, q2],
    rewards,
  };
}

function resolveSourceContent(
  project: Project,
  game: GameDocument,
  preferred: GameSourceKind,
): {
  sourceKind: GameSourceKind;
  label: string;
  resourceId?: string;
  objectives: string[];
  competencies: string[];
  prompts: string[];
} {
  const lesson = lessonBuilderRepository.getById(game.lessonId);

  if (preferred === "assessment") {
    const assessment =
      assessmentBuilderRepository.listByProject(project.id)[0] ??
      assessmentBuilderRepository
        .listByProject(project.id)
        .find((a) => a.lessonId === game.lessonId);
    if (assessment) {
      const prompts = assessment.groups
        .flatMap((g) => g.questions)
        .slice(0, 4)
        .map((q) => q.prompt)
        .filter(Boolean);
      return {
        sourceKind: "assessment",
        label: assessment.title,
        resourceId: assessment.id,
        objectives: [...assessment.objectives],
        competencies: [...assessment.competencies],
        prompts:
          prompts.length > 0
            ? prompts
            : [`Item din evaluarea „${assessment.title}"`],
      };
    }
  }

  if (preferred === "story") {
    const story = storyBuilderRepository.listByProject(project.id)[0];
    if (story) {
      const prompts = story.scenes
        .slice(0, 4)
        .map((s) => s.challenge || s.narration || s.title)
        .filter(Boolean);
      return {
        sourceKind: "story",
        label: story.title,
        resourceId: story.id,
        objectives: [...story.objectives],
        competencies: [...story.competencies],
        prompts,
      };
    }
  }

  if (preferred === "worksheet") {
    const ws = projectWorkspaceRepository
      .listArtifacts(project.id)
      .find((a) => a.kind === "worksheet" && a.status !== "archived");
    if (ws) {
      return {
        sourceKind: "worksheet",
        label: ws.title,
        resourceId: ws.id,
        objectives: lesson?.objectives ? [...lesson.objectives] : [],
        competencies: lesson?.competencies ? [...lesson.competencies] : [],
        prompts: [
          `Item de pe fișa „${ws.title}"`,
          `Aplică ideea din fișă într-un joc scurt.`,
        ],
      };
    }
  }

  if (preferred === "competencies") {
    const comps =
      game.competencies.length > 0
        ? game.competencies
        : lesson?.competencies ?? [`Competență · ${project.subject}`];
    return {
      sourceKind: "competencies",
      label: "Competențe lecție/proiect",
      objectives: lesson?.objectives ? [...lesson.objectives] : [...game.objectives],
      competencies: [...comps],
      prompts: comps.slice(0, 2).map((c) => `Demonstrează: ${c}`),
    };
  }

  if (preferred === "objectives") {
    const objs =
      game.objectives.length > 0
        ? game.objectives
        : lesson?.objectives ?? [`Obiectiv · ${game.title}`];
    return {
      sourceKind: "objectives",
      label: "Obiective de învățare",
      objectives: [...objs],
      competencies: lesson?.competencies ? [...lesson.competencies] : [],
      prompts: objs.slice(0, 2).map((o) => `Verifică: ${o}`),
    };
  }

  // lesson / default / template fallback — never empty
  return {
    sourceKind: preferred === "template" ? "template" : "lesson",
    label: lesson?.general.title ?? "Lecția curentă",
    resourceId: lesson?.id,
    objectives:
      game.objectives.length > 0
        ? [...game.objectives]
        : lesson?.objectives
          ? [...lesson.objectives]
          : [`Joacă pentru a înțelege „${game.title}"`],
    competencies:
      game.competencies.length > 0
        ? [...game.competencies]
        : lesson?.competencies
          ? [...lesson.competencies]
          : [`Competență · ${project.subject}`],
    prompts: [
      `Ce ai învățat despre „${lesson?.general.title ?? game.title}"?`,
      `Aplică un pas din lecție într-o misiune scurtă.`,
    ],
  };
}

export function applyGameAiAction(input: {
  project: Project;
  game: GameDocument;
  action: GameAiActionId;
  sectionId?: GameSectionId;
}): { game: GameDocument; prompt: GameCorePromptPackage } {
  const prompt = buildGamePromptPackage(input);
  const doc = input.game;
  const subject = doc.subject || input.project.subject;

  const sourceActionMap: Partial<Record<GameAiActionId, GameSourceKind>> = {
    from_lesson: "lesson",
    from_worksheet: "worksheet",
    from_story: "story",
    from_assessment: "assessment",
    generate_complete: doc.source.kind,
  };

  let next: GameDocument = { ...doc };

  if (
    input.action === "generate_complete" ||
    input.action === "from_lesson" ||
    input.action === "from_worksheet" ||
    input.action === "from_story" ||
    input.action === "from_assessment"
  ) {
    const preferred = sourceActionMap[input.action] ?? doc.source.kind;
    const sourced = resolveSourceContent(input.project, doc, preferred);
    const playable = seedPlayableContent(doc.title, subject, sourced.prompts);
    next = {
      ...doc,
      source: {
        kind: sourced.sourceKind,
        label: sourced.label,
        resourceId: sourced.resourceId,
      },
      objectives: sourced.objectives,
      competencies: sourced.competencies,
      mechanics: doc.mechanics.length ? doc.mechanics : defaultMechanics(),
      levels: playable.levels,
      challenges: playable.challenges,
      questions: playable.questions,
      rewards: playable.rewards,
      hints: [
        "Citește din nou regula nivelului.",
        "Folosește un indiciu înainte de a pierde o viață.",
      ],
      feedbackNotes:
        "Feedback imediat pe răspunsuri + mesaj de încurajare la final de nivel.",
      visualAssetPrompts: [
        `UI joc educațional calm pentru ${subject}, clasa ${doc.grade}`,
        `Iconițe recompense (badge, stea) stil plat, prietenos`,
      ],
      teacherNotes: `Generat din sursa „${sourced.label}" pentru lecția ${doc.lessonId}.`,
      estimatedMinutes: Math.max(10, playable.levels.length * 5),
      rules:
        doc.rules ||
        "1. Completează nivelele în ordine.\n2. Folosește indiciile.\n3. Colaborează când provocarea o cere.",
    };
  } else if (input.action === "generate_questions") {
    const extra = [
      {
        ...createBlankQuestion(doc.questions.length),
        prompt: `Întrebare nouă despre ${doc.title}`,
        points: 10,
      },
      {
        ...createBlankQuestion(doc.questions.length + 1),
        prompt: `Alege răspunsul corect legat de ${subject}`,
        points: 10,
      },
    ];
    next = { ...doc, questions: [...doc.questions, ...extra] };
  } else if (input.action === "generate_challenges") {
    next = {
      ...doc,
      challenges: [
        ...doc.challenges,
        {
          ...createBlankChallenge("task", doc.challenges.length),
          title: "Provocare generată",
          description: `Sarcină scurtă pe ${subject}.`,
          difficulty: "medium",
        },
      ],
    };
  } else if (input.action === "generate_puzzles") {
    next = {
      ...doc,
      challenges: [
        ...doc.challenges,
        {
          ...createBlankChallenge("puzzle", doc.challenges.length),
          title: "Puzzle generat",
          description: "Reasamblează pașii corecți.",
          difficulty: "medium",
          points: 25,
        },
      ],
    };
  } else if (input.action === "generate_rewards") {
    next = {
      ...doc,
      rewards: [
        ...doc.rewards,
        {
          ...createBlankReward(),
          title: "Achievement PRIMA",
          kind: "achievement",
          description: "Ai finalizat o misiune specială.",
          threshold: 60,
        },
      ],
      mechanics: doc.mechanics.map((m) =>
        m.id === "badges" || m.id === "achievements" || m.id === "stars"
          ? { ...m, enabled: true }
          : m,
      ),
    };
  } else if (input.action === "balance_difficulty") {
    const cycle = ["easy", "medium", "hard"] as const;
    next = {
      ...doc,
      challenges: doc.challenges.map((c, i) => ({
        ...c,
        difficulty: cycle[i % cycle.length]!,
      })),
    };
  } else if (input.action === "adapt_grade") {
    next = {
      ...doc,
      teacherNotes: `${doc.teacherNotes}\n\n[PRIMA] Adaptat pentru ${doc.grade}: limbaj mai apropiat, timp pe item redus.`.trim(),
      estimatedMinutes: Math.max(8, Math.round(doc.estimatedMinutes * 0.9)),
    };
  } else if (input.action === "generate_visual_prompts") {
    next = {
      ...doc,
      visualAssetPrompts: [
        ...doc.visualAssetPrompts,
        `Fundal clasă ludică pentru ${doc.kind}`,
        `Personaj ghid prietenos, fără text pe imagine`,
        `Ecran de recompensă cu stele și badge`,
      ],
    };
  }

  return { game: next, prompt };
}

export function syncGameToWorkspace(game: GameDocument): string {
  const existingId = game.workspaceArtifactId;
  if (existingId) {
    const existing = projectWorkspaceRepository.getArtifact(existingId);
    if (existing && existing.projectId === game.projectId) {
      projectWorkspaceRepository.updateArtifact(existingId, {
        title: game.title,
        status:
          game.status === "published"
            ? "ready"
            : game.status === "archived"
              ? "archived"
              : "draft",
        payload: {
          gameId: game.id,
          lessonId: game.lessonId,
          version: game.version,
          kind: game.kind,
          source: game.source,
        },
        note: `game-sync v${game.version}`,
        actor: "system",
      });
      return existingId;
    }
  }

  const unit = projectWorkspaceRepository.ensureDefaultUnit(game.projectId);
  const artifact = projectWorkspaceRepository.createArtifact({
    projectId: game.projectId,
    kind: "game",
    title: game.title,
    unitId: unit.id,
    createdBy: game.createdBy,
    payload: {
      gameId: game.id,
      lessonId: game.lessonId,
      version: game.version,
      kind: game.kind,
      source: game.source,
    },
    tags: ["game-builder", game.kind, game.source.kind],
  });
  return artifact.id;
}

export function ensureLessonForProject(project: Project): string {
  const existing = lessonBuilderRepository.listByProject(project.id)[0];
  if (existing) return existing.id;
  const created = lessonBuilderRepository.create({
    projectId: project.id,
    general: {
      title: `Lecție pentru jocuri · ${project.title}`,
      subject: project.subject,
      grade: project.grade,
    },
  });
  return created.id;
}

/** Seed a non-empty starter so teachers never face a blank canvas. */
export function seedGameFromBestSource(
  project: Project,
  game: GameDocument,
): GameDocument {
  const { game: generated } = applyGameAiAction({
    project,
    game,
    action: "generate_complete",
  });
  return generated;
}
