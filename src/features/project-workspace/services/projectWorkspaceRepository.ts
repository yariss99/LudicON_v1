import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  ArtifactActor,
  ArtifactKind,
  ArtifactStatus,
  ArtifactVersion,
  ProjectActivityEvent,
  ProjectArtifact,
  ProjectMetadata,
  ProjectUnit,
} from "../types";

const ARTIFACTS_KEY = "prima.project-workspace.artifacts.v1";
const VERSIONS_KEY = "prima.project-workspace.versions.v1";
const ACTIVITY_KEY = "prima.project-workspace.activity.v1";
const UNITS_KEY = "prima.project-workspace.units.v1";
const META_KEY = "prima.project-workspace.meta.v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function pushActivity(
  event: Omit<ProjectActivityEvent, "id" | "timestamp">,
): ProjectActivityEvent {
  const full: ProjectActivityEvent = {
    ...event,
    id: createId("pact"),
    timestamp: nowIso(),
  };
  const all = load<ProjectActivityEvent[]>(ACTIVITY_KEY, []);
  all.unshift(full);
  save(ACTIVITY_KEY, all.slice(0, 500));
  return full;
}

export const projectWorkspaceRepository = {
  listArtifacts(projectId: string): ProjectArtifact[] {
    return load<ProjectArtifact[]>(ARTIFACTS_KEY, []).filter(
      (a) => a.projectId === projectId,
    );
  },

  getArtifact(id: string): ProjectArtifact | undefined {
    return load<ProjectArtifact[]>(ARTIFACTS_KEY, []).find((a) => a.id === id);
  },

  createArtifact(input: {
    projectId: string;
    kind: ArtifactKind;
    title: string;
    unitId?: string;
    payload?: Record<string, unknown>;
    createdBy?: ArtifactActor;
    tags?: string[];
  }): ProjectArtifact {
    const now = nowIso();
    const artifact: ProjectArtifact = {
      id: createId("part"),
      projectId: input.projectId,
      kind: input.kind,
      title: input.title.trim() || ARTIFACT_KIND_LABEL_FALLBACK(input.kind),
      status: "draft",
      unitId: input.unitId,
      payload: Object.freeze({ ...(input.payload ?? {}) }),
      version: 1,
      tags: Object.freeze([...(input.tags ?? [])]),
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy ?? "teacher",
    };
    const all = load<ProjectArtifact[]>(ARTIFACTS_KEY, []);
    all.push(artifact);
    save(ARTIFACTS_KEY, all);
    this.recordVersion(artifact, input.createdBy ?? "teacher", "create");
    pushActivity({
      projectId: input.projectId,
      kind: input.createdBy === "ai" ? "ai_action" : "teacher_action",
      title: `Creat: ${artifact.title}`,
      detail: `${input.kind} · v1`,
      actor: input.createdBy ?? "teacher",
      artifactId: artifact.id,
    });
    return artifact;
  },

  updateArtifact(
    id: string,
    patch: {
      title?: string;
      status?: ArtifactStatus;
      payload?: Record<string, unknown>;
      tags?: string[];
      actor?: ArtifactActor;
      note?: string;
    },
  ): ProjectArtifact {
    const all = load<ProjectArtifact[]>(ARTIFACTS_KEY, []);
    const idx = all.findIndex((a) => a.id === id);
    if (idx < 0) throw new Error(`Artifact not found: ${id}`);
    const current = all[idx]!;
    const next: ProjectArtifact = {
      ...current,
      title: patch.title?.trim() || current.title,
      status: patch.status ?? current.status,
      payload: Object.freeze({
        ...(current.payload as Record<string, unknown>),
        ...(patch.payload ?? {}),
      }),
      tags: Object.freeze(patch.tags ? [...patch.tags] : [...current.tags]),
      version: current.version + 1,
      updatedAt: nowIso(),
    };
    all[idx] = next;
    save(ARTIFACTS_KEY, all);
    this.recordVersion(next, patch.actor ?? "teacher", patch.note ?? "update");
    pushActivity({
      projectId: next.projectId,
      kind: "version",
      title: `Versiune ${next.version}: ${next.title}`,
      detail: patch.note ?? "Actualizare",
      actor: patch.actor ?? "teacher",
      artifactId: next.id,
    });
    return next;
  },

  duplicateArtifact(id: string): ProjectArtifact {
    const source = this.getArtifact(id);
    if (!source) throw new Error(`Artifact not found: ${id}`);
    return this.createArtifact({
      projectId: source.projectId,
      kind: source.kind,
      title: `${source.title} (copie)`,
      unitId: source.unitId,
      payload: { ...(source.payload as object) },
      tags: [...source.tags],
      createdBy: "teacher",
    });
  },

  archiveArtifact(id: string): ProjectArtifact {
    return this.updateArtifact(id, {
      status: "archived",
      note: "archive",
      actor: "teacher",
    });
  },

  recordVersion(
    artifact: ProjectArtifact,
    actor: ArtifactActor,
    note?: string,
  ): ArtifactVersion {
    const entry: ArtifactVersion = {
      id: createId("pver"),
      artifactId: artifact.id,
      projectId: artifact.projectId,
      version: artifact.version,
      snapshot: artifact,
      createdAt: nowIso(),
      actor,
      note,
    };
    const all = load<ArtifactVersion[]>(VERSIONS_KEY, []);
    all.unshift(entry);
    save(VERSIONS_KEY, all.slice(0, 2000));
    return entry;
  },

  listVersions(projectId: string, artifactId?: string): ArtifactVersion[] {
    return load<ArtifactVersion[]>(VERSIONS_KEY, []).filter(
      (v) =>
        v.projectId === projectId &&
        (!artifactId || v.artifactId === artifactId),
    );
  },

  restoreVersion(versionId: string): ProjectArtifact {
    const versions = load<ArtifactVersion[]>(VERSIONS_KEY, []);
    const entry = versions.find((v) => v.id === versionId);
    if (!entry) throw new Error(`Version not found: ${versionId}`);
    const snap = entry.snapshot;
    return this.updateArtifact(snap.id, {
      title: snap.title,
      status: snap.status,
      payload: { ...(snap.payload as object) },
      tags: [...snap.tags],
      actor: "teacher",
      note: `restore v${entry.version}`,
    });
  },

  compareVersions(
    aId: string,
    bId: string,
  ): { a?: ArtifactVersion; b?: ArtifactVersion } {
    const versions = load<ArtifactVersion[]>(VERSIONS_KEY, []);
    return {
      a: versions.find((v) => v.id === aId),
      b: versions.find((v) => v.id === bId),
    };
  },

  listActivity(projectId: string): ProjectActivityEvent[] {
    return load<ProjectActivityEvent[]>(ACTIVITY_KEY, []).filter(
      (e) => e.projectId === projectId,
    );
  },

  addActivity(
    event: Omit<ProjectActivityEvent, "id" | "timestamp">,
  ): ProjectActivityEvent {
    return pushActivity(event);
  },

  listUnits(projectId: string): ProjectUnit[] {
    return load<ProjectUnit[]>(UNITS_KEY, [])
      .filter((u) => u.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  },

  ensureDefaultUnit(projectId: string): ProjectUnit {
    const existing = this.listUnits(projectId);
    if (existing[0]) return existing[0];
    const unit: ProjectUnit = {
      id: createId("punit"),
      projectId,
      title: "Unitate 1",
      order: 1,
      description: "Unitate didactică principală",
    };
    const all = load<ProjectUnit[]>(UNITS_KEY, []);
    all.push(unit);
    save(UNITS_KEY, all);
    return unit;
  },

  getMetadata(projectId: string): ProjectMetadata {
    const map = load<Record<string, ProjectMetadata>>(META_KEY, {});
    return (
      map[projectId] ?? {
        competencies: [],
        tags: [],
        status: "active",
        schoolYear: "2025-2026",
        semester: "1",
      }
    );
  },

  saveMetadata(projectId: string, meta: ProjectMetadata): ProjectMetadata {
    const map = load<Record<string, ProjectMetadata>>(META_KEY, {});
    map[projectId] = meta;
    save(META_KEY, map);
    pushActivity({
      projectId,
      kind: "teacher_action",
      title: "Setări proiect actualizate",
      detail: "Metadate salvate",
      actor: "teacher",
    });
    return meta;
  },

  seedIfEmpty(projectId: string, _subject: string): void {
    // New projects start empty — hub cards show 0 until the teacher creates resources.
    this.ensureDefaultUnit(projectId);
  },
};

function ARTIFACT_KIND_LABEL_FALLBACK(kind: ArtifactKind): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}
