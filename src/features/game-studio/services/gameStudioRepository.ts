import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import { DEFAULT_AUTHOR } from "../constants";
import type {
  GameStudioDocument,
  GameStudioProperties,
  GameSource,
  GameTypeId,
} from "../types";
import {
  createDefaultGameBlocks,
  seedGameFromSource,
} from "./seedFromResources";

const KEY = "prima.game-studio.games.v1";

function read(): GameStudioDocument[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GameStudioDocument[];
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function write(items: GameStudioDocument[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function emptyProperties(
  overrides: Partial<GameStudioProperties> = {},
): GameStudioProperties {
  return {
    title: "Untitled game",
    subject: "",
    grade: "",
    learningObjective: "",
    gameType: "quiz_challenge",
    instructions: "",
    ...overrides,
  };
}

function normalize(doc: GameStudioDocument): GameStudioDocument {
  return {
    ...doc,
    guidedCompleted: Boolean(doc.guidedCompleted),
    source: doc.source ?? { kind: "scratch" },
    properties: { ...emptyProperties(), ...doc.properties },
    mechanics: doc.mechanics ?? ["score", "levels"],
    blocks: (doc.blocks ?? []).map((b, order) => ({
      ...b,
      content: b.content ?? "",
      collapsed: Boolean(b.collapsed),
      order,
      aiHintDismissed: Boolean(b.aiHintDismissed),
    })),
  };
}

class GameStudioRepository {
  list(): GameStudioDocument[] {
    return read().sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
  }

  listByProject(projectId: string): GameStudioDocument[] {
    return this.list().filter((g) => g.projectId === projectId);
  }

  getById(id: string): GameStudioDocument | undefined {
    return read().find((g) => g.id === id);
  }

  create(
    projectId: string,
    seed?: Partial<GameStudioProperties> & {
      author?: string;
      sourceKind?: GameSource["kind"];
      sourceId?: string;
    },
  ): GameStudioDocument {
    const timestamp = nowIso();
    const gameType: GameTypeId = seed?.gameType ?? "quiz_challenge";
    const seeded = seedGameFromSource(
      seed?.sourceKind ?? "scratch",
      seed?.sourceId,
      gameType,
    );
    const doc: GameStudioDocument = {
      id: createId("gs"),
      projectId,
      status: "draft",
      version: 1,
      properties: emptyProperties({
        title: seed?.title ?? seeded.title,
        subject: seed?.subject ?? "",
        grade: seed?.grade ?? "",
        learningObjective:
          seed?.learningObjective ?? seeded.learningObjective,
        gameType,
        instructions: seed?.instructions ?? "",
      }),
      source: seeded.source,
      blocks:
        seeded.source.kind === "scratch"
          ? createDefaultGameBlocks()
          : seeded.blocks,
      mechanics: seeded.mechanics,
      guidedCompleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      author: seed?.author ?? DEFAULT_AUTHOR,
    };
    if (seeded.source.kind !== "scratch") {
      doc.blocks = seeded.blocks;
      if (!seed?.title) doc.properties.title = seeded.title;
      if (!seed?.learningObjective) {
        doc.properties.learningObjective = seeded.learningObjective;
      }
    }
    write([doc, ...read()]);
    return doc;
  }

  save(doc: GameStudioDocument): GameStudioDocument {
    const next = {
      ...normalize(doc),
      updatedAt: nowIso(),
    };
    const all = read();
    const index = all.findIndex((item) => item.id === next.id);
    if (index === -1) write([next, ...all]);
    else {
      const copy = [...all];
      copy[index] = next;
      write(copy);
    }
    return next;
  }

  duplicate(id: string): GameStudioDocument {
    const source = this.getById(id);
    if (!source) throw new Error("NOT_FOUND");
    const timestamp = nowIso();
    const copy: GameStudioDocument = {
      ...structuredClone(source),
      id: createId("gs"),
      status: "draft",
      version: 1,
      guidedCompleted: false,
      properties: {
        ...source.properties,
        title: `${source.properties.title} (copy)`,
      },
      blocks: source.blocks.map((b, order) => ({
        ...b,
        id: createId("gblk"),
        order,
      })),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    write([copy, ...read()]);
    return copy;
  }

  delete(id: string): void {
    write(read().filter((g) => g.id !== id));
  }
}

export const gameStudioRepository = new GameStudioRepository();

export function createGameInStudio(
  projectId: string,
  seed?: Partial<GameStudioProperties> & {
    sourceKind?: GameSource["kind"];
    sourceId?: string;
  },
): GameStudioDocument {
  return gameStudioRepository.create(projectId, seed);
}
