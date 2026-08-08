import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Project } from "../../../types/project";
import { useProjects } from "../../../context/ProjectContext";
import { IMPORT_OPTIONS, RESOURCE_TYPES, sectionTypes } from "../constants";
import { reindexResourceStudio } from "../services/resourceCatalogIndexer";
import { resourceStudioRepository } from "../services/resourceStudioRepository";
import type {
  ResourceImportFormat,
  ResourceSortOption,
  ResourceStudioFilters,
  ResourceStudioItem,
  ResourceStudioSection,
  ResourceStudioType,
  ResourceViewMode,
} from "../types";

type AutosaveState = "idle" | "saving" | "saved" | "dirty";

type ResourceStudioContextValue = {
  projectScope: Project | null;
  projects: Project[];
  section: ResourceStudioSection;
  setSection: (section: ResourceStudioSection) => void;
  view: ResourceViewMode;
  setView: (view: ResourceViewMode) => void;
  sort: ResourceSortOption;
  setSort: (sort: ResourceSortOption) => void;
  filters: ResourceStudioFilters;
  setFilters: (patch: Partial<ResourceStudioFilters>) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selected: ResourceStudioItem | null;
  visible: ResourceStudioItem[];
  subjects: string[];
  grades: string[];
  sectionCounts: Record<ResourceStudioSection, number>;
  autosave: AutosaveState;
  lastSavedAt: string | null;
  refresh: () => void;
  updateResource: (id: string, patch: Partial<ResourceStudioItem>) => void;
  toggleFavorite: (id: string) => void;
  recordUse: (id: string) => void;
  linkReuse: (id: string, artifactId: string) => void;
  deleteResource: (id: string) => void;
  importPlaceholder: (
    format: ResourceImportFormat,
    extras?: { title?: string; href?: string },
  ) => ResourceStudioItem | null;
};

const ResourceStudioContext =
  createContext<ResourceStudioContextValue | null>(null);

const emptyFilters: ResourceStudioFilters = {
  query: "",
  type: "",
  subject: "",
  grade: "",
  tag: "",
  favoritesOnly: false,
};

