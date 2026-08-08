import { createId } from "../../../utils/id";
import {
  DEFAULT_GAME_BLOCKS,
  gameBlockLabel,
  gameTypeMeta,
} from "../constants";
import type {
  GameBlock,
  GameBlockType,
  GameMechanicId,
  GameSource,
  GameTypeId,
} from "../types";
import { lessonStudioRepository } from "../../lesson-studio/services/lessonStudioRepository";
import { worksheetStudioRepository } from "../../worksheet-studio/services/worksheetStudioRepository";
import { assessmentStudioRepository } from "../../assessment-studio/services/assessmentStudioRepository";

export function createGameBlock(
  type: GameBlockType,
  order: number,
  overrides: Partial<GameBlock> = {},
): GameBlock {
  return {
    id: createId("gblk"),
    title: gameBlockLabel(type),
    content: "",
    collapsed: false,
    aiHintDismissed: false,
    ...overrides,
    type,
    order,
  };
}

export function createDefaultGameBlocks(): GameBlock[] {
  return DEFAULT_GAME_BLOCKS.map((type, order) => createGameBlock(type, order));
}

function defaultMechanics(gameType: GameTypeId): GameMechanicId[] {
  return [...(gameTypeMeta(gameType)?.suggestedMechanics ?? ["score", "levels"])];
}

function mapLesson(lessonId: string, gameType: GameTypeId) {
  const lesson = lessonStudioRepository.getById(lessonId);
  if (!lesson) return null;
  const sorted = [...lesson.blocks].sort((a, b) => a.order - b.order);
  const blocks: GameBlock[] = [
    createGameBlock("introduction", 0, {
      title: "Introduction",
      content: `Learning goal: ${lesson.properties.title}\n${sorted[0]?.content ?? ""}`,
    }),
    createGameBlock("mission", 1, {
      content: `Complete the mission connected to: ${lesson.properties.title}`,
    }),
  ];
  let order = 2;
  for (const b of sorted.slice(0, 4)) {
    blocks.push(
      createGameBlock("question", order++, {
        title: b.title,
        content: b.content || `Challenge from: ${b.title}`,
      }),
    );
    blocks.push(
      createGameBlock("feedback", order++, {
        title: `Feedback · ${b.title}`,
        content: "Great thinking — try again with a hint if needed.",
      }),
    );
  }
  blocks.push(
    createGameBlock("reward", order++, {
      content: "Earn a badge for mastering today's objective.",
    }),
  );
  blocks.push(
    createGameBlock("final_challenge", order, {
      content: `Prove you can apply: ${lesson.properties.title}`,
    }),
  );
  return {
    source: {
      kind: "lesson" as const,
      sourceId: lesson.id,
      sourceTitle: lesson.properties.title,
    },
    blocks,
    mechanics: defaultMechanics(gameType),
    title: `Game · ${lesson.properties.title}`,
    learningObjective: lesson.properties.title,
  };
}

function mapWorksheet(worksheetId: string, gameType: GameTypeId) {
  const doc = worksheetStudioRepository.getById(worksheetId);
  if (!doc) return null;
  const sorted = [...doc.blocks].sort((a, b) => a.order - b.order);
  const blocks: GameBlock[] = [
    createGameBlock("introduction", 0, {
      content: doc.properties.instructions || doc.properties.title,
    }),
    createGameBlock("mission", 1, {
      content: `Transform worksheet practice into playable challenges.`,
    }),
  ];
  let order = 2;
  for (const b of sorted) {
    blocks.push(
      createGameBlock("question", order++, {
        title: b.title,
        content: b.content || b.title,
      }),
    );
  }
  blocks.push(
    createGameBlock("feedback", order++, {
      content: "Check your answers and retry missed items.",
    }),
  );
  blocks.push(
    createGameBlock("reward", order++, {
      content: "Collect coins for each completed station.",
    }),
  );
  blocks.push(
    createGameBlock("final_challenge", order, {
      content: "Boss level: mix two worksheet skills in one challenge.",
    }),
  );
  return {
    source: {
      kind: "worksheet" as const,
      sourceId: doc.id,
      sourceTitle: doc.properties.title,
    },
    blocks,
    mechanics: defaultMechanics(gameType),
    title: `Game · ${doc.properties.title}`,
    learningObjective: doc.properties.title,
  };
}

function mapAssessment(assessmentId: string, gameType: GameTypeId) {
  const doc = assessmentStudioRepository.getById(assessmentId);
  if (!doc) return null;
  const sorted = [...doc.blocks].sort((a, b) => a.order - b.order);
  const blocks: GameBlock[] = [
    createGameBlock("introduction", 0, {
      content: `Game based on assessment: ${doc.properties.title}`,
    }),
    createGameBlock("mission", 1, {
      content: `Show mastery of: ${doc.summary.targetedCompetencies.join(", ") || "target competencies"}`,
    }),
  ];
  let order = 2;
  for (const b of sorted) {
    blocks.push(
      createGameBlock("question", order++, {
        title: b.title,
        content: b.content || b.title,
      }),
    );
    blocks.push(
      createGameBlock("feedback", order++, {
        content: "Explain your reasoning — then unlock the next clue.",
      }),
    );
  }
  blocks.push(
    createGameBlock("reward", order++, {
      content: "Badge for competency progress.",
    }),
  );
  blocks.push(
    createGameBlock("final_challenge", order, {
      content: "Final challenge combining the hardest items.",
    }),
  );
  return {
    source: {
      kind: "assessment" as const,
      sourceId: doc.id,
      sourceTitle: doc.properties.title,
    },
    blocks,
    mechanics: defaultMechanics(gameType),
    title: `Game · ${doc.properties.title}`,
    learningObjective:
      doc.summary.targetedCompetencies[0] || doc.properties.title,
  };
}

export function seedGameFromSource(
  kind: GameSource["kind"],
  sourceId: string | undefined,
  gameType: GameTypeId,
): {
  source: GameSource;
  blocks: GameBlock[];
  mechanics: GameMechanicId[];
  title: string;
  learningObjective: string;
} {
  if (kind === "lesson" && sourceId) {
    const mapped = mapLesson(sourceId, gameType);
    if (mapped) return mapped;
  }
  if (kind === "worksheet" && sourceId) {
    const mapped = mapWorksheet(sourceId, gameType);
    if (mapped) return mapped;
  }
  if (kind === "assessment" && sourceId) {
    const mapped = mapAssessment(sourceId, gameType);
    if (mapped) return mapped;
  }
  return {
    source: { kind: "scratch" },
    blocks: createDefaultGameBlocks(),
    mechanics: defaultMechanics(gameType),
    title: "Untitled game",
    learningObjective: "",
  };
}

export function listGameSeedSources(projectId: string) {
  return {
    lessons: lessonStudioRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.properties.title || "Untitled lesson",
    })),
    worksheets: worksheetStudioRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.properties.title || "Untitled worksheet",
    })),
    assessments: assessmentStudioRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.properties.title || "Untitled assessment",
    })),
  };
}
