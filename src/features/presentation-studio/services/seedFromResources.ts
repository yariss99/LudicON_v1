import { createId } from "../../../utils/id";
import {
  DEFAULT_PRESENTATION_BLOCKS,
  presentationBlockMeta,
  presentationBlockLabel,
} from "../constants";
import type {
  PresentationBlock,
  PresentationBlockType,
  PresentationSource,
} from "../types";
import { lessonStudioRepository } from "../../lesson-studio/services/lessonStudioRepository";
import { worksheetStudioRepository } from "../../worksheet-studio/services/worksheetStudioRepository";
import { assessmentStudioRepository } from "../../assessment-studio/services/assessmentStudioRepository";
import { storyBuilderRepository } from "../../story-builder/services/storyBuilderRepository";

export function createPresentationBlock(
  type: PresentationBlockType,
  order: number,
  overrides: Partial<PresentationBlock> = {},
): PresentationBlock {
  const meta = presentationBlockMeta(type);
  return {
    id: createId("pblk"),
    title: presentationBlockLabel(type),
    content: "",
    teacherNotes: "",
    estimatedSeconds: meta?.estimatedSeconds ?? 60,
    collapsed: false,
    aiHintDismissed: false,
    ...overrides,
    type,
    order,
  };
}

export function createBlankPresentationBlocks(): PresentationBlock[] {
  return DEFAULT_PRESENTATION_BLOCKS.map((type, order) =>
    createPresentationBlock(type, order),
  );
}

function mapLessonBlocks(lessonId: string): {
  source: PresentationSource;
  blocks: PresentationBlock[];
  title: string;
} | null {
  const lesson = lessonStudioRepository.getById(lessonId);
  if (!lesson) return null;
  const typeMap: Partial<Record<string, PresentationBlockType>> = {
    introduction: "title",
    objectives: "text",
    previous_knowledge: "brainstorm",
    discovery: "diagram",
    practice: "activity",
    interactive_activity: "interactive_question",
    assessment: "interactive_question",
    homework: "reflection",
    resources: "gallery",
  };
  const sorted = [...lesson.blocks].sort((a, b) => a.order - b.order);
  const blocks = sorted.map((b, order) =>
    createPresentationBlock(typeMap[b.type] ?? "text", order, {
      title: b.title,
      content: b.content,
      teacherNotes: `From lesson block: ${b.title}`,
    }),
  );
  if (blocks.length === 0) {
    blocks.push(
      createPresentationBlock("title", 0, {
        title: lesson.properties.title,
        content: lesson.properties.title,
      }),
    );
  }
  return {
    source: {
      kind: "lesson",
      sourceId: lesson.id,
      sourceTitle: lesson.properties.title,
    },
    blocks,
    title: `Presentation · ${lesson.properties.title}`,
  };
}

function mapWorksheetBlocks(worksheetId: string): {
  source: PresentationSource;
  blocks: PresentationBlock[];
  title: string;
} | null {
  const doc = worksheetStudioRepository.getById(worksheetId);
  if (!doc) return null;
  const typeMap: Partial<Record<string, PresentationBlockType>> = {
    exercises: "activity",
    problems: "interactive_question",
    tables: "table",
    images: "image",
    matching: "interactive_question",
    crosswords: "activity",
    mazes: "activity",
    qr_activities: "qr_code",
    reflection: "reflection",
    self_assessment: "reflection",
    creative_tasks: "brainstorm",
  };
  const sorted = [...doc.blocks].sort((a, b) => a.order - b.order);
  const blocks = [
    createPresentationBlock("title", 0, {
      title: doc.properties.title,
      content: doc.properties.instructions || doc.properties.title,
    }),
    ...sorted.map((b, i) =>
      createPresentationBlock(typeMap[b.type] ?? "activity", i + 1, {
        title: b.title,
        content: b.content,
        teacherNotes: `From worksheet: ${b.title}`,
      }),
    ),
  ];
  return {
    source: {
      kind: "worksheet",
      sourceId: doc.id,
      sourceTitle: doc.properties.title,
    },
    blocks,
    title: `Presentation · ${doc.properties.title}`,
  };
}

