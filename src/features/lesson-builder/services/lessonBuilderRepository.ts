import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import { LESSON_PHASES } from "../constants";
import type {
  LessonActor,
  LessonBlock,
  LessonComment,
  LessonDocument,
  LessonGeneralInfo,
  LessonPhase,
  LessonValidationReport,
  LessonVersion,
} from "../types";

const LESSONS_KEY = "prima.lesson-builder.lessons.v1";
const VERSIONS_KEY = "prima.lesson-builder.versions.v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function defaultPhases(): LessonPhase[] {
  return LESSON_PHASES.map((p) => ({
    id: p.id,
    title: p.label,
    content: "",
    durationMinutes: p.defaultMinutes,
  }));
}

export function createEmptyLessonDocument(input: {
  projectId: string;
  general?: Partial<LessonGeneralInfo>;
  createdBy?: LessonActor;
  workspaceArtifactId?: string;
}): LessonDocument {
  const now = nowIso();
  const today = now.slice(0, 10);
  return {
    id: createId("lesson"),
    projectId: input.projectId,
    workspaceArtifactId: input.workspaceArtifactId,
    status: "draft",
    version: 1,
    general: {
      title: input.general?.title?.trim() || "Lecție nouă",
      subject: input.general?.subject ?? "",
      grade: input.general?.grade ?? "",
      durationMinutes: input.general?.durationMinutes ?? 45,
      date: input.general?.date ?? today,
      author: input.general?.author ?? "Profesor",
      schoolYear: input.general?.schoolYear,
      semester: input.general?.semester,
    },
    objectives: [],
    competencies: [],
    prerequisites: [],
    resources: [],
    phases: defaultPhases(),
    differentiation: "",
    assessment: "",
    homework: "",
    reflection: "",
    teacherNotes: "",
    blocks: [],
    comments: [],
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy ?? "teacher",
  };
}

function recordVersion(
  lesson: LessonDocument,
  actor: LessonActor,
  note?: string,
): LessonVersion {
  const entry: LessonVersion = {
    id: createId("lver"),
    lessonId: lesson.id,
    projectId: lesson.projectId,
    version: lesson.version,
    snapshot: lesson,
    createdAt: nowIso(),
    actor,
    note,
  };
  const all = load<LessonVersion[]>(VERSIONS_KEY, []);
  all.unshift(entry);
  save(VERSIONS_KEY, all.slice(0, 3000));
  return entry;
}

