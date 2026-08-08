import { createId } from "../../../utils/id";
import { DEFAULT_STORY_BLOCKS, storyBlockLabel } from "../constants";
import type {
  StoryBlock,
  StoryBlockType,
  StorySource,
  StoryThemeId,
} from "../types";
import { lessonStudioRepository } from "../../lesson-studio/services/lessonStudioRepository";
import { worksheetStudioRepository } from "../../worksheet-studio/services/worksheetStudioRepository";
import { assessmentStudioRepository } from "../../assessment-studio/services/assessmentStudioRepository";
import { gameStudioRepository } from "../../game-studio/services/gameStudioRepository";

export function createStoryBlock(
  type: StoryBlockType,
  order: number,
  overrides: Partial<StoryBlock> = {},
): StoryBlock {
  return {
    id: createId("sblk"),
    title: storyBlockLabel(type),
    content: "",
    collapsed: false,
    aiHintDismissed: false,
    ...overrides,
    type,
    order,
  };
}

export function createDefaultStoryBlocks(): StoryBlock[] {
  return DEFAULT_STORY_BLOCKS.map((type, order) =>
    createStoryBlock(type, order),
  );
}

function mapLesson(lessonId: string) {
  const lesson = lessonStudioRepository.getById(lessonId);
  if (!lesson) return null;
  const sorted = [...lesson.blocks].sort((a, b) => a.order - b.order);
  const blocks: StoryBlock[] = [
    createStoryBlock("scene", 0, {
      content: `Opening scene for: ${lesson.properties.title}`,
    }),
    createStoryBlock("character", 1, {
      content: "Guide character who helps learners along the way.",
    }),
  ];
  let order = 2;
  for (const b of sorted.slice(0, 5)) {
    blocks.push(
      createStoryBlock("learning_task", order++, {
        title: b.title,
        content: b.content || b.title,
      }),
    );
    blocks.push(
      createStoryBlock("dialogue", order++, {
        title: `Talk · ${b.title}`,
        content: `"Let's try this together…"`,
      }),
    );
  }
  blocks.push(
    createStoryBlock("reflection", order++, {
      content: `What did we learn about: ${lesson.properties.title}?`,
    }),
  );
  blocks.push(
    createStoryBlock("alternative_ending", order, {
      content: "If learners need another path, try a gentler challenge route.",
    }),
  );
  return {
    source: {
      kind: "lesson" as const,
      sourceId: lesson.id,
      sourceTitle: lesson.properties.title,
    },
    blocks,
    title: `Story · ${lesson.properties.title}`,
    learningObjective: lesson.properties.title,
  };
}

function mapWorksheet(worksheetId: string) {
  const doc = worksheetStudioRepository.getById(worksheetId);
  if (!doc) return null;
  const sorted = [...doc.blocks].sort((a, b) => a.order - b.order);
  const blocks: StoryBlock[] = [
    createStoryBlock("scene", 0, {
      content: doc.properties.instructions || doc.properties.title,
    }),
    createStoryBlock("mission", 1, {
      content: "Complete each station to advance the story.",
    }),
  ];
  let order = 2;
  for (const b of sorted) {
    blocks.push(
      createStoryBlock("challenge", order++, {
        title: b.title,
        content: b.content || b.title,
      }),
    );
    blocks.push(
      createStoryBlock("hint", order++, {
        title: `Hint · ${b.title}`,
        content: "Look back at the example before you choose.",
      }),
    );
  }
  blocks.push(
    createStoryBlock("reward", order++, {
      content: "You unlocked the next chapter!",
    }),
  );
  blocks.push(
    createStoryBlock("reflection", order, {
      content: "Which challenge helped you most — and why?",
    }),
  );
  return {
    source: {
      kind: "worksheet" as const,
      sourceId: doc.id,
      sourceTitle: doc.properties.title,
    },
    blocks,
    title: `Story · ${doc.properties.title}`,
    learningObjective: doc.properties.title,
  };
}

function mapAssessment(assessmentId: string) {
  const doc = assessmentStudioRepository.getById(assessmentId);
  if (!doc) return null;
  const sorted = [...doc.blocks].sort((a, b) => a.order - b.order);
  const blocks: StoryBlock[] = [
    createStoryBlock("scene", 0, {
      content: `Narrative check: ${doc.properties.title}`,
    }),
    createStoryBlock("mission", 1, {
      content: `Show mastery of: ${doc.summary.targetedCompetencies.join(", ") || "the learning goal"}`,
    }),
  ];
  let order = 2;
  for (const b of sorted) {
    blocks.push(
      createStoryBlock("learning_task", order++, {
        title: b.title,
        content: b.content || b.title,
      }),
    );
    blocks.push(
      createStoryBlock("dialogue", order++, {
        content: `"Explain your thinking before we move on."`,
      }),
    );
  }
  blocks.push(
    createStoryBlock("reward", order++, {
      content: "Badge for courageous thinking.",
    }),
  );
  blocks.push(
    createStoryBlock("alternative_ending", order, {
      content: "Retry path: revisit one item with a partner.",
    }),
  );
  return {
    source: {
      kind: "assessment" as const,
      sourceId: doc.id,
      sourceTitle: doc.properties.title,
    },
    blocks,
    title: `Story · ${doc.properties.title}`,
    learningObjective:
      doc.summary.targetedCompetencies[0] || doc.properties.title,
  };
}

function mapGame(gameId: string) {
  const game = gameStudioRepository.getById(gameId);
  if (!game) return null;
  const sorted = [...game.blocks].sort((a, b) => a.order - b.order);
  const typeMap: Partial<Record<string, StoryBlockType>> = {
    introduction: "scene",
    mission: "mission",
    question: "challenge",
    feedback: "dialogue",
    reward: "reward",
    final_challenge: "learning_task",
  };
  const blocks = sorted.map((b, order) =>
    createStoryBlock(typeMap[b.type] ?? "scene", order, {
      title: b.title,
      content: b.content,
    }),
  );
  blocks.push(
    createStoryBlock("reflection", blocks.length, {
      content: `How did the game help with: ${game.properties.learningObjective || game.properties.title}?`,
    }),
  );
  blocks.push(
    createStoryBlock("alternative_ending", blocks.length, {
      content: "Co-op ending: finish the last challenge as a team.",
    }),
  );
  return {
    source: {
      kind: "game" as const,
      sourceId: game.id,
      sourceTitle: game.properties.title,
    },
    blocks,
    title: `Story · ${game.properties.title}`,
    learningObjective:
      game.properties.learningObjective || game.properties.title,
  };
}

export function seedStoryFromSource(
  kind: StorySource["kind"],
  sourceId: string | undefined,
  _theme: StoryThemeId,
): {
  source: StorySource;
  blocks: StoryBlock[];
  title: string;
  learningObjective: string;
} {
  if (kind === "lesson" && sourceId) {
    const mapped = mapLesson(sourceId);
    if (mapped) return mapped;
  }
  if (kind === "worksheet" && sourceId) {
    const mapped = mapWorksheet(sourceId);
    if (mapped) return mapped;
  }
  if (kind === "assessment" && sourceId) {
    const mapped = mapAssessment(sourceId);
    if (mapped) return mapped;
  }
  if (kind === "game" && sourceId) {
    const mapped = mapGame(sourceId);
    if (mapped) return mapped;
  }
  return {
    source: { kind: "blank" },
    blocks: createDefaultStoryBlocks(),
    title: "Untitled story",
    learningObjective: "",
  };
}

export function listStorySeedSources(projectId: string) {
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
    games: gameStudioRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.properties.title || "Untitled game",
    })),
  };
}
