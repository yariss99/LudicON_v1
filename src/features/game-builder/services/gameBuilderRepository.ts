import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import { MECHANICS_LIBRARY } from "../constants";
import type {
  GameActor,
  GameChallenge,
  GameDocument,
  GameKind,
  GameLevel,
  GameMechanicConfig,
  GameQuestion,
  GameReward,
  GameSourceRef,
  GameValidationReport,
  GameVersion,
} from "../types";

const GAMES_KEY = "prima.game-builder.games.v1";
const VERSIONS_KEY = "prima.game-builder.versions.v1";

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

export function defaultMechanics(): GameMechanicConfig[] {
  const enabled = new Set([
    "points",
    "levels",
    "progress",
    "lives",
    "adaptive_difficulty",
  ]);
  return MECHANICS_LIBRARY.map((m) => ({
    id: m.id,
    enabled: enabled.has(m.id),
    value: m.defaultValue,
    note: m.description,
  }));
}

export function createEmptyGame(input: {
  projectId: string;
  lessonId: string;
  title?: string;
  subject?: string;
  grade?: string;
  kind?: GameKind;
  source?: GameSourceRef;
  createdBy?: GameActor;
}): GameDocument {
  if (!input.projectId.trim() || !input.lessonId.trim()) {
    throw new Error("Game requires both projectId and lessonId");
  }
  const now = nowIso();
  return {
    id: createId("game"),
    projectId: input.projectId,
    lessonId: input.lessonId,
    kind: input.kind ?? "quiz",
    status: "draft",
    version: 1,
    title: input.title?.trim() || "Joc educațional nou",
    subject: input.subject ?? "",
    grade: input.grade ?? "",
    estimatedMinutes: 15,
    source: input.source ?? {
      kind: "template",
      label: "Șablon mecanici PRIMA",
    },
    objectives: [],
    competencies: [],
    rules: "1. Citește regula nivelului.\n2. Rezolvă provocările.\n3. Folosește indiciile când ai nevoie.",
    mechanics: defaultMechanics(),
    levels: [],
    challenges: [],
    questions: [],
    rewards: [],
    hints: ["Citește din nou enunțul.", "Elimină o variantă greșită."],
    feedbackNotes: "",
    teacherNotes: "",
    visualAssetPrompts: [],
    metadata: { locale: "ro-RO", schema: "game-builder/1.0" },
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy ?? "teacher",
  };
}

function recordVersion(
  doc: GameDocument,
  actor: GameActor,
  note?: string,
): GameVersion {
  const entry: GameVersion = {
    id: createId("gver"),
    gameId: doc.id,
    projectId: doc.projectId,
    lessonId: doc.lessonId,
    version: doc.version,
    snapshot: doc,
    createdAt: nowIso(),
    actor,
    note,
  };
  const all = load<GameVersion[]>(VERSIONS_KEY, []);
  all.unshift(entry);
  save(VERSIONS_KEY, all.slice(0, 3000));
  return entry;
}

