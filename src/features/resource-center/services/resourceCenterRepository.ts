import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  KnowledgeResource,
  ResourceActor,
  ResourceAssetType,
  ResourceRelation,
  ResourceSharePermission,
  ResourceShareScope,
  ResourceValidationStatus,
  ResourceVersion,
} from "../types";

const RESOURCES_KEY = "prima.resource-center.resources.v1";
const VERSIONS_KEY = "prima.resource-center.versions.v1";

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

function recordVersion(
  doc: KnowledgeResource,
  actor: ResourceActor,
  note?: string,
): ResourceVersion {
  const entry: ResourceVersion = {
    id: createId("rcver"),
    resourceId: doc.id,
    version: doc.version,
    snapshot: doc,
    createdAt: nowIso(),
    actor,
    note,
    branchId: doc.branchId,
  };
  const all = load<ResourceVersion[]>(VERSIONS_KEY, []);
  all.unshift(entry);
  save(VERSIONS_KEY, all.slice(0, 5000));
  return entry;
}

export function createEmptyResource(input: {
  name?: string;
  description?: string;
  assetType?: ResourceAssetType;
  projectId?: string;
  projectTitle?: string;
  lessonId?: string;
  subject?: string;
  grade?: string;
  author?: string;
  createdBy?: ResourceActor;
  shareScope?: ResourceShareScope;
  sourceBuilderId?: string;
  sourceHref?: string;
  id?: string;
}): KnowledgeResource {
  const now = nowIso();
  return {
    id: input.id ?? createId("rc"),
    name: input.name?.trim() || "Resursă nouă",
    description: input.description ?? "",
    assetType: input.assetType ?? "teacher_upload",
    projectId: input.projectId,
    projectTitle: input.projectTitle,
    lessonId: input.lessonId,
    subject: input.subject ?? "",
    grade: input.grade ?? "",
    competencies: [],
    learningObjectives: [],
    curriculumRefs: [],
    tags: [],
    language: "ro-RO",
    createdAt: now,
    updatedAt: now,
    author: input.author ?? "Profesor",
    createdBy: input.createdBy ?? "teacher",
    version: 1,
    usage: { openCount: 0, reuseCount: 0 },
    relations: [],
    validationStatus: "draft",
    ai: { keywords: [], suggestedTags: [] },
    shareScope: input.shareScope ?? "personal",
    sharePermission: "read_only",
    sourceBuilderId: input.sourceBuilderId,
    sourceHref: input.sourceHref,
    archived: false,
    favorite: false,
    approvalState: "none",
  };
}

