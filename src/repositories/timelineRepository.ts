import { SCHOOL_YEAR_TIMELINE } from "../data/timelineSeed";
import type { SchoolYearTimeline } from "../types/timeline";

const STORAGE_KEY = "prima.timeline.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export class LocalStorageTimelineRepository {
  load(): SchoolYearTimeline {
    if (!isBrowser()) return structuredClone(SCHOOL_YEAR_TIMELINE);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seed = structuredClone(SCHOOL_YEAR_TIMELINE);
        this.save(seed);
        return seed;
      }
      return JSON.parse(raw) as SchoolYearTimeline;
    } catch {
      return structuredClone(SCHOOL_YEAR_TIMELINE);
    }
  }

  save(timeline: SchoolYearTimeline): void {
    if (!isBrowser()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timeline));
  }
}

export const timelineRepository = new LocalStorageTimelineRepository();
