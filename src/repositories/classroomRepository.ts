import { CLASSROOM_INTELLIGENCE_SEED } from "../data/classroomSeed";
import type { ClassroomIntelligenceStore } from "../types/classroom";

const STORAGE_KEY = "prima.classroom.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function cloneSeed(): ClassroomIntelligenceStore {
  return structuredClone(CLASSROOM_INTELLIGENCE_SEED);
}

export class LocalStorageClassroomRepository {
  load(): ClassroomIntelligenceStore {
    if (!isBrowser()) return cloneSeed();

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seed = cloneSeed();
        this.save(seed);
        return seed;
      }
      const parsed = JSON.parse(raw) as ClassroomIntelligenceStore;
      if (!parsed.versions || !parsed.feedback) return cloneSeed();
      return parsed;
    } catch {
      return cloneSeed();
    }
  }

  save(store: ClassroomIntelligenceStore): void {
    if (!isBrowser()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
}

export const classroomRepository = new LocalStorageClassroomRepository();
