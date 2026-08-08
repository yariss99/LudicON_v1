import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import { DEFAULT_AUTHOR } from "../constants";
import type {
  StorySource,
  StoryStudioDocument,
  StoryStudioProperties,
  StoryThemeId,
} from "../types";
import {
  createDefaultStoryBlocks,
  seedStoryFromSource,
} from "./seedFromResources";

const KEY = "prima.story-studio.stories.v1";

function read(): StoryStudioDocument[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoryStudioDocument[];
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function write(items: StoryStudioDocument[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function emptyProperties(
  overrides: Partial<StoryStudioProperties> = {},
): StoryStudioProperties {
  return {
    title: "Untitled story",
    subject: "",
    grade: "",
    learningObjective: "",
    theme: "adventure",
    synopsis: "",
    ...overrides,
  };
}

function normalize(doc: StoryStudioDocument): StoryStudioDocument {
  return {
    ...doc,
    guidedCompleted: Boolean(doc.guidedCompleted),
    source: doc.source ?? { kind: "blank" },
    properties: { ...emptyProperties(), ...doc.properties },
    blocks: (doc.blocks ?? []).map((b, order) => ({
      ...b,
      content: b.content ?? "",
      collapsed: Boolean(b.collapsed),
      order,
      aiHintDismissed: Boolean(b.aiHintDismissed),
    })),
  };
}

class StoryStudioRepository {
  list(): StoryStudioDocument[] {
    return read().sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
  }

  listByProject(projectId: string): StoryStudioDocument[] {
    return this.list().filter((s) => s.projectId === projectId);
  }

  getById(id: string): StoryStudioDocument | undefined {
    return read().find((s) => s.id === id);
  }

  create(
    projectId: string,
    seed?: Partial<StoryStudioProperties> & {
      author?: string;
      sourceKind?: StorySource["kind"];
      sourceId?: string;
    },
  ): StoryStudioDocument {
    const timestamp = nowIso();
    const theme: StoryThemeId = seed?.theme ?? "adventure";
    const seeded = seedStoryFromSource(
      seed?.sourceKind ?? "blank",
      seed?.sourceId,
      theme,
    );
    const doc: StoryStudioDocument = {
      id: createId("ss"),
      projectId,
      status: "draft",
      version: 1,
      properties: emptyProperties({
        title: seed?.title ?? seeded.title,
        subject: seed?.subject ?? "",
        grade: seed?.grade ?? "",
        learningObjective:
          seed?.learningObjective ?? seeded.learningObjective,
        theme,
        synopsis: seed?.synopsis ?? "",
      }),
      source: seeded.source,
      blocks:
        seeded.source.kind === "blank"
          ? createDefaultStoryBlocks()
          : seeded.blocks,
      guidedCompleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      author: seed?.author ?? DEFAULT_AUTHOR,
    };
    if (seeded.source.kind !== "blank") {
      doc.blocks = seeded.blocks;
      if (!seed?.title) doc.properties.title = seeded.title;
      if (!seed?.learningObjective) {
        doc.properties.learningObjective = seeded.learningObjective;
      }
    }
    write([doc, ...read()]);
    return doc;
  }

  save(doc: StoryStudioDocument): StoryStudioDocument {
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

  duplicate(id: string): StoryStudioDocument {
    const source = this.getById(id);
    if (!source) throw new Error("NOT_FOUND");
    const timestamp = nowIso();
    const copy: StoryStudioDocument = {
      ...structuredClone(source),
      id: createId("ss"),
      status: "draft",
      version: 1,
      guidedCompleted: false,
      properties: {
        ...source.properties,
        title: `${source.properties.title} (copy)`,
      },
      blocks: source.blocks.map((b, order) => ({
        ...b,
        id: createId("sblk"),
        order,
      })),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    write([copy, ...read()]);
    return copy;
  }

  delete(id: string): void {
    write(read().filter((s) => s.id !== id));
  }
}

export const storyStudioRepository = new StoryStudioRepository();

export function createStoryInStudio(
  projectId: string,
  seed?: Partial<StoryStudioProperties> & {
    sourceKind?: StorySource["kind"];
    sourceId?: string;
  },
): StoryStudioDocument {
  return storyStudioRepository.create(projectId, seed);
}
