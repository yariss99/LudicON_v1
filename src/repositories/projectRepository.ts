import type { Project, ProjectStatus } from "../types/project";
import { SEED_PROJECTS } from "../data/seedProjects";
import {
  DEFAULT_PROJECT_COLOR,
  DEFAULT_PROJECT_ICON,
} from "../features/projects/constants";

const STORAGE_KEY = "prima.projects.v1";

export interface ProjectRepository {
  load(): Project[];
  save(projects: Project[]): void;
  clear(): void;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function deriveStatus(candidate: Partial<Project>): ProjectStatus {
  if (candidate.archived) return "archived";
  if (
    candidate.status === "draft" ||
    candidate.status === "active" ||
    candidate.status === "completed" ||
    candidate.status === "archived"
  ) {
    return candidate.status;
  }
  return "active";
}

function normalizeProject(value: unknown): Project | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<Project>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.title !== "string" ||
    typeof candidate.subject !== "string" ||
    typeof candidate.grade !== "string" ||
    typeof candidate.createdAt !== "string" ||
    typeof candidate.updatedAt !== "string"
  ) {
    return null;
  }

  const color =
    (candidate.coverColor as Project["color"]) ||
    (candidate.color as Project["color"]) ||
    DEFAULT_PROJECT_COLOR;
  const status = deriveStatus(candidate);

  return {
    id: candidate.id,
    title: candidate.title,
    description:
      typeof candidate.description === "string" ? candidate.description : "",
    subject: candidate.subject,
    grade: candidate.grade,
    schoolYear:
      typeof candidate.schoolYear === "string" && candidate.schoolYear
        ? candidate.schoolYear
        : "2025-2026",
    curriculum:
      typeof candidate.curriculum === "string" ? candidate.curriculum : "",
    status,
    color,
    coverColor: color,
    icon: (candidate.icon as Project["icon"]) || DEFAULT_PROJECT_ICON,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
    favorite: Boolean(candidate.favorite),
    archived: status === "archived" || Boolean(candidate.archived),
    resources: Array.isArray(candidate.resources) ? candidate.resources : [],
    state: (candidate.state as Project["state"]) || "conversation",
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

export class LocalStorageProjectRepository implements ProjectRepository {
  load(): Project[] {
    const raw = readRaw();
    if (!raw) {
      const seeded = structuredClone(SEED_PROJECTS).map((p) =>
        normalizeProject(p),
      ).filter((p): p is Project => p !== null);
      this.save(seeded);
      return seeded;
    }

    const projects = raw
      .map(normalizeProject)
      .filter((project): project is Project => project !== null);

    if (projects.length === 0) {
      const seeded = structuredClone(SEED_PROJECTS)
        .map((p) => normalizeProject(p))
        .filter((p): p is Project => p !== null);
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