function mapAssessmentBlocks(assessmentId: string): {
  source: PresentationSource;
  blocks: PresentationBlock[];
  title: string;
} | null {
  const doc = assessmentStudioRepository.getById(assessmentId);
  if (!doc) return null;
  const typeMap: Partial<Record<string, PresentationBlockType>> = {
    short_answer: "interactive_question",
    multiple_choice: "interactive_question",
    true_false: "interactive_question",
    matching: "table",
    ordering: "timeline",
    fill_blank: "text",
    problem_solving: "activity",
    essay: "text",
    practical_task: "activity",
    observation: "text",
    portfolio: "gallery",
    self_assessment: "reflection",
    rubric: "table",
  };
  const sorted = [...doc.blocks].sort((a, b) => a.order - b.order);
  const blocks = [
    createPresentationBlock("title", 0, {
      title: doc.properties.title,
      content: `Assessment · ${doc.properties.purpose.replace(/_/g, " ")}`,
    }),
    ...sorted.map((b, i) =>
      createPresentationBlock(typeMap[b.type] ?? "interactive_question", i + 1, {
        title: b.title,
        content: b.content,
        teacherNotes: b.competencyIds.join(", "),
      }),
    ),
    createPresentationBlock("reflection", sorted.length + 1, {
      title: "Wrap-up",
      content: "What did this assessment help us notice about our learning?",
    }),
  ];
  return {
    source: {
      kind: "assessment",
      sourceId: doc.id,
      sourceTitle: doc.properties.title,
    },
    blocks,
    title: `Presentation · ${doc.properties.title}`,
  };
}

function mapStoryBlocks(storyId: string): {
  source: PresentationSource;
  blocks: PresentationBlock[];
  title: string;
} | null {
  const story = storyBuilderRepository.getById(storyId);
  if (!story) return null;
  const scenes = story.scenes ?? [];
  const blocks = [
    createPresentationBlock("title", 0, {
      title: story.title,
      content: story.title,
    }),
    ...scenes.map((scene, i) =>
      createPresentationBlock("text", i + 1, {
        title: scene.title || `Scene ${i + 1}`,
        content: [scene.narration, scene.dialogue, scene.challenge]
          .filter(Boolean)
          .join("\n\n"),
        teacherNotes: scene.reflectionPrompt || "From story scene",
        estimatedSeconds: 90,
      }),
    ),
    createPresentationBlock("reflection", scenes.length + 1, {
      title: "Reflect",
      content: "What did the story help us understand?",
    }),
  ];
  return {
    source: {
      kind: "story",
      sourceId: story.id,
      sourceTitle: story.title,
    },
    blocks,
    title: `Presentation · ${story.title}`,
  };
}

export function seedPresentationFromSource(
  kind: PresentationSource["kind"],
  sourceId?: string,
): {
  source: PresentationSource;
  blocks: PresentationBlock[];
  title: string;
} {
  if (kind === "lesson" && sourceId) {
    const mapped = mapLessonBlocks(sourceId);
    if (mapped) return mapped;
  }
  if (kind === "worksheet" && sourceId) {
    const mapped = mapWorksheetBlocks(sourceId);
    if (mapped) return mapped;
  }
  if (kind === "assessment" && sourceId) {
    const mapped = mapAssessmentBlocks(sourceId);
    if (mapped) return mapped;
  }
  if (kind === "story" && sourceId) {
    const mapped = mapStoryBlocks(sourceId);
    if (mapped) return mapped;
  }
  return {
    source: { kind: "blank" },
    blocks: createBlankPresentationBlocks(),
    title: "Untitled presentation",
  };
}

export function listSeedSources(projectId: string) {
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
    stories: storyBuilderRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.title || "Untitled story",
    })),
  };
}
