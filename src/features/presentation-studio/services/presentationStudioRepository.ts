import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import { DEFAULT_AUTHOR } from "../constants";
import type {
  PresentationStudioDocument,
  PresentationStudioProperties,
  PresentationSource,
} from "../types";
import {
  createBlankPresentationBlocks,
  seedPresentationFromSource,
} from "./seedFromResources";

const KEY = "prima.presentation-studio.presentations.v1";

function read(): PresentationStudioDocument[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PresentationStudioDocument[];
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function write(items: PresentationStudioDocument[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function emptyProperties(
  overrides: Partial<PresentationStudioProperties> = {},
): PresentationStudioProperties {
  return {
    title: "Untitled presentation",
    subject: "",
    grade: "",
    instructions: "",
    ...overrides,
  };
}

function normalize(
  doc: PresentationStudioDocument,
): PresentationStudioDocument {
  return {
    ...doc,
    guidedCompleted: Boolean(doc.guidedCompleted),
    source: doc.source ?? { kind: "blank" },
    properties: { ...emptyProperties(), ...doc.properties },
    blocks: (doc.blocks ?? []).map((b, order) => ({
      ...b,
      content: b.content ?? "",
      teacherNotes: b.teacherNotes ?? "",
      estimatedSeconds: b.estimatedSeconds ?? 60,
      collapsed: Boolean(b.collapsed),
      order,
      aiHintDismissed: Boolean(b.aiHintDismissed),
    })),
  };
}

class PresentationStudioRepository {
  list(): PresentationStudioDocument[] {
    return read().sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
  }

  listByProject(projectId: string): PresentationStudioDocument[] {
    return this.list().filter((p) => p.projectId === projectId);
  }

  getById(id: string): PresentationStudioDocument | undefined {
    return read().find((p) => p.id === id);
  }

  create(
    projectId: string,
    seed?: Partial<PresentationStudioProperties> & {
      author?: string;
      sourceKind?: PresentationSource["kind"];
      sourceId?: string;
    },
  ): PresentationStudioDocument {
    const timestamp = nowIso();
    const seeded = seedPresentationFromSource(
      seed?.sourceKind ?? "blank",
      seed?.sourceId,
    );
    const doc: PresentationStudioDocument = {
      id: createId("ps"),
      projectId,
      status: "draft",
      version: 1,
      properties: emptyProperties({
        title: seed?.title ?? seeded.title,
        subject: seed?.subject ?? "",
        grade: seed?.grade ?? "",
        instructions: seed?.instructions ?? "",
      }),
      source: seeded.source,
      blocks:
        seed?.sourceKind && seed.sourceKind !== "blank"
          ? seeded.blocks
          : seed?.sourceKind === "blank" || !seed?.sourceKind
            ? createBlankPresentationBlocks()
            : seeded.blocks,
      guidedCompleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      author: seed?.author ?? DEFAULT_AUTHOR,
    };
    // Prefer seeded blocks whenever source mapping succeeded
    if (seeded.source.kind !== "blank") {
      doc.blocks = seeded.blocks;
      if (!seed?.title) doc.properties.title = seeded.title;
    }
    write([doc, ...read()]);
    return doc;
  }

  save(doc: PresentationStudioDocument): PresentationStudioDocument {
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

  duplicate(id: string): PresentationStudioDocument {
    const source = this.getById(id);
    if (!source) throw new Error("NOT_FOUND");
    const timestamp = nowIso();
    const copy: PresentationStudioDocument = {
      ...structuredClone(source),
      id: createId("ps"),
      status: "draft",
      version: 1,
      guidedCompleted: false,
      properties: {
        ...source.properties,
        title: `${source.properties.title} (copy)`,
      },
      blocks: source.blocks.map((b, order) => ({
        ...b,
        id: createId("pblk"),
        order,
      })),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    write([copy, ...read()]);
    return copy;
  }

  delete(id: string): void {
    write(read().filter((p) => p.id !== id));
  }
}

export const presentationStudioRepository = new PresentationStudioRepository();

export function createPresentationInStudio(
  projectId: string,
  seed?: Partial<PresentationStudioProperties> & {
    sourceKind?: PresentationSource["kind"];
    sourceId?: string;
  },
): PresentationStudioDocument {
  return presentationStudioRepository.create(projectId, seed);
}
