import {
  deriveClassInsights,
  deriveHistorySuggestions,
} from "../engines/classroom/insightsEngine";
import { buildEvolution } from "../engines/classroom/evolution";
import {
  searchExperiences,
  uniqueFacets,
} from "../engines/classroom/searchExperiences";
import { classroomRepository } from "../repositories/classroomRepository";
import { projectService } from "./projectService";
import type {
  ClassFeedbackNote,
  ClassroomSearchQuery,
  ExperienceVersion,
} from "../types/classroom";
import type { Project, ProjectResource } from "../types/project";

function currentSchoolYear(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based
  if (month >= 8) return `${year}–${year + 1}`;
  return `${year - 1}–${year}`;
}

function inferTopics(project: Project): string[] {
  const words = `${project.title} ${project.description}`
    .toLowerCase()
    .split(/[^a-zăâîșțéø0-9]+/i)
    .filter((w) => w.length > 3);
  return [...new Set(words)].slice(0, 5);
}

function inferMethods(resources: ProjectResource[]): string[] {
  const methods: string[] = [];
  if (resources.some((r) => r.type === "activities" && r.status !== "empty")) {
    methods.push("collaborative");
  }
  if (resources.some((r) => r.type === "game" && r.status !== "empty")) {
    methods.push("game");
  }
  if (resources.some((r) => r.type === "worksheet" && r.status !== "empty")) {
    methods.push("worksheet");
  }
  if (resources.some((r) => r.type === "assessment" && r.status !== "empty")) {
    methods.push("formative assessment");
  }
  if (resources.some((r) => r.type === "presentation" && r.status !== "empty")) {
    methods.push("presentation");
  }
  if (resources.some((r) => r.type === "reflection" && r.status !== "empty")) {
    methods.push("reflection");
  }
  return methods.length > 0 ? methods : ["lesson design"];
}

function resourcesFingerprint(resources: ProjectResource[]): string {
  return JSON.stringify(
    resources.map((r) => ({ id: r.id, type: r.type, label: r.label, status: r.status })),
  );
}

export class ClassroomService {
  private readonly repository = classroomRepository;

  getStore() {
    return this.repository.load();
  }

  listVersions(projectId?: string): ExperienceVersion[] {
    const { versions } = this.getStore();
    if (!projectId) return [...versions].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    return versions
      .filter((v) => v.projectId === projectId)
      .sort((a, b) => a.version - b.version);
  }

  listFeedback(projectId?: string): ClassFeedbackNote[] {
    const { feedback } = this.getStore();
    if (!projectId) return feedback;
    return feedback.filter((f) => f.projectId === projectId);
  }

  getInsights() {
    const { feedback } = this.getStore();
    return deriveClassInsights(feedback);
  }

  getSuggestions() {
    const store = this.getStore();
    return deriveHistorySuggestions(store.feedback, store.versions);
  }

  getEvolution(projectId: string) {
    return buildEvolution(this.getStore().versions, projectId);
  }

  search(query: ClassroomSearchQuery) {
    const store = this.getStore();
    return searchExperiences(store.versions, store.feedback, query);
  }

  getFacets() {
    return uniqueFacets(this.getStore().versions);
  }

  getVersion(versionId: string): ExperienceVersion | undefined {
    return this.getStore().versions.find((v) => v.id === versionId);
  }

  /**
   * Snapshot the current workspace. Skips if unchanged from latest version.
   */
  snapshotExperience(
    project: Project,
    options?: { label?: string; note?: string },
  ): ExperienceVersion | null {
    const store = this.getStore();
    const existing = store.versions
      .filter((v) => v.projectId === project.id)
      .sort((a, b) => b.version - a.version);
    const latest = existing[0];
    const fingerprint = resourcesFingerprint(project.resources);

    if (
      latest &&
      resourcesFingerprint(latest.resources) === fingerprint &&
      latest.title === project.title
    ) {
      return null;
    }

    const version: ExperienceVersion = {
      id: `ver_${project.id}_${Date.now()}`,
      projectId: project.id,
      version: (latest?.version ?? 0) + 1,
      savedAt: new Date().toISOString(),
      label: options?.label ?? `Version ${(latest?.version ?? 0) + 1}`,
      note: options?.note,
      title: project.title,
      subject: project.subject,
      grade: project.grade,
      resources: structuredClone(project.resources),
      topics: inferTopics(project),
      competencies: latest?.competencies ?? ["learning design"],
      methods: inferMethods(project.resources),
      schoolYear: latest?.schoolYear ?? currentSchoolYear(),
    };

    store.versions.push(version);
    this.repository.save(store);
    return version;
  }

  /** Restore a previous version into the live project — teacher decides by calling this. */
  restoreVersion(versionId: string): Project | null {
    const version = this.getVersion(versionId);
    if (!version) return null;

    const project = projectService.getById(version.projectId);
    if (!project) return null;

    return projectService.replaceResources(
      version.projectId,
      structuredClone(version.resources),
    );
  }

  addFeedback(
    note: Omit<ClassFeedbackNote, "id" | "recordedAt">,
  ): ClassFeedbackNote {
    const store = this.getStore();
    const entry: ClassFeedbackNote = {
      ...note,
      id: `fb_${Date.now()}`,
      recordedAt: new Date().toISOString(),
    };
    store.feedback.push(entry);
    this.repository.save(store);
    return entry;
  }
}

export const classroomService = new ClassroomService();
