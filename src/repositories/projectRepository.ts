import type { Project } from "../types/project";
import { SEED_PROJECTS } from "../data/seedProjects";

const STORAGE_KEY = "prima.projects.v1";

export interface ProjectRepository {
  load(): Project[];
  save(projects: Project[]): void;
  clear(): void;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function normalizeProject(value: unknown): Project | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<Project>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.title !== "string" ||
    typeof candidate.subject !== "string" ||
    typeof candidate.grade !== "string" ||
    typeof candidate.color !== "string" ||
    typeof candidate.icon !== "string" ||
    typeof candidate.createdAt !== "string" ||
    typeof candidate.updatedAt !== "string" ||
    typeof candidate.description !== "string" ||
    !Array.isArray(candidate.resources) ||
    typeof candidate.state !== "string"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    title: candidate.title,
    description: candidate.description,
    subject: candidate.subject,
    grade: candidate.grade,
    color: candidate.color,
    icon: candidate.icon,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
    favorite: Boolean(candidate.favorite),
    archived: Boolean(candidate.archived),
    resources: candidate.resources,
    state: candidate.state,
  };
}

function readRaw(): unknown[] | null {
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * LocalStorage-backed repository.
 * Swap this implementation for an API repository later — ProjectService stays stable.
 */
export class LocalStorageProjectRepository implements ProjectRepository {
  load(): Project[] {
    const raw = readRaw();
    if (!raw) {
      const seeded = structuredClone(SEED_PROJECTS);
      this.save(seeded);
      return seeded;
    }

    const projects = raw
      .map(normalizeProject)
      .filter((project): project is Project => project !== null);

    if (projects.length === 0) {
      const seeded = structuredClone(SEED_PROJECTS);
      this.save(seeded);
      return seeded;
    }

    return projects;
  }

  save(projects: Project[]): void {
    if (!isBrowser()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  clear(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const projectRepository: ProjectRepository =
  new LocalStorageProjectRepository();
