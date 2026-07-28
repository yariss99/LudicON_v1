import type { GenerationWorkspaceDocument } from "../types";
import { GENERATION_STORAGE_KEY } from "../constants";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readAll(): GenerationWorkspaceDocument[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(GENERATION_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GenerationWorkspaceDocument[];
  } catch {
    return [];
  }
}

function writeAll(docs: GenerationWorkspaceDocument[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(GENERATION_STORAGE_KEY, JSON.stringify(docs));
}

export const generationRepository = {
  getById(id: string): GenerationWorkspaceDocument | null {
    return readAll().find((doc) => doc.id === id) ?? null;
  },

  getByBlueprintId(blueprintId: string): GenerationWorkspaceDocument | null {
    return readAll().find((doc) => doc.blueprintId === blueprintId) ?? null;
  },

  save(doc: GenerationWorkspaceDocument): GenerationWorkspaceDocument {
    const all = readAll();
    const next = { ...doc, updatedAt: new Date().toISOString() };
    const idx = all.findIndex((item) => item.id === next.id);
    if (idx >= 0) all[idx] = next;
    else all.unshift(next);
    writeAll(all);
    return next;
  },
};
