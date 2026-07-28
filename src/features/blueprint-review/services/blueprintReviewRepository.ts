import type { BlueprintReviewDocument } from "../types";
import { REVIEW_STORAGE_KEY } from "../constants";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readAll(): BlueprintReviewDocument[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BlueprintReviewDocument[];
  } catch {
    return [];
  }
}

function writeAll(docs: BlueprintReviewDocument[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(docs));
}

export const blueprintReviewRepository = {
  list(): BlueprintReviewDocument[] {
    return readAll();
  },

  getById(id: string): BlueprintReviewDocument | null {
    return readAll().find((doc) => doc.id === id) ?? null;
  },

  getByProjectId(projectId: string): BlueprintReviewDocument | null {
    return readAll().find((doc) => doc.projectId === projectId) ?? null;
  },

  save(doc: BlueprintReviewDocument): BlueprintReviewDocument {
    const all = readAll();
    const idx = all.findIndex((item) => item.id === doc.id);
    const next = { ...doc, updatedAt: new Date().toISOString() };
    if (idx >= 0) all[idx] = next;
    else all.unshift(next);
    writeAll(all);
    return next;
  },

  isGenerationUnlocked(projectId: string): boolean {
    const doc = this.getByProjectId(projectId);
    return Boolean(doc?.generationUnlocked && doc.approvalState === "approved");
  },
};