export const resourceCenterRepository = {
  listAll(): KnowledgeResource[] {
    return load<KnowledgeResource[]>(RESOURCES_KEY, []).sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
  },

  listActive(): KnowledgeResource[] {
    return this.listAll().filter((r) => !r.archived);
  },

  listByProject(projectId: string): KnowledgeResource[] {
    return this.listActive().filter((r) => r.projectId === projectId);
  },

  getById(id: string): KnowledgeResource | undefined {
    return this.listAll().find((r) => r.id === id);
  },

  upsert(
    resource: KnowledgeResource,
    options?: { actor?: ResourceActor; note?: string; bumpVersion?: boolean },
  ): KnowledgeResource {
    const all = load<KnowledgeResource[]>(RESOURCES_KEY, []);
    const idx = all.findIndex((r) => r.id === resource.id);
    const now = nowIso();
    const next: KnowledgeResource = {
      ...resource,
      updatedAt: now,
      version:
        options?.bumpVersion === false
          ? resource.version
          : idx >= 0
            ? (all[idx]?.version ?? resource.version) +
              (resource.version > (all[idx]?.version ?? 0) ? 0 : 1)
            : resource.version,
    };
    // Prefer explicit version from caller when reindexing from builders
    const saved: KnowledgeResource =
      options?.bumpVersion === false
        ? { ...resource, updatedAt: now }
        : {
            ...next,
            version:
              idx >= 0
                ? Math.max(all[idx]!.version, resource.version) +
                  (resource.updatedAt !== all[idx]!.updatedAt ||
                  resource.name !== all[idx]!.name ||
                  resource.description !== all[idx]!.description
                    ? 1
                    : 0)
                : resource.version,
          };

    if (idx >= 0) all[idx] = saved;
    else all.push(saved);
    save(RESOURCES_KEY, all);
    if (options?.bumpVersion !== false) {
      recordVersion(saved, options?.actor ?? "system", options?.note);
    }
    return saved;
  },

  save(
    resource: KnowledgeResource,
    options?: { actor?: ResourceActor; note?: string },
  ): KnowledgeResource {
    const all = load<KnowledgeResource[]>(RESOURCES_KEY, []);
    const idx = all.findIndex((r) => r.id === resource.id);
    const prev = idx >= 0 ? all[idx]! : undefined;
    const next: KnowledgeResource = {
      ...resource,
      updatedAt: nowIso(),
      version: (prev?.version ?? resource.version) + (prev ? 1 : 0) || 1,
    };
    if (idx >= 0) all[idx] = next;
    else all.push(next);
    save(RESOURCES_KEY, all);
    recordVersion(next, options?.actor ?? "teacher", options?.note ?? "save");
    return next;
  },

  create(input: Parameters<typeof createEmptyResource>[0]): KnowledgeResource {
    const doc = createEmptyResource(input);
    const all = load<KnowledgeResource[]>(RESOURCES_KEY, []);
    all.push(doc);
    save(RESOURCES_KEY, all);
    recordVersion(doc, doc.createdBy, "create");
    return doc;
  },

  patch(
    id: string,
    patch: Partial<KnowledgeResource>,
    options?: { actor?: ResourceActor; note?: string },
  ): KnowledgeResource {
    const existing = this.getById(id);
    if (!existing) throw new Error(`Resource not found: ${id}`);
    return this.save(
      { ...existing, ...patch, id: existing.id },
      options,
    );
  },

  recordOpen(id: string): KnowledgeResource | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;
    return this.upsert(
      {
        ...existing,
        usage: {
          ...existing.usage,
          openCount: existing.usage.openCount + 1,
          lastUsedAt: nowIso(),
        },
      },
      { actor: "system", note: "open", bumpVersion: false },
    );
  },

  recordReuse(id: string): KnowledgeResource | undefined {
    const existing = this.getById(id);
    if (!existing) return undefined;
    return this.upsert(
      {
        ...existing,
        usage: {
          ...existing.usage,
          reuseCount: existing.usage.reuseCount + 1,
          lastUsedAt: nowIso(),
        },
      },
      { actor: "system", note: "reuse", bumpVersion: false },
    );
  },

  archive(id: string): KnowledgeResource {
    return this.patch(id, { archived: true }, { note: "archive" });
  },

  restore(id: string): KnowledgeResource {
    return this.patch(id, { archived: false }, { note: "unarchive" });
  },

  duplicate(id: string): KnowledgeResource {
    const src = this.getById(id);
    if (!src) throw new Error(`Resource not found: ${id}`);
    const copy = createEmptyResource({
      name: `${src.name} (copie)`,
      description: src.description,
      assetType: src.assetType,
      projectId: src.projectId,
      projectTitle: src.projectTitle,
      lessonId: src.lessonId,
      subject: src.subject,
      grade: src.grade,
      author: src.author,
      createdBy: "teacher",
      shareScope: "personal",
    });
    const seeded: KnowledgeResource = {
      ...copy,
      competencies: [...src.competencies],
      learningObjectives: [...src.learningObjectives],
      curriculumRefs: [...src.curriculumRefs],
      tags: [...src.tags, "copie"],
      difficulty: src.difficulty,
      estimatedMinutes: src.estimatedMinutes,
      contentPreview: src.contentPreview,
      ai: {
        ...src.ai,
        keywords: [...src.ai.keywords],
        suggestedTags: [...src.ai.suggestedTags],
      },
      relations: [],
      parentVersionId: src.id,
    };
    const all = load<KnowledgeResource[]>(RESOURCES_KEY, []);
    all.push(seeded);
    save(RESOURCES_KEY, all);
    recordVersion(seeded, "teacher", "duplicate");
    this.recordReuse(src.id);
    return seeded;
  },

  setShare(
    id: string,
    shareScope: ResourceShareScope,
    sharePermission: ResourceSharePermission,
  ): KnowledgeResource {
    const existing = this.getById(id);
    if (!existing) throw new Error(`Resource not found: ${id}`);
    return this.patch(
      id,
      {
        shareScope,
        sharePermission,
        approvalState:
          sharePermission === "approval_required" ? "pending" : "none",
        assetType:
          shareScope === "school" || shareScope === "district"
            ? "school_shared"
            : existing.assetType === "school_shared"
              ? "teacher_upload"
              : existing.assetType,
      },
      { note: `share:${shareScope}` },
    );
  },

  setValidation(
    id: string,
    validationStatus: ResourceValidationStatus,
  ): KnowledgeResource {
    return this.patch(id, { validationStatus }, { note: "validation" });
  },

  addRelation(id: string, relation: ResourceRelation): KnowledgeResource {
    const existing = this.getById(id);
    if (!existing) throw new Error(`Resource not found: ${id}`);
    const relations = [
      ...existing.relations.filter(
        (r) => !(r.kind === relation.kind && r.targetId === relation.targetId),
      ),
      relation,
    ];
    return this.save({ ...existing, relations }, { note: "add-relation" });
  },

  listVersions(resourceId: string): ResourceVersion[] {
    return load<ResourceVersion[]>(VERSIONS_KEY, [])
      .filter((v) => v.resourceId === resourceId)
      .sort((a, b) => b.version - a.version);
  },

  restoreVersion(versionId: string): KnowledgeResource {
    const versions = load<ResourceVersion[]>(VERSIONS_KEY, []);
    const entry = versions.find((v) => v.id === versionId);
    if (!entry) throw new Error(`Version not found: ${versionId}`);
    const restored: KnowledgeResource = {
      ...entry.snapshot,
      id: entry.resourceId,
      updatedAt: nowIso(),
      version: (this.getById(entry.resourceId)?.version ?? entry.version) + 1,
    };
    return this.save(restored, {
      actor: "teacher",
      note: `restore-v${entry.version}`,
    });
  },

  branch(id: string, branchName: string): KnowledgeResource {
    const src = this.getById(id);
    if (!src) throw new Error(`Resource not found: ${id}`);
    const branched = this.duplicate(id);
    return this.patch(
      branched.id,
      {
        name: `${src.name} · branch ${branchName}`,
        branchId: createId("rcbr"),
        parentVersionId: src.id,
        tags: [...branched.tags, `branch:${branchName}`],
      },
      { note: `branch:${branchName}` },
    );
  },

  mergeInto(sourceId: string, targetId: string): KnowledgeResource {
    const source = this.getById(sourceId);
    const target = this.getById(targetId);
    if (!source || !target) throw new Error("Merge requires two resources");
    const mergedTags = Array.from(new Set([...target.tags, ...source.tags]));
    const merged: KnowledgeResource = {
      ...target,
      description:
        target.description || source.description
          ? `${target.description}\n\n---\n${source.description}`.trim()
          : target.description,
      competencies: Array.from(
        new Set([...target.competencies, ...source.competencies]),
      ),
      learningObjectives: Array.from(
        new Set([...target.learningObjectives, ...source.learningObjectives]),
      ),
      curriculumRefs: Array.from(
        new Set([...target.curriculumRefs, ...source.curriculumRefs]),
      ),
      tags: mergedTags,
      ai: {
        ...target.ai,
        keywords: Array.from(
          new Set([...target.ai.keywords, ...source.ai.keywords]),
        ),
        suggestedTags: Array.from(
          new Set([
            ...target.ai.suggestedTags,
            ...source.ai.suggestedTags,
          ]),
        ),
        duplicateOfId: undefined,
        summary:
          target.ai.summary ||
          source.ai.summary ||
          `Merge: ${source.name} → ${target.name}`,
      },
      relations: [
        ...target.relations,
        {
          id: createId("rcrel"),
          kind: "derived_from",
          targetId: source.id,
          targetLabel: source.name,
          strength: 1,
        },
      ],
    };
    const saved = this.save(merged, { note: `merge-from:${sourceId}` });
    this.archive(sourceId);
    return saved;
  },

  /** Replace indexed builder-backed resources while keeping manual uploads. */
  replaceIndexed(indexed: readonly KnowledgeResource[]): KnowledgeResource[] {
    const all = load<KnowledgeResource[]>(RESOURCES_KEY, []);
    const manual = all.filter(
      (r) =>
        !r.sourceBuilderId &&
        ![
          "lesson",
          "worksheet",
          "assessment",
          "story",
          "game",
          "presentation",
        ].includes(r.assetType),
    );
    const byId = new Map<string, KnowledgeResource>();
    for (const m of manual) byId.set(m.id, m);
    for (const r of indexed) byId.set(r.id, r);
    const next = Array.from(byId.values());
    save(RESOURCES_KEY, next);
    return next;
  },
};
