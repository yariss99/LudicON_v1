import { projectRepository } from "../repositories/projectRepository";
import type {
  Project,
  ProjectFormInput,
  ProjectResourceStatus,
  ProjectResourceType,
  ProjectStatus,
  UpdateProjectInput,
} from "../types/project";
import { createId } from "../utils/id";
import { nowIso } from "../utils/date";
import {
  DEFAULT_PROJECT_COLOR,
  DEFAULT_PROJECT_ICON,
} from "../features/projects/constants";

function emptyResources(): Project["resources"] {
  return [
    { id: "ls", type: "lesson", label: "Lessons", status: "empty" },
    { id: "ws", type: "worksheet", label: "Worksheets", status: "empty" },
    { id: "as", type: "assessment", label: "Assessments", status: "empty" },
    { id: "gm", type: "game", label: "Games", status: "empty" },
    { id: "st", type: "story", label: "Stories", status: "empty" },
    { id: "pr", type: "presentation", label: "Presentations", status: "empty" },
    { id: "rs", type: "resources", label: "Resources", status: "empty" },
  ];
}

function normalizeTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function withStatusFlags(
  status: ProjectStatus,
): Pick<Project, "status" | "archived"> {
  return {
    status,
    archived: status === "archived",
  };
}

export class ProjectService {
  private readonly repository: typeof projectRepository;

  constructor(repository = projectRepository) {
    this.repository = repository;
  }

  list(): Project[] {
    return this.repository.load();
  }

  getById(id: string): Project | undefined {
    return this.list().find((project) => project.id === id);
  }

  isTitleTaken(title: string, excludeId?: string): boolean {
    const normalized = normalizeTitle(title);
    if (!normalized) return false;
    return this.list().some(
      (project) =>
        project.id !== excludeId &&
        normalizeTitle(project.title) === normalized,
    );
  }

  create(input: ProjectFormInput): Project {
    const title = input.title.trim();
    if (!title) throw new Error("TITLE_REQUIRED");
    if (this.isTitleTaken(title)) throw new Error("EXISTS_TITLE");

    const timestamp = nowIso();
    const color = input.color || DEFAULT_PROJECT_COLOR;
    const status = input.status || "draft";
    const project: Project = {
      id: createId("prj"),
      title,
      subject: input.subject.trim(),
      grade: input.grade.trim(),
      description: input.description.trim(),
      schoolYear: input.schoolYear.trim() || "2025-2026",
      curriculum: input.curriculum.trim(),
      ...withStatusFlags(status),
      color,
      coverColor: color,
      icon: input.icon || DEFAULT_PROJECT_ICON,
      favorite: Boolean(input.favorite),
      createdAt: timestamp,
      updatedAt: timestamp,
      resources: emptyResources(),
      state: "conversation",
    };

    this.repository.save([project, ...this.list()]);
    return project;
  }

  update(id: string, input: UpdateProjectInput): Project {
    const projects = this.list();
    const existing = projects.find((project) => project.id === id);
    if (!existing) throw new Error("NOT_FOUND");

    const title = input.title.trim();
    if (!title) throw new Error("TITLE_REQUIRED");
    if (this.isTitleTaken(title, id)) throw new Error("EXISTS_TITLE");

    const color = input.color || existing.color;
    const status = input.status || existing.status;
    const updated: Project = {
      ...existing,
      title,
      subject: input.subject.trim(),
      grade: input.grade.trim(),
      description: input.description.trim(),
      schoolYear: input.schoolYear.trim() || existing.schoolYear,
      curriculum: input.curriculum.trim(),
      ...withStatusFlags(status),
      color,
      coverColor: color,
      icon: input.icon || existing.icon,
      favorite: Boolean(input.favorite),
      updatedAt: nowIso(),
    };

    this.repository.save(
      projects.map((project) => (project.id === id ? updated : project)),
    );
    return updated;
  }

  delete(id: string): void {
    this.repository.save(this.list().filter((project) => project.id !== id));
  }

  duplicate(id: string): Project {
    const source = this.getById(id);
    if (!source) throw new Error("NOT_FOUND");

    const timestamp = nowIso();
    const title = this.nextUniqueTitle(`${source.title} (copie)`);
    const duplicate: Project = {
      ...structuredClone(source),
      id: createId("prj"),
      title,
      favorite: false,
      ...withStatusFlags("draft"),
      createdAt: timestamp,
      updatedAt: timestamp,
      state: "conversation",
    };

    this.repository.save([duplicate, ...this.list()]);
    return duplicate;
  }

  setStatus(id: string, status: ProjectStatus): Project {
    return this.patch(id, {
      ...withStatusFlags(status),
      updatedAt: nowIso(),
    });
  }

  setArchived(id: string, archived: boolean): Project {
    return this.setStatus(id, archived ? "archived" : "active");
  }

  setFavorite(id: string, favorite: boolean): Project {
    return this.patch(id, { favorite, updatedAt: nowIso() });
  }

  toggleFavorite(id: string): Project {
    const existing = this.getById(id);
    if (!existing) throw new Error("NOT_FOUND");
    return this.setFavorite(id, !existing.favorite);
  }

  touch(id: string): Project {
    return this.patch(id, { updatedAt: nowIso() });
  }

  replaceResources(
    projectId: string,
    resources: Project["resources"],
  ): Project {
    return this.patch(projectId, {
      resources,
      updatedAt: nowIso(),
      state: "conversation",
    });
  }

  markResourceStatus(
    projectId: string,
    type: ProjectResourceType,
    status: ProjectResourceStatus,
    label?: string,
  ): Project {
    const existing = this.getById(projectId);
    if (!existing) throw new Error("NOT_FOUND");

    const resources = existing.resources.map((resource) =>
      resource.type === type
        ? {
            ...resource,
            status,
            label: label?.trim() || resource.label,
          }
        : resource,
    );

    const hasType = resources.some((resource) => resource.type === type);
    const nextResources = hasType
      ? resources
      : [
          ...resources,
          {
            id: type,
            type,
            label: label?.trim() || "Lecție",
            status,
          },
        ];

    return this.patch(projectId, {
      resources: nextResources,
      updatedAt: nowIso(),
      state:
        status === "ready" && type === "lesson"
          ? "resources_ready"
          : existing.state,
    });
  }

  private patch(id: string, changes: Partial<Omit<Project, "id">>): Project {
    const projects = this.list();
    const existing = projects.find((project) => project.id === id);
    if (!existing) throw new Error("NOT_FOUND");

    const updated: Project = { ...existing, ...changes };
    this.repository.save(
      projects.map((project) => (project.id === id ? updated : project)),
    );
    return updated;
  }

  private nextUniqueTitle(base: string): string {
    if (!this.isTitleTaken(base)) return base;
    let index = 2;
    while (this.isTitleTaken(`${base} ${index}`)) index += 1;
    return `${base} ${index}`;
  }
}

export const projectService = new ProjectService();

export function loadProjects(): Project[] {
  return projectService.list();
}

export function saveProjects(projects: Project[]): void {
  projectRepository.save(projects);
}

export function createProject(input: ProjectFormInput): Project {
  return projectService.create(input);
}

export function findProjectById(
  projects: readonly Project[],
  id: string,
): Project | undefined {
  return projects.find((project) => project.id === id);
}

export function touchProject(project: Project): Project {
  return { ...project, updatedAt: nowIso() };
}
