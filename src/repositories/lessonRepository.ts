import type { Lesson, LessonDraft } from "../types/lesson";

const LESSONS_KEY = "prima.lessons.v1";
const draftKey = (projectId: string) => `prima.lesson-draft.v1.${projectId}`;

export interface LessonRepository {
  loadAll(): Lesson[];
  saveAll(lessons: Lesson[]): void;
  loadDraft(projectId: string): LessonDraft | null;
  saveDraft(draft: LessonDraft): void;
  clearDraft(projectId: string): void;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function isLesson(value: unknown): value is Lesson {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Lesson>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.projectId === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.style === "string" &&
    typeof candidate.status === "string" &&
    candidate.content !== undefined
  );
}

function isDraft(value: unknown): value is LessonDraft {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LessonDraft>;
  return (
    typeof candidate.projectId === "string" &&
    typeof candidate.currentStep === "number" &&
    candidate.general !== undefined &&
    candidate.curriculum !== undefined &&
    candidate.teaching !== undefined
  );
}

export class LocalStorageLessonRepository implements LessonRepository {
  loadAll(): Lesson[] {
    if (!isBrowser()) return [];
    try {
      const raw = localStorage.getItem(LESSONS_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isLesson);
    } catch {
      return [];
    }
  }

  saveAll(lessons: Lesson[]): void {
    if (!isBrowser()) return;
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  }

  loadDraft(projectId: string): LessonDraft | null {
    if (!isBrowser()) return null;
    try {
      const raw = localStorage.getItem(draftKey(projectId));
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      return isDraft(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  saveDraft(draft: LessonDraft): void {
    if (!isBrowser()) return;
    localStorage.setItem(draftKey(draft.projectId), JSON.stringify(draft));
  }

  clearDraft(projectId: string): void {
    if (!isBrowser()) return;
    localStorage.removeItem(draftKey(projectId));
  }
}

export const lessonRepository: LessonRepository =
  new LocalStorageLessonRepository();
