import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  StoryActor,
  StoryCharacter,
  StoryDocument,
  StoryKind,
  StoryScene,
  StoryValidationReport,
  StoryVersion,
} from "../types";

const STORIES_KEY = "prima.story-builder.stories.v1";
const VERSIONS_KEY = "prima.story-builder.versions.v1";

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

function estimateMinutes(scenes: readonly StoryScene[]): number {
  const words = scenes.reduce((sum, s) => {
    const text = `${s.narration} ${s.dialogue ?? ""} ${s.challenge ?? ""}`;
    return sum + text.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
  return Math.max(3, Math.round(words / 120) || 3);
}

export function createEmptyStory(input: {
  projectId: string;
  lessonId: string;
  title?: string;
  subject?: string;
  grade?: string;
  kind?: StoryKind;
  createdBy?: StoryActor;
}): StoryDocument {
  if (!input.projectId.trim() || !input.lessonId.trim()) {
    throw new Error("Story requires both projectId and lessonId");
  }
  const now = nowIso();
  return {
    id: createId("story"),
    projectId: input.projectId,
    lessonId: input.lessonId,
    kind: input.kind ?? "interactive",
    status: "draft",
    version: 1,
    title: input.title?.trim() || "Poveste nouă",
    subject: input.subject ?? "",
    grade: input.grade ?? "",
    readingLevel: "developing",
    setting: "",
    storyArc: "",
    objectives: [],
    competencies: [],
    crossCurricular: [],
    differentiation: "",
    accessibilityNotes: "",
    vocabulary: [],
    characters: [],
    scenes: [],
    activities: [],
    reflection: "",
    assessmentMoments: [],
    teacherNotes: "",
    metadata: { locale: "ro-RO", schema: "story-builder/1.0" },
    estimatedMinutes: 5,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy ?? "teacher",
  };
}

function recordVersion(
  doc: StoryDocument,
  actor: StoryActor,
  note?: string,
): StoryVersion {
  const entry: StoryVersion = {
    id: createId("sver"),
    storyId: doc.id,
    projectId: doc.projectId,
    lessonId: doc.lessonId,
    version: doc.version,
    snapshot: doc,
    createdAt: nowIso(),
    actor,
    note,
  };
  const all = load<StoryVersion[]>(VERSIONS_KEY, []);
  all.unshift(entry);
  save(VERSIONS_KEY, all.slice(0, 3000));
  return entry;
}

function withDerived(doc: StoryDocument): StoryDocument {
  return {
    ...doc,
    estimatedMinutes: estimateMinutes(doc.scenes),
  };
}

export const storyBuilderRepository = {
  listByProject(projectId: string): StoryDocument[] {
    return load<StoryDocument[]>(STORIES_KEY, [])
      .filter((s) => s.projectId === projectId && s.status !== "archived")
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  },

  getById(id: string): StoryDocument | undefined {
    return load<StoryDocument[]>(STORIES_KEY, []).find((s) => s.id === id);
  },

  create(input: {
    projectId: string;
    lessonId: string;
    title?: string;
    subject?: string;
    grade?: string;
    kind?: StoryKind;
    createdBy?: StoryActor;
    seed?: Partial<StoryDocument>;
  }): StoryDocument {
    const base = createEmptyStory(input);
    const doc = withDerived({
      ...base,
      ...input.seed,
      id: base.id,
      projectId: input.projectId,
      lessonId: input.lessonId,
      version: 1,
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
      createdBy: input.createdBy ?? "teacher",
      status: input.seed?.status ?? "draft",
    });
    const all = load<StoryDocument[]>(STORIES_KEY, []);
    all.push(doc);
    save(STORIES_KEY, all);
    recordVersion(doc, doc.createdBy, "create");
    return doc;
  },

  save(
    doc: StoryDocument,
    options?: { actor?: StoryActor; note?: string; bumpVersion?: boolean },
  ): StoryDocument {
    if (!doc.projectId || !doc.lessonId) {
      throw new Error("Story must belong to a lesson and a project");
    }
    const all = load<StoryDocument[]>(STORIES_KEY, []);
    const idx = all.findIndex((s) => s.id === doc.id);
    if (idx < 0) throw new Error(`Story not found: ${doc.id}`);
    if (all[idx]!.projectId !== doc.projectId) {
      throw new Error("Story project mismatch");
    }
    const bump = options?.bumpVersion !== false;
    const next = withDerived({
      ...doc,
      version: bump ? doc.version + 1 : doc.version,
      updatedAt: nowIso(),
    });
    all[idx] = next;
    save(STORIES_KEY, all);
    if (bump) {
      recordVersion(next, options?.actor ?? "teacher", options?.note ?? "save");
    }
    return next;
  },

  duplicate(id: string): StoryDocument {
    const source = this.getById(id);
    if (!source) throw new Error(`Story not found: ${id}`);
    const sceneIdMap = new Map<string, string>();
    source.scenes.forEach((s) => sceneIdMap.set(s.id, createId("sscene")));
    return this.create({
      projectId: source.projectId,
      lessonId: source.lessonId,
      title: `${source.title} (copie)`,
      subject: source.subject,
      grade: source.grade,
      kind: source.kind,
      seed: {
        ...source,
        title: `${source.title} (copie)`,
        status: "draft",
        publishedAt: undefined,
        validation: undefined,
        characters: source.characters.map((c) => ({
          ...c,
          id: createId("schar"),
        })),
        scenes: source.scenes.map((s, i) => ({
          ...s,
          id: sceneIdMap.get(s.id)!,
          order: i,
          choices: s.choices.map((ch) => ({
            ...ch,
            id: createId("schoice"),
            targetSceneId: ch.targetSceneId
              ? sceneIdMap.get(ch.targetSceneId)
              : undefined,
          })),
        })),
      },
    });
  },

  archive(id: string): StoryDocument {
    const doc = this.getById(id);
    if (!doc) throw new Error(`Story not found: ${id}`);
    return this.save(
      { ...doc, status: "archived" },
      { note: "archive", actor: "teacher" },
    );
  },

  listVersions(storyId: string): StoryVersion[] {
    return load<StoryVersion[]>(VERSIONS_KEY, []).filter(
      (v) => v.storyId === storyId,
    );
  },

  getVersion(versionId: string): StoryVersion | undefined {
    return load<StoryVersion[]>(VERSIONS_KEY, []).find((v) => v.id === versionId);
  },

  restoreVersion(versionId: string): StoryDocument {
    const entry = this.getVersion(versionId);
    if (!entry) throw new Error(`Version not found: ${versionId}`);
    const current = this.getById(entry.storyId);
    if (!current) throw new Error("Current story missing");
    return this.save(
      {
        ...entry.snapshot,
        id: current.id,
        projectId: current.projectId,
        lessonId: current.lessonId,
        workspaceArtifactId: current.workspaceArtifactId,
        status: current.status === "archived" ? "draft" : current.status,
        version: current.version,
      },
      { note: `restore v${entry.version}`, actor: "teacher" },
    );
  },

  publish(id: string): StoryDocument {
    const doc = this.getById(id);
    if (!doc) throw new Error(`Story not found: ${id}`);
    if (!doc.validation?.passed) {
      throw new Error("Story must pass Validation Engine before publish");
    }
    return this.save(
      { ...doc, status: "published", publishedAt: nowIso() },
      { actor: "teacher", note: "publish" },
    );
  },

  setValidation(
    id: string,
    report: StoryValidationReport,
  ): StoryDocument {
    const doc = this.getById(id);
    if (!doc) throw new Error(`Story not found: ${id}`);
    return this.save(
      {
        ...doc,
        validation: report,
        status: report.passed
          ? doc.status === "published"
            ? "published"
            : "validated"
          : "draft",
      },
      { actor: "system", note: "validation" },
    );
  },
};

export function createBlankCharacter(): StoryCharacter {
  return {
    id: createId("schar"),
    name: "Personaj nou",
    role: "Ghid",
    traits: "",
  };
}

export function createBlankScene(
  type: StoryScene["type"],
  order: number,
): StoryScene {
  return {
    id: createId("sscene"),
    type,
    title: "Scenă nouă",
    narration: "",
    choices: type === "decision" ? [
      { id: createId("schoice"), label: "Opțiunea A" },
      { id: createId("schoice"), label: "Opțiunea B" },
    ] : [],
    order,
  };
}