export const lessonBuilderRepository = {
  listByProject(projectId: string): LessonDocument[] {
    return load<LessonDocument[]>(LESSONS_KEY, [])
      .filter((l) => l.projectId === projectId && l.status !== "archived")
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  },

  listAllByProject(projectId: string): LessonDocument[] {
    return load<LessonDocument[]>(LESSONS_KEY, [])
      .filter((l) => l.projectId === projectId)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  },

  getById(id: string): LessonDocument | undefined {
    return load<LessonDocument[]>(LESSONS_KEY, []).find((l) => l.id === id);
  },

  create(input: {
    projectId: string;
    general?: Partial<LessonGeneralInfo>;
    createdBy?: LessonActor;
    workspaceArtifactId?: string;
    seed?: Partial<LessonDocument>;
  }): LessonDocument {
    const base = createEmptyLessonDocument(input);
    const lesson: LessonDocument = {
      ...base,
      ...input.seed,
      id: base.id,
      projectId: input.projectId,
      general: { ...base.general, ...(input.seed?.general ?? {}) },
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
      version: 1,
      status: input.seed?.status ?? "draft",
      createdBy: input.createdBy ?? "teacher",
      workspaceArtifactId: input.workspaceArtifactId,
    };
    const all = load<LessonDocument[]>(LESSONS_KEY, []);
    all.push(lesson);
    save(LESSONS_KEY, all);
    recordVersion(lesson, lesson.createdBy, "create");
    return lesson;
  },

  save(
    lesson: LessonDocument,
    options?: { actor?: LessonActor; note?: string; bumpVersion?: boolean },
  ): LessonDocument {
    const all = load<LessonDocument[]>(LESSONS_KEY, []);
    const idx = all.findIndex((l) => l.id === lesson.id);
    if (idx < 0) throw new Error(`Lesson not found: ${lesson.id}`);
    if (all[idx]!.projectId !== lesson.projectId) {
      throw new Error("Lesson project mismatch — refuse save");
    }
    const bump = options?.bumpVersion !== false;
    const next: LessonDocument = {
      ...lesson,
      version: bump ? lesson.version + 1 : lesson.version,
      updatedAt: nowIso(),
    };
    all[idx] = next;
    save(LESSONS_KEY, all);
    if (bump) {
      recordVersion(next, options?.actor ?? "teacher", options?.note ?? "save");
    }
    return next;
  },

  duplicate(id: string): LessonDocument {
    const source = this.getById(id);
    if (!source) throw new Error(`Lesson not found: ${id}`);
    return this.create({
      projectId: source.projectId,
      createdBy: "teacher",
      general: {
        ...source.general,
        title: `${source.general.title} (copie)`,
      },
      seed: {
        objectives: [...source.objectives],
        competencies: [...source.competencies],
        prerequisites: [...source.prerequisites],
        resources: [...source.resources],
        phases: source.phases.map((p) => ({ ...p })),
        differentiation: source.differentiation,
        assessment: source.assessment,
        homework: source.homework,
        reflection: source.reflection,
        teacherNotes: source.teacherNotes,
        blocks: source.blocks.map((b, i) => ({
          ...b,
          id: createId("lblock"),
          order: i,
        })),
        comments: [],
        status: "draft",
      },
    });
  },

  importLesson(
    projectId: string,
    payload: Partial<LessonDocument> & { general?: Partial<LessonGeneralInfo> },
  ): LessonDocument {
    return this.create({
      projectId,
      createdBy: "teacher",
      general: payload.general,
      seed: {
        ...payload,
        status: "draft",
        comments: [],
        validation: undefined,
      },
    });
  },

  archive(id: string): LessonDocument {
    const lesson = this.getById(id);
    if (!lesson) throw new Error(`Lesson not found: ${id}`);
    return this.save(
      { ...lesson, status: "archived" },
      { note: "archive", actor: "teacher" },
    );
  },

  listVersions(lessonId: string): LessonVersion[] {
    return load<LessonVersion[]>(VERSIONS_KEY, []).filter(
      (v) => v.lessonId === lessonId,
    );
  },

  getVersion(versionId: string): LessonVersion | undefined {
    return load<LessonVersion[]>(VERSIONS_KEY, []).find((v) => v.id === versionId);
  },

  compareVersions(aId: string, bId: string): {
    a?: LessonVersion;
    b?: LessonVersion;
  } {
    return { a: this.getVersion(aId), b: this.getVersion(bId) };
  },

  restoreVersion(versionId: string): LessonDocument {
    const entry = this.getVersion(versionId);
    if (!entry) throw new Error(`Version not found: ${versionId}`);
    const snap = entry.snapshot;
    const current = this.getById(snap.id);
    if (!current) throw new Error("Current lesson missing for restore");
    return this.save(
      {
        ...snap,
        id: current.id,
        projectId: current.projectId,
        workspaceArtifactId: current.workspaceArtifactId,
        status: current.status === "archived" ? "draft" : current.status,
        version: current.version,
      },
      { note: `restore v${entry.version}`, actor: "teacher" },
    );
  },

  setValidation(
    id: string,
    report: LessonValidationReport,
  ): LessonDocument {
    const lesson = this.getById(id);
    if (!lesson) throw new Error(`Lesson not found: ${id}`);
    return this.save(
      {
        ...lesson,
        validation: report,
        status: report.passed
          ? lesson.status === "published"
            ? "published"
            : "validated"
          : "draft",
      },
      { actor: "system", note: "validation" },
    );
  },

  publish(id: string): LessonDocument {
    const lesson = this.getById(id);
    if (!lesson) throw new Error(`Lesson not found: ${id}`);
    if (!lesson.validation?.passed) {
      throw new Error("Lesson must pass Validation Engine before publish");
    }
    return this.save(
      {
        ...lesson,
        status: "published",
        publishedAt: nowIso(),
      },
      { actor: "teacher", note: "publish" },
    );
  },

  addComment(
    lessonId: string,
    comment: Omit<LessonComment, "id" | "createdAt" | "resolved">,
  ): LessonDocument {
    const lesson = this.getById(lessonId);
    if (!lesson) throw new Error(`Lesson not found: ${lessonId}`);
    const nextComment: LessonComment = {
      ...comment,
      id: createId("lcom"),
      createdAt: nowIso(),
      resolved: false,
    };
    return this.save(
      { ...lesson, comments: [nextComment, ...lesson.comments] },
      { actor: comment.author, note: "comment", bumpVersion: false },
    );
  },

  reorderBlocks(lessonId: string, orderedIds: string[]): LessonDocument {
    const lesson = this.getById(lessonId);
    if (!lesson) throw new Error(`Lesson not found: ${lessonId}`);
    const map = new Map(lesson.blocks.map((b) => [b.id, b]));
    const blocks: LessonBlock[] = orderedIds
      .map((id, order) => {
        const block = map.get(id);
        return block ? { ...block, order } : null;
      })
      .filter((b): b is LessonBlock => Boolean(b));
    return this.save(
      { ...lesson, blocks },
      { note: "reorder-blocks", actor: "teacher" },
    );
  },
};