export const gameBuilderRepository = {
  listByProject(projectId: string): GameDocument[] {
    return load<GameDocument[]>(GAMES_KEY, [])
      .filter((g) => g.projectId === projectId && g.status !== "archived")
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  },

  getById(id: string): GameDocument | undefined {
    return load<GameDocument[]>(GAMES_KEY, []).find((g) => g.id === id);
  },

  create(input: {
    projectId: string;
    lessonId: string;
    title?: string;
    subject?: string;
    grade?: string;
    kind?: GameKind;
    source?: GameSourceRef;
    createdBy?: GameActor;
    seed?: Partial<GameDocument>;
  }): GameDocument {
    const base = createEmptyGame(input);
    const doc: GameDocument = {
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
      source: input.seed?.source ?? input.source ?? base.source,
      mechanics: input.seed?.mechanics ?? base.mechanics,
    };
    const all = load<GameDocument[]>(GAMES_KEY, []);
    all.push(doc);
    save(GAMES_KEY, all);
    recordVersion(doc, doc.createdBy, "create");
    return doc;
  },

  save(
    doc: GameDocument,
    options?: { actor?: GameActor; note?: string; bumpVersion?: boolean },
  ): GameDocument {
    if (!doc.projectId || !doc.lessonId) {
      throw new Error("Game must belong to a lesson and a project");
    }
    const all = load<GameDocument[]>(GAMES_KEY, []);
    const idx = all.findIndex((g) => g.id === doc.id);
    if (idx < 0) throw new Error(`Game not found: ${doc.id}`);
    if (all[idx]!.projectId !== doc.projectId) {
      throw new Error("Game project mismatch");
    }
    const bump = options?.bumpVersion !== false;
    const next: GameDocument = {
      ...doc,
      version: bump ? doc.version + 1 : doc.version,
      updatedAt: nowIso(),
    };
    all[idx] = next;
    save(GAMES_KEY, all);
    if (bump) {
      recordVersion(next, options?.actor ?? "teacher", options?.note ?? "save");
    }
    return next;
  },

  duplicate(id: string): GameDocument {
    const source = this.getById(id);
    if (!source) throw new Error(`Game not found: ${id}`);
    return this.create({
      projectId: source.projectId,
      lessonId: source.lessonId,
      title: `${source.title} (copie)`,
      subject: source.subject,
      grade: source.grade,
      kind: source.kind,
      source: source.source,
      seed: {
        ...source,
        title: `${source.title} (copie)`,
        status: "draft",
        publishedAt: undefined,
        validation: undefined,
        levels: source.levels.map((l, i) => ({
          ...l,
          id: createId("glevel"),
          order: i,
        })),
        challenges: source.challenges.map((c, i) => ({
          ...c,
          id: createId("gchal"),
          order: i,
        })),
        questions: source.questions.map((q, i) => ({
          ...q,
          id: createId("gq"),
          order: i,
        })),
        rewards: source.rewards.map((r) => ({ ...r, id: createId("grew") })),
      },
    });
  },

  archive(id: string): GameDocument {
    const doc = this.getById(id);
    if (!doc) throw new Error(`Game not found: ${id}`);
    return this.save(
      { ...doc, status: "archived" },
      { note: "archive", actor: "teacher" },
    );
  },

  listVersions(gameId: string): GameVersion[] {
    return load<GameVersion[]>(VERSIONS_KEY, []).filter((v) => v.gameId === gameId);
  },

  getVersion(versionId: string): GameVersion | undefined {
    return load<GameVersion[]>(VERSIONS_KEY, []).find((v) => v.id === versionId);
  },

  restoreVersion(versionId: string): GameDocument {
    const entry = this.getVersion(versionId);
    if (!entry) throw new Error(`Version not found: ${versionId}`);
    const current = this.getById(entry.gameId);
    if (!current) throw new Error("Current game missing");
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

  publish(id: string): GameDocument {
    const doc = this.getById(id);
    if (!doc) throw new Error(`Game not found: ${id}`);
    if (!doc.validation?.passed) {
      throw new Error("Game must pass Validation Engine before publish");
    }
    return this.save(
      { ...doc, status: "published", publishedAt: nowIso() },
      { actor: "teacher", note: "publish" },
    );
  },

  setValidation(id: string, report: GameValidationReport): GameDocument {
    const doc = this.getById(id);
    if (!doc) throw new Error(`Game not found: ${id}`);
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

export function createBlankQuestion(order: number): GameQuestion {
  return {
    id: createId("gq"),
    prompt: "",
    choices: ["A", "B", "C", "D"],
    correctIndex: 0,
    points: 10,
    order,
  };
}

export function createBlankChallenge(
  type: GameChallenge["type"],
  order: number,
): GameChallenge {
  return {
    id: createId("gchal"),
    type,
    title: "Provocare nouă",
    description: "",
    difficulty: "medium",
    points: 20,
    order,
  };
}

export function createBlankLevel(order: number): GameLevel {
  return {
    id: createId("glevel"),
    title: `Nivel ${order + 1}`,
    objective: "",
    challengeIds: [],
    order,
  };
}

export function createBlankReward(): GameReward {
  return {
    id: createId("grew"),
    title: "Recompensă nouă",
    kind: "badge",
    description: "",
    threshold: 50,
  };
}
