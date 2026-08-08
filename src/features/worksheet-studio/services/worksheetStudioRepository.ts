import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import {
  DEFAULT_AUTHOR,
  DEFAULT_WORKSHEET_BLOCKS,
  worksheetBlockLabel,
} from "../constants";
import type {
  WorksheetBlock,
  WorksheetBlockType,
  WorksheetDocument,
  WorksheetProperties,
} from "../types";

const KEY = "prima.worksheet-studio.worksheets.v1";

function read(): WorksheetDocument[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorksheetDocument[];
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function write(items: WorksheetDocument[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function emptyProperties(
  overrides: Partial<WorksheetProperties> = {},
): WorksheetProperties {
  return {
    title: "Untitled worksheet",
    subject: "",
    grade: "",
    durationMinutes: 20,
    instructions: "",
    ...overrides,
  };
}

export function createWorksheetBlock(
  type: WorksheetBlockType,
  order: number,
): WorksheetBlock {
  return {
    id: createId("wblk"),
    type,
    title: worksheetBlockLabel(type),
    content: "",
    collapsed: false,
    order,
    aiHintDismissed: false,
  };
}

export function createDefaultWorksheetBlocks(): WorksheetBlock[] {
  return DEFAULT_WORKSHEET_BLOCKS.map((type, order) =>
    createWorksheetBlock(type, order),
  );
}

function normalize(doc: WorksheetDocument): WorksheetDocument {
  return {
    ...doc,
    guidedCompleted: Boolean(doc.guidedCompleted),
    blocks: (doc.blocks ?? []).map((b, order) => ({
      ...b,
      content: b.content ?? "",
      collapsed: Boolean(b.collapsed),
      order,
      aiHintDismissed: Boolean(b.aiHintDismissed),
    })),
  };
}

class WorksheetStudioRepository {
  list(): WorksheetDocument[] {
    return read().sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
  }

  listByProject(projectId: string): WorksheetDocument[] {
    return this.list().filter((w) => w.projectId === projectId);
  }

  getById(id: string): WorksheetDocument | undefined {
    return read().find((w) => w.id === id);
  }

  create(
    projectId: string,
    seed?: Partial<WorksheetProperties> & { author?: string },
  ): WorksheetDocument {
    const timestamp = nowIso();
    const doc: WorksheetDocument = {
      id: createId("ws"),
      projectId,
      status: "draft",
      version: 1,
      properties: emptyProperties({
        title: seed?.title ?? "Untitled worksheet",
        subject: seed?.subject ?? "",
        grade: seed?.grade ?? "",
        durationMinutes: seed?.durationMinutes ?? 20,
        instructions: seed?.instructions ?? "",
      }),
      blocks: createDefaultWorksheetBlocks(),
      guidedCompleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      author: seed?.author ?? DEFAULT_AUTHOR,
    };
    write([doc, ...read()]);
    return doc;
  }

  save(doc: WorksheetDocument): WorksheetDocument {
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

  duplicate(id: string): WorksheetDocument {
    const source = this.getById(id);
    if (!source) throw new Error("NOT_FOUND");
    const timestamp = nowIso();
    const copy: WorksheetDocument = {
      ...structuredClone(source),
      id: createId("ws"),
      status: "draft",
      version: 1,
      guidedCompleted: false,
      properties: {
        ...source.properties,
        title: `${source.properties.title} (copy)`,
      },
      blocks: source.blocks.map((b, order) => ({
        ...b,
        id: createId("wblk"),
        order,
      })),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    write([copy, ...read()]);
    return copy;
  }

  delete(id: string): void {
    write(read().filter((w) => w.id !== id));
  }
}

export const worksheetStudioRepository = new WorksheetStudioRepository();

export function createWorksheetInStudio(
  projectId: string,
  seed?: Partial<WorksheetProperties>,
): WorksheetDocument {
  return worksheetStudioRepository.create(projectId, seed);
}
