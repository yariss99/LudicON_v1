import type { AssetStudioDocument } from "../types";
import { ASSET_STUDIO_STORAGE_KEY } from "../constants";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readAll(): AssetStudioDocument[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(ASSET_STUDIO_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AssetStudioDocument[];
  } catch {
    return [];
  }
}

function writeAll(docs: AssetStudioDocument[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(ASSET_STUDIO_STORAGE_KEY, JSON.stringify(docs));
}

export const studioRepository = {
  getById(id: string): AssetStudioDocument | null {
    return readAll().find((doc) => doc.id === id) ?? null;
  },

  getByWorkspaceAsset(
    workspaceId: string,
    assetTypeId: string,
  ): AssetStudioDocument | null {
    return (
      readAll().find(
        (doc) =>
          doc.workspaceId === workspaceId && doc.assetTypeId === assetTypeId,
      ) ?? null
    );
  },

  save(doc: AssetStudioDocument): AssetStudioDocument {
    const all = readAll();
    const next = { ...doc, updatedAt: new Date().toISOString() };
    const idx = all.findIndex((item) => item.id === next.id);
    if (idx >= 0) all[idx] = next;
    else all.unshift(next);
    writeAll(all);
    return next;
  },
};