export function ResourceStudioProvider({
  projectId,
  children,
}: {
  projectId?: string;
  children: ReactNode;
}) {
  const { projects, getProject } = useProjects();
  const projectScope = projectId ? getProject(projectId) ?? null : null;

  const [tick, setTick] = useState(0);
  const [section, setSection] = useState<ResourceStudioSection>("all");
  const [view, setView] = useState<ResourceViewMode>("grid");
  const [sort, setSort] = useState<ResourceSortOption>("updated");
  const [filters, setFiltersState] =
    useState<ResourceStudioFilters>(emptyFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autosave, setAutosave] = useState<AutosaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const dirtyRef = useRef(false);
  const pendingRef = useRef<ResourceStudioItem | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    reindexResourceStudio(projects);
    setTick((t) => t + 1);
  }, [projects]);

  const all = useMemo(() => {
    const list = projectId
      ? resourceStudioRepository.listByProject(projectId)
      : resourceStudioRepository.list();
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, tick, projects]);

  const refresh = useCallback(() => {
    reindexResourceStudio(projects);
    setTick((t) => t + 1);
  }, [projects]);

  const persistSoon = useCallback((item: ResourceStudioItem) => {
    // Write immediately so the UI stays in sync; debounce only the "Saved" label.
    const saved = resourceStudioRepository.save(item);
    dirtyRef.current = false;
    pendingRef.current = saved;
    setAutosave("dirty");
    setTick((t) => t + 1);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setAutosave("saved");
      setLastSavedAt(saved.updatedAt);
      pendingRef.current = null;
    }, 600);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const setFilters = useCallback((patch: Partial<ResourceStudioFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
  }, []);

  const visible = useMemo(() => {
    const typeFilter = sectionTypes(section);
    let list = all.filter((item) => {
      if (section === "favorites" && !item.favorite) return false;
      if (section === "recent") {
        if (!item.lastUsedAt && item.usageCount === 0) return false;
      }
      if (typeFilter && !typeFilter.includes(item.type)) return false;
      if (filters.favoritesOnly && !item.favorite) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.subject && item.subject !== filters.subject) return false;
      if (filters.grade && item.grade !== filters.grade) return false;
      if (filters.tag && !item.tags.includes(filters.tag)) return false;
      const q = filters.query.trim().toLowerCase();
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.projectTitle.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q)
      );
    });

    list = [...list];
    if (section === "recent" || sort === "recent") {
      list.sort((a, b) => {
        const ta = Date.parse(a.lastUsedAt ?? a.updatedAt);
        const tb = Date.parse(b.lastUsedAt ?? b.updatedAt);
        return tb - ta;
      });
    } else if (sort === "alpha") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "created") {
      list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    } else if (sort === "usage") {
      list.sort((a, b) => b.usageCount - a.usageCount);
    } else {
      list.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    }
    return list;
  }, [all, section, filters, sort]);

  const subjects = useMemo(
    () =>
      [...new Set(all.map((r) => r.subject).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [all],
  );

  const grades = useMemo(
    () =>
      [...new Set(all.map((r) => r.grade).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [all],
  );

  const sectionCounts = useMemo(() => {
    const counts = Object.fromEntries(
      [
        "all",
        "documents",
        "images",
        "worksheets",
        "lessons",
        "assessments",
        "presentations",
        "games",
        "videos",
        "audio",
        "favorites",
        "recent",
      ].map((id) => [id, 0]),
    ) as Record<ResourceStudioSection, number>;

    counts.all = all.length;
    counts.favorites = all.filter((r) => r.favorite).length;
    counts.recent = all.filter(
      (r) => Boolean(r.lastUsedAt) || r.usageCount > 0,
    ).length;

    for (const item of all) {
      const sectionForType = RESOURCE_TYPES.find(
        (t) => t.id === item.type,
      )?.section;
      if (sectionForType) counts[sectionForType] += 1;
    }
    return counts;
  }, [all]);

  const selected = useMemo(
    () => all.find((r) => r.id === selectedId) ?? null,
    [all, selectedId],
  );

  const updateResource = useCallback(
    (id: string, patch: Partial<ResourceStudioItem>) => {
      const current = resourceStudioRepository.getById(id);
      if (!current) return;
      persistSoon({ ...current, ...patch, id: current.id });
    },
    [persistSoon],
  );

  const toggleFavorite = useCallback((id: string) => {
    resourceStudioRepository.toggleFavorite(id);
    setTick((t) => t + 1);
    setAutosave("saved");
  }, []);

  const recordUse = useCallback((id: string) => {
    resourceStudioRepository.recordUse(id);
    setTick((t) => t + 1);
  }, []);

  const linkReuse = useCallback((id: string, artifactId: string) => {
    resourceStudioRepository.linkToArtifact(id, artifactId);
    setTick((t) => t + 1);
    setAutosave("saved");
  }, []);

  const deleteResource = useCallback(
    (id: string) => {
      resourceStudioRepository.delete(id);
      if (selectedId === id) setSelectedId(null);
      setTick((t) => t + 1);
    },
    [selectedId],
  );

  const importPlaceholder = useCallback(
    (
      format: ResourceImportFormat,
      extras?: { title?: string; href?: string },
    ) => {
      const project = projectScope ?? projects[0];
      if (!project) return null;
      const meta = IMPORT_OPTIONS.find((o) => o.id === format);
      if (!meta) return null;
      const item = resourceStudioRepository.create({
        title:
          extras?.title?.trim() ||
          `Imported ${meta.label} — ${new Date().toLocaleDateString()}`,
        type: meta.mapsTo,
        projectId: project.id,
        projectTitle: project.title,
        subject: project.subject,
        grade: project.grade,
        tags: ["imported", format],
        description: meta.description,
        sourceKind: format === "external_link" ? "link" : "import",
        importFormat: format,
        sourceHref: extras?.href,
      });
      setSelectedId(item.id);
      setSection(
        meta.mapsTo === "image"
          ? "images"
          : meta.mapsTo === "presentation"
            ? "presentations"
            : meta.mapsTo === "video"
              ? "videos"
              : meta.mapsTo === "audio"
                ? "audio"
                : "documents",
      );
      setTick((t) => t + 1);
      setAutosave("saved");
      return item;
    },
    [projectScope, projects],
  );

  const value = useMemo<ResourceStudioContextValue>(
    () => ({
      projectScope,
      projects,
      section,
      setSection,
      view,
      setView,
      sort,
      setSort,
      filters,
      setFilters,
      selectedId,
      setSelectedId,
      selected,
      visible,
      subjects,
      grades,
      sectionCounts,
      autosave,
      lastSavedAt,
      refresh,
      updateResource,
      toggleFavorite,
      recordUse,
      linkReuse,
      deleteResource,
      importPlaceholder,
    }),
    [
      projectScope,
      projects,
      section,
      view,
      sort,
      filters,
      setFilters,
      selectedId,
      selected,
      visible,
      subjects,
      grades,
      sectionCounts,
      autosave,
      lastSavedAt,
      refresh,
      updateResource,
      toggleFavorite,
      recordUse,
      linkReuse,
      deleteResource,
      importPlaceholder,
    ],
  );

  return (
    <ResourceStudioContext.Provider value={value}>
      {children}
    </ResourceStudioContext.Provider>
  );
}

export function useResourceStudio() {
  const ctx = useContext(ResourceStudioContext);
  if (!ctx) {
    throw new Error(
      "useResourceStudio must be used within ResourceStudioProvider",
    );
  }
  return ctx;
}

export type { ResourceStudioType };
