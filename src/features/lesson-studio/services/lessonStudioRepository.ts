import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import {
  DEFAULT_AUTHOR,
  DEFAULT_LESSON_BLOCKS,
  blockTypeLabel,
} from "../constants";
import type {
  LessonBlockType,
  LessonStudioBlock,
  LessonStudioDocument,
  LessonStudioProperties,
  LessonStudioVersion,
} from "../types";

const LESSONS_KEY = "prima.lesson-studio.lessons.v1";
const VERSIONS_KEY = "prima.lesson-studio.versions.v1";

function readLessons(): LessonStudioDocument[] {
  try {
    const raw = localStorage.getItem(LESSONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LessonStudioDocument[];
    return Array.isArray(parsed) ? parsed.map(normalizeLesson) : [];
  } catch {
    return [];
  }
}

function writeLessons(lessons: LessonStudioDocument[]) {
  localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
}

function readVersions(): LessonStudioVersion[] {
  try {
    const raw = localStorage.getItem(VERSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LessonStudioVersion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeVersions(versions: LessonStudioVersion[]) {
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
}

function emptyProperties(
  overrides: Partial<LessonStudioProperties> = {},
): LessonStudioProperties {
  return {
    title: "Untitled lesson",
    subject: "",
    grade: "",
    durationMinutes: 45,
    teachingUnit: "",
    competencies: [],
    learningObjectives: [],
    keywords: [],
    difficulty: "medium",
    ...overrides,
  };
}

const KNOWN_TYPES = new Set<string>([
  "introduction",
  "objectives",
  "previous_knowledge",
  "discovery",
  "practice",
  "interactive_activity",
  "assessment",
  "homework",
  "reflection",
  "resources",
  "notes",
]);

function normalizeBlock(
  block: LessonStudioBlock,
  order: number,
): LessonStudioBlock {
  const type = (
    KNOWN_TYPES.has(block.type) ? block.type : "notes"
  ) as LessonBlockType;
  return {
    ...block,
    type,
    title: block.title || blockTypeLabel(type),
    content: block.content ?? "",
    collapsed: Boolean(block.collapsed),
    order,
    aiHintDismissed: Boolean(block.aiHintDismissed),
  };
}

function normalizeLesson(lesson: LessonStudioDocument): LessonStudioDocument {
  return {
    ...lesson,
    guidedCompleted: Boolean(lesson.guidedCompleted),
    blocks: (lesson.blocks ?? []).map((b, i) => normalizeBlock(b, i)),
  };
}

export function createBlock(
  type: LessonBlockType,
  order: number,
): LessonStudioBlock {
  return {
    id: createId("blk"),
    type,
    title: blockTypeLabel(type),
    content: "",
    collapsed: false,
    order,
    aiHintDismissed: false,
  };
}

export function createDefaultBlocks(): LessonStudioBlock[] {
  return DEFAULT_LESSON_BLOCKS.map((type, order) => createBlock(type, order));
}

class LessonStudioRepository {
  list(): LessonStudioDocument[] {
    return readLessons().sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
  }

  listByProject(projectId: string): LessonStudioDocument[] {
    return this.list().filter((lesson) => lesson.projectId === projectId);
  }

  getById(id: string): LessonStudioDocument | undefined {
    return readLessons().find((lesson) => lesson.id === id);
  }

  create(
    projectId: string,
    seed?: Partial<LessonStudioProperties> & { author?: string },
  ): LessonStudioDocument {
    const timestamp = nowIso();
    const lesson: LessonStudioDocument = {
      id: createId("lsn"),
      projectId,
      status: "draft",
      version: 1,
      properties: emptyProperties({
        title: seed?.title ?? "Untitled lesson",
        subject: seed?.subject ?? "",
        grade: seed?.grade ?? "",
        durationMinutes: seed?.durationMinutes ?? 45,
        teachingUnit: seed?.teachingUnit ?? "",
        competencies: seed?.competencies ?? [],
        learningObjectives: seed?.learningObjectives ?? [],
        keywords: seed?.keywords ?? [],
        difficulty: seed?.difficulty ?? "medium",
      }),
      blocks: createDefaultBlocks(),
      guidedCompleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      author: seed?.author ?? DEFAULT_AUTHOR,
    };
    writeLessons([lesson, ...readLessons()]);
    this.pushVersion(lesson, "Created");
    return lesson;
  }

  save(
    lesson: LessonStudioDocument,
    options?: { bumpVersion?: boolean; note?: string },
  ): LessonStudioDocument {
    const bump = options?.bumpVersion ?? false;
    const next: LessonStudioDocument = {
      ...normalizeLesson(lesson),
      version: bump ? lesson.version + 1 : lesson.version,
      updatedAt: nowIso(),
    };
    const lessons = readLessons();
    const index = lessons.findIndex((item) => item.id === next.id);
    if (index === -1) writeLessons([next, ...lessons]);
    else {
      const copy = [...lessons];
      copy[index] = next;
      writeLessons(copy);
    }
    if (bump || options?.note) {
      this.pushVersion(next, options?.note ?? `Saved v${next.version}`);
    }
    return next;
  }

  duplicate(id: string): LessonStudioDocument {
    const source = this.getById(id);
    if (!source) throw new Error("NOT_FOUND");
    const timestamp = nowIso();
    const copy: LessonStudioDocument = {
      ...structuredClone(source),
      id: createId("lsn"),
      status: "draft",
      version: 1,
      guidedCompleted: false,
      properties: {
        ...source.properties,
        title: `${source.properties.title} (copy)`,
      },
      blocks: source.blocks.map((block, order) => ({
        ...block,
        id: createId("blk"),
        order,
      })),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    writeLessons([copy, ...readLessons()]);
    this.pushVersion(copy, "Duplicated");
    return copy;
  }

  delete(id: string): void {
    writeLessons(readLessons().filter((lesson) => lesson.id !== id));
    writeVersions(readVersions().filter((v) => v.lessonId !== id));
  }

  listVersions(lessonId: string): LessonStudioVersion[] {
    return readVersions()
      .filter((v) => v.lessonId === lessonId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  restoreVersion(versionId: string): LessonStudioDocument {
    const versions = readVersions();
    const entry = versions.find((v) => v.id === versionId);
    if (!entry) throw new Error("VERSION_NOT_FOUND");
    const restored: LessonStudioDocument = {
      ...structuredClone(entry.snapshot),
      version: entry.snapshot.version + 1,
      updatedAt: nowIso(),
    };
    return this.save(restored, {
      bumpVersion: false,
      note: `Restored from v${entry.version}`,
    });
  }

  private pushVersion(lesson: LessonStudioDocument, note?: string) {
    const entry: LessonStudioVersion = {
      id: createId("lsv"),
      lessonId: lesson.id,
      projectId: lesson.projectId,
      version: lesson.version,
      snapshot: structuredClone(lesson),
      createdAt: nowIso(),
      author: lesson.author || DEFAULT_AUTHOR,
      note,
    };
    writeVersions([entry, ...readVersions()].slice(0, 80));
  }
}

export const lessonStudioRepository = new LessonStudioRepository();

export function createLessonInStudio(
  projectId: string,
  seed?: Partial<LessonStudioProperties>,
): LessonStudioDocument {
  return lessonStudioRepository.create(projectId, seed);
}
