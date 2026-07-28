import type { PublicationRecord } from "./types";

const MEMORY: PublicationRecord[] = [];
const STORAGE_KEY = "prima.pde.publications";

function readDisk(): PublicationRecord[] {
  if (typeof localStorage === "undefined") return [...MEMORY];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...MEMORY];
    const parsed = JSON.parse(raw) as PublicationRecord[];
    return Array.isArray(parsed) ? parsed : [...MEMORY];
  } catch {
    return [...MEMORY];
  }
}

function writeDisk(records: PublicationRecord[]): void {
  MEMORY.length = 0;
  MEMORY.push(...records);
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 100)));
  } catch {
    /* ignore quota */
  }
}

export const publicationStore = {
  list(): PublicationRecord[] {
    return readDisk().sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  get(publicationId: string): PublicationRecord | undefined {
    return readDisk().find((r) => r.publicationId === publicationId);
  },

  save(record: PublicationRecord): void {
    const all = readDisk().filter(
      (r) => r.publicationId !== record.publicationId,
    );
    all.unshift(record);
    writeDisk(all);
  },

  clear(): void {
    writeDisk([]);
  },
};
