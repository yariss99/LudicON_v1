import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import { BLOCK_EDITOR_STORAGE_KEY } from "../constants";
import { seedDefaultDocumentBlocks } from "./blockOps";
import type { BlockDocument } from "../types";

function read(): BlockDocument[] {
  try {
    const raw = localStorage.getItem(BLOCK_EDITOR_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BlockDocument[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(docs: BlockDocument[]) {
  localStorage.setItem(BLOCK_EDITOR_STORAGE_KEY, JSON.stringify(docs));
}

export const blockDocumentStore = {
  list(): BlockDocument[] {
    return read().sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
  },

  getById(id: string): BlockDocument | undefined {
    return read().find((d) => d.id === id);
  },

  save(doc: BlockDocument): BlockDocument {
    const next = { ...doc, updatedAt: nowIso() };
    const all = read();
    const index = all.findIndex((d) => d.id === next.id);
    if (index === -1) write([next, ...all]);
    else {
      const copy = [...all];
      copy[index] = next;
      write(copy);
    }
    return next;
  },

  create(input?: {
    title?: string;
    projectId?: string | null;
    resourceKind?: string;
  }): BlockDocument {
    const timestamp = nowIso();
    const doc: BlockDocument = {
      id: createId("ubdoc"),
      title: input?.title ?? "Untitled document",
      projectId: input?.projectId ?? null,
      resourceKind: input?.resourceKind ?? "generic",
      blocks: seedDefaultDocumentBlocks(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    write([doc, ...read()]);
    return doc;
  },

  ensure(id?: string | null): BlockDocument {
    if (id) {
      const existing = this.getById(id);
      if (existing) return existing;
    }
    const latest = this.list()[0];
    if (latest) return latest;
    return this.create({ title: "Untitled resource" });
  },

  delete(id: string) {
    write(read().filter((d) => d.id !== id));
  },
};
