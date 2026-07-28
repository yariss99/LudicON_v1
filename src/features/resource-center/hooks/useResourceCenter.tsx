import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useProjects } from "../../../context/ProjectContext";
import { computeResourceAnalytics } from "../services/resourceAnalytics";
import {
  applyResourceAiAction,
  type ResourceCorePromptPackage,
} from "../services/resourceAiBridge";
import { buildKnowledgeGraph } from "../services/resourceGraph";
import {
  reindexKnowledgeBase,
  seedDemoMediaIfEmpty,
} from "../services/resourceIndexer";
import { resourceCenterRepository } from "../services/resourceCenterRepository";
import {
  emptyFilters,
  searchResources,
} from "../services/resourceSearch";
import type {
  KnowledgeGraph,
  KnowledgeResource,
  ResourceAiActionId,
  ResourceAnalytics,
  ResourceAssetType,
  ResourceCenterPanel,
  ResourceSearchFilters,
  ResourceSearchHit,
  ResourceSectionId,
  ResourceSharePermission,
  ResourceShareScope,
  ResourceVersion,
} from "../types";

type ResourceCenterContextValue = {
  readonly resources: readonly KnowledgeResource[];
  readonly filteredHits: readonly ResourceSearchHit[];
  readonly filters: ResourceSearchFilters;
  readonly setFilters: (patch: Partial<ResourceSearchFilters>) => void;
  readonly sectionId: ResourceSectionId;
  readonly setSectionId: (id: ResourceSectionId) => void;
  readonly panel: ResourceCenterPanel;
  readonly setPanel: (panel: ResourceCenterPanel) => void;
  readonly selectedId: string | null;
  readonly selected: KnowledgeResource | null;
  readonly selectResource: (id: string | null) => void;
  readonly versions: readonly ResourceVersion[];
  readonly graph: KnowledgeGraph;
  readonly analytics: ResourceAnalytics;
  readonly lastPrompt: ResourceCorePromptPackage | null;
  readonly lastAiMessage: string | null;
  readonly aiSuggestions: readonly ResourceSearchHit[];
  readonly projectScopeId?: string;
  readonly reindex: () => void;
  readonly saveResource: (resource: KnowledgeResource) => void;
  readonly createUpload: (input: {
    name: string;
    assetType: ResourceAssetType;
    description?: string;
  }) => KnowledgeResource;
  readonly duplicate: (id: string) => KnowledgeResource;
  readonly archive: (id: string) => void;
  readonly restoreVersion: (versionId: string) => void;
  readonly branch: (id: string, name: string) => void;
  readonly merge: (sourceId: string, targetId: string) => void;
  readonly setShare: (
    id: string,
    scope: ResourceShareScope,
    permission: ResourceSharePermission,
  ) => void;
  readonly toggleFavorite: (id: string) => void;
  readonly runAi: (action: ResourceAiActionId) => void;
  readonly recordReuse: (id: string) => void;
};

const ResourceCenterContext =
  createContext<ResourceCenterContextValue | null>(null);

