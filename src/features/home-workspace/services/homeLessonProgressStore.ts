import { HOME_STORAGE } from "../constants";

export type HomeLessonProgress = {
  lessonId: string;
  projectId: string;
  title: string;
  subject: string;
  grade: string;
  createdAt: string;
};

function read(): HomeLessonProgress[] {
  try {
    const raw = localStorage.getItem(HOME_STORAGE.lessonProgress);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HomeLessonProgress[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: HomeLessonProgress[]) {
  localStorage.setItem(HOME_STORAGE.lessonProgress, JSON.stringify(items));
}

/** Persist recent home-created lessons for the dashboard progress card. */
export const homeLessonProgressStore = {
  list(): HomeLessonProgress[] {
    return read().sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
  },

  add(entry: HomeLessonProgress) {
    const next = [entry, ...read().filter((e) => e.lessonId !== entry.lessonId)].slice(
      0,
      12,
    );
    write(next);
    return next;
  },

  clear() {
    write([]);
  },
};

/** Notify Copilot / other observers that studio artifacts changed. */
export function notifyArtifactsChanged() {
  window.dispatchEvent(new CustomEvent("prima:artifacts-changed"));
}
