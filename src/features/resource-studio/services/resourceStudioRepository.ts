import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  ResourceImportFormat,
  ResourceStudioItem,
  ResourceStudioType,
} from "../types";

const KEY = "prima.resource-studio.resources.v1";

function read(): ResourceStudioItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ResourceStudioItem[];
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function write(items: ResourceStudioItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function normalize(item: ResourceStudioItem): ResourceStudioItem {
  return {
    ...item,
    title: item.title ?? "Untitled resource",
    subject: item.subject ?? "",
    grade: item.grade ?? "",
    projectId: item.projectId ?? "",
    projectTitle: item.projectTitle ?? "",
    tags: item.tags ?? [],
    favorite: Boolean(item.favorite),
    usageCount: item.usageCount ?? 0,
    linkedTo: item.linkedTo ?? [],
    description: item.description ?? "",
    contentPreview: item.contentPreview ?? "",
    sourceKind: item.sourceKind ?? "manual",
  };
}

export function stableResourceId(
  type: ResourceStudioType,
  sourceId: string,
): string {
  return `rs:${type}:${sourceId}`;
}

class ResourceStudioRepository {
  list(): ResourceStudioItem[] {
    return read().sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
  }

  listByProject(projectId: string): ResourceStudioItem[] {
    return this.list().filter((r) => r.projectId === projectId);
  }

  getById(id: string): ResourceStudioItem | undefined {
    return read().find((r) => r.id === id);
  }

  save(item: ResourceStudioItem): ResourceStudioItem {
    const next = {
      ...normalize(item),
      updatedAt: nowIso(),
    };
    const all = read();
    const index = all.findIndex((r) => r.id === next.id);
    if (index === -1) write([next, ...all]);
    else {
      const copy = [...all];
      copy[index] = next;
      write(copy);
    }
    return next;
  }

  /** Upsert indexed studio assets while preserving favorites / usage / tags. */
  upsertIndexed(items: ResourceStudioItem[]): void {
    const all = read();
    const byId = new Map(all.map((r) => [r.id, r]));
    for (const incoming of items) {
      const prev = byId.get(incoming.id);
      if (prev) {
        byId.set(incoming.id, {
          ...incoming,
          favorite: prev.favorite,
          usageCount: prev.usageCount,
          lastUsedAt: prev.lastUsedAt,
          tags: Array.from(new Set([...incoming.tags, ...prev.tags])),
          linkedTo: Array.from(
            new Set([...incoming.linkedTo, ...prev.linkedTo]),
          ),
          updatedAt: incoming.updatedAt,
        });
      } else {
        byId.set(incoming.id, normalize(incoming));
      }
    }
    write([...byId.values()]);
  }

  create(input: {
    title: string;
    type: ResourceStudioType;
    projectId: string;
    projectTitle: string;
    subject?: string;
    grade?: string;
    tags?: string[];
    description?: string;
    sourceKind?: ResourceStudioItem["sourceKind"];
    importFormat?: ResourceImportFormat;
    sourceHref?: string;
  }): ResourceStudioItem {
    const timestamp = nowIso();
    const item: ResourceStudioItem = {
      id: createId("rs"),
      title: input.title.trim() || "Untitled resource",
      subject: input.subject ?? "",
      grade: input.grade ?? "",
      projectId: input.projectId,
      projectTitle: input.projectTitle,
      type: input.type,
      createdAt: timestamp,
      updatedAt: timestamp,
      tags: input.tags ?? [],
      favorite: false,
      usageCount: 0,
      linkedTo: [],
      sourceHref: input.sourceHref,
      sourceKind: input.sourceKind ?? "manual",
      importFormat: input.importFormat,
      description: input.description ?? "",
      contentPreview: "",
    };
    write([item, ...read()]);
    return item;
  }

  update(
    id: string,
    patch: Partial<ResourceStudioItem>,
  ): ResourceStudioItem {
    const current = this.getById(id);
    if (!current) throw new Error("NOT_FOUND");
    return this.save({ ...current, ...patch, id: current.id });
  }

  toggleFavorite(id: string): ResourceStudioItem {
    const current = this.getById(id);
    if (!current) throw new Error("NOT_FOUND");
    return this.save({ ...current, favorite: !current.favorite });
  }

  recordUse(id: string, linkedArtifactId?: string): ResourceStudioItem {
    const current = this.getById(id);
    if (!current) throw new Error("NOT_FOUND");
    const linkedTo = linkedArtifactId
      ? Array.from(new Set([...current.linkedTo, linkedArtifactId]))
      : current.linkedTo;
    return this.save({
      ...current,
      usageCount: current.usageCount + 1,
      lastUsedAt: nowIso(),
      linkedTo,
    });
  }

  linkToArtifact(id: string, artifactId: string): ResourceStudioItem {
    const current = this.getById(id);
    if (!current) throw new Error("NOT_FOUND");
    if (current.linkedTo.includes(artifactId)) return current;
    return this.save({
      ...current,
      linkedTo: [...current.linkedTo, artifactId],
      usageCount: current.usageCount + 1,
      lastUsedAt: nowIso(),
    });
  }

  delete(id: string): void {
    write(read().filter((r) => r.id !== id));
  }
}

export const resourceStudioRepository = new ResourceStudioRepository();