export function ResourceCenterProvider({
  children,
  projectId,
  initialResourceId,
}: {
  children: ReactNode;
  projectId?: string;
  initialResourceId?: string;
}) {
  const { projects } = useProjects();
  const [tick, setTick] = useState(0);
  const [sectionId, setSectionId] = useState<ResourceSectionId>("browse");
  const [panel, setPanel] = useState<ResourceCenterPanel>("browse");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialResourceId ?? null,
  );
  const [filters, setFiltersState] = useState<ResourceSearchFilters>(
    emptyFilters({ projectId }),
  );
  const [lastPrompt, setLastPrompt] =
    useState<ResourceCorePromptPackage | null>(null);
  const [lastAiMessage, setLastAiMessage] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<ResourceSearchHit[]>([]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    reindexKnowledgeBase(projects);
    seedDemoMediaIfEmpty(projects[0]);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.map((p) => p.id).join("|")]);

  useEffect(() => {
    setFiltersState((prev) => ({ ...prev, projectId }));
  }, [projectId]);

  useEffect(() => {
    if (initialResourceId) setSelectedId(initialResourceId);
  }, [initialResourceId]);

  const resources = useMemo(() => {
    void tick;
    return resourceCenterRepository.listActive();
  }, [tick]);

  const filteredHits = useMemo(() => {
    const scoped = filters.projectId
      ? resources.filter((r) => r.projectId === filters.projectId)
      : resources;
    return searchResources(scoped.length ? scoped : resources, filters);
  }, [resources, filters]);

  const selected =
    resources.find((r) => r.id === selectedId) ??
    resourceCenterRepository.getById(selectedId ?? "") ??
    null;

  const versions = useMemo(() => {
    void tick;
    return selected
      ? resourceCenterRepository.listVersions(selected.id)
      : [];
  }, [selected, tick]);

  const graph = useMemo(
    () =>
      buildKnowledgeGraph(resources, {
        projectId: filters.projectId ?? projectId,
        focusId: selectedId ?? undefined,
      }),
    [resources, filters.projectId, projectId, selectedId],
  );

  const analytics = useMemo(
    () =>
      computeResourceAnalytics(
        projectId
          ? resources.filter((r) => r.projectId === projectId)
          : resources,
      ),
    [resources, projectId],
  );

  const selectResource = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      resourceCenterRepository.recordOpen(id);
      setSectionId("detail");
      setPanel("detail");
    }
  }, []);

  const value: ResourceCenterContextValue = {
    resources,
    filteredHits,
    filters,
    setFilters: (patch) =>
      setFiltersState((prev) => ({ ...prev, ...patch })),
    sectionId,
    setSectionId,
    panel,
    setPanel,
    selectedId,
    selected,
    selectResource,
    versions,
    graph,
    analytics,
    lastPrompt,
    lastAiMessage,
    aiSuggestions,
    projectScopeId: projectId,
    reindex: () => {
      reindexKnowledgeBase(projects);
      seedDemoMediaIfEmpty(projects[0]);
      refresh();
    },
    saveResource: (resource) => {
      resourceCenterRepository.save(resource, {
        actor: "teacher",
        note: "metadata-edit",
      });
      refresh();
    },
    createUpload: (input) => {
      const created = resourceCenterRepository.create({
        name: input.name,
        assetType: input.assetType,
        description: input.description,
        projectId,
        projectTitle: projects.find((p) => p.id === projectId)?.title,
        subject: projects.find((p) => p.id === projectId)?.subject,
        grade: projects.find((p) => p.id === projectId)?.grade,
      });
      refresh();
      setSelectedId(created.id);
      return created;
    },
    duplicate: (id) => {
      const copy = resourceCenterRepository.duplicate(id);
      refresh();
      setSelectedId(copy.id);
      return copy;
    },
    archive: (id) => {
      resourceCenterRepository.archive(id);
      if (selectedId === id) setSelectedId(null);
      refresh();
    },
    restoreVersion: (versionId) => {
      const restored = resourceCenterRepository.restoreVersion(versionId);
      refresh();
      setSelectedId(restored.id);
      setPanel("versions");
    },
    branch: (id, name) => {
      const branched = resourceCenterRepository.branch(id, name);
      refresh();
      setSelectedId(branched.id);
    },
    merge: (sourceId, targetId) => {
      const merged = resourceCenterRepository.mergeInto(sourceId, targetId);
      refresh();
      setSelectedId(merged.id);
    },
    setShare: (id, scope, permission) => {
      resourceCenterRepository.setShare(id, scope, permission);
      refresh();
      setPanel("sharing");
    },
    toggleFavorite: (id) => {
      const r = resourceCenterRepository.getById(id);
      if (!r) return;
      resourceCenterRepository.patch(
        id,
        { favorite: !r.favorite },
        { note: "favorite" },
      );
      refresh();
    },
    runAi: (action) => {
      const project = projectId
        ? projects.find((p) => p.id === projectId)
        : selected?.projectId
          ? projects.find((p) => p.id === selected.projectId)
          : projects[0];
      const result = applyResourceAiAction({
        action,
        resources,
        project,
        resource: selected ?? undefined,
        query: filters.query,
      });
      setLastPrompt(result.prompt);
      setLastAiMessage(result.message);
      setAiSuggestions([...result.suggestions]);
      setPanel("ai");
      setSectionId("ai");
      refresh();
    },
    recordReuse: (id) => {
      resourceCenterRepository.recordReuse(id);
      refresh();
    },
  };

  return (
    <ResourceCenterContext.Provider value={value}>
      {children}
    </ResourceCenterContext.Provider>
  );
}

export function useResourceCenter(): ResourceCenterContextValue {
  const ctx = useContext(ResourceCenterContext);
  if (!ctx) {
    throw new Error(
      "useResourceCenter must be used within ResourceCenterProvider",
    );
  }
  return ctx;
}
