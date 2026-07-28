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
import type { Project } from "../../../types/project";
import {
  buildAiSuggestions,
  buildProjectCoreContext,
  computeProgress,
  exportArtifact,
  generateArtifactInProject,
} from "../services/projectCoreBridge";
import { projectWorkspaceRepository } from "../services/projectWorkspaceRepository";
import type {
  ArtifactKind,
  ArtifactVersion,
  ProjectActivityEvent,
  ProjectArtifact,
  ProjectCoreContext,
  ProjectMetadata,
  ProjectProgress,
  ProjectUnit,
  ProjectWorkspaceTabId,
  AiSuggestion,
} from "../types";

type ProjectWorkspaceContextValue = {
  readonly project: Project;
  readonly tab: ProjectWorkspaceTabId;
  readonly setTab: (tab: ProjectWorkspaceTabId) => void;
  readonly artifacts: readonly ProjectArtifact[];
  readonly units: readonly ProjectUnit[];
  readonly versions: readonly ArtifactVersion[];
  readonly activity: readonly ProjectActivityEvent[];
  readonly metadata: ProjectMetadata;
  readonly progress: ProjectProgress;
  readonly suggestions: readonly AiSuggestion[];
  readonly coreContext: ProjectCoreContext;
  readonly selectedArtifactId: string | null;
  readonly setSelectedArtifactId: (id: string | null) => void;
  readonly refresh: () => void;
  readonly createArtifact: (kind: ArtifactKind, title: string) => ProjectArtifact;
  readonly duplicateArtifact: (id: string) => void;
  readonly archiveArtifact: (id: string) => void;
  readonly markReady: (id: string) => void;
  readonly restoreVersion: (versionId: string) => void;
  readonly saveMetadata: (meta: ProjectMetadata) => void;
  readonly generateWithAi: (kind: ArtifactKind, title: string) => void;
  readonly exportArtifact: (artifactId: string) => string;
};

const ProjectWorkspaceContext =
  createContext<ProjectWorkspaceContextValue | null>(null);

export function ProjectWorkspaceProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: ReactNode;
}) {
  const { getProject, openProject } = useProjects();
  const project = getProject(projectId);
  const [tab, setTab] = useState<ProjectWorkspaceTabId>("overview");
  const [tick, setTick] = useState(0);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
    null,
  );

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!project) return;
    openProject(project.id);
    projectWorkspaceRepository.ensureDefaultUnit(project.id);
    projectWorkspaceRepository.seedIfEmpty(project.id, project.subject);
    refresh();
  }, [project?.id, project?.subject, openProject, refresh]);

  const artifacts = useMemo(
    () =>
      project
        ? projectWorkspaceRepository.listArtifacts(project.id)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project?.id, tick],
  );
  const units = useMemo(
    () => (project ? projectWorkspaceRepository.listUnits(project.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project?.id, tick],
  );
  const versions = useMemo(
    () => (project ? projectWorkspaceRepository.listVersions(project.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project?.id, tick],
  );
  const activity = useMemo(
    () => (project ? projectWorkspaceRepository.listActivity(project.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project?.id, tick],
  );
  const metadata = useMemo(
    () =>
      project
        ? projectWorkspaceRepository.getMetadata(project.id)
        : {
            competencies: [],
            tags: [],
            status: "active" as const,
          },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project?.id, tick],
  );

  if (!project) {
    return null;
  }

  const progress = computeProgress(project.id);
  const suggestions = buildAiSuggestions(project, tab);
  const coreContext = buildProjectCoreContext({
    project,
    activeTab: tab,
    activeArtifactId: selectedArtifactId ?? undefined,
  });

  const value: ProjectWorkspaceContextValue = {
    project,
    tab,
    setTab,
    artifacts,
    units,
    versions,
    activity,
    metadata,
    progress,
    suggestions,
    coreContext,
    selectedArtifactId,
    setSelectedArtifactId,
    refresh,
    createArtifact: (kind, title) => {
      const unit = projectWorkspaceRepository.ensureDefaultUnit(project.id);
      const a = projectWorkspaceRepository.createArtifact({
        projectId: project.id,
        kind,
        title,
        unitId: unit.id,
        createdBy: "teacher",
      });
      refresh();
      return a;
    },
    duplicateArtifact: (id) => {
      projectWorkspaceRepository.duplicateArtifact(id);
      refresh();
    },
    archiveArtifact: (id) => {
      projectWorkspaceRepository.archiveArtifact(id);
      refresh();
    },
    markReady: (id) => {
      projectWorkspaceRepository.updateArtifact(id, {
        status: "ready",
        note: "mark-ready",
      });
      refresh();
    },
    restoreVersion: (versionId) => {
      projectWorkspaceRepository.restoreVersion(versionId);
      refresh();
    },
    saveMetadata: (meta) => {
      projectWorkspaceRepository.saveMetadata(project.id, meta);
      refresh();
    },
    generateWithAi: (kind, title) => {
      generateArtifactInProject({
        project,
        kind,
        title,
        intent: `Generează ${kind} pentru ${project.title}`,
        activeTab: tab,
      });
      refresh();
    },
    exportArtifact: (artifactId) => {
      const uri = exportArtifact(project.id, artifactId);
      refresh();
      return uri;
    },
  };

  return (
    <ProjectWorkspaceContext.Provider value={value}>
      {children}
    </ProjectWorkspaceContext.Provider>
  );
}

export function useProjectWorkspace(): ProjectWorkspaceContextValue {
  const ctx = useContext(ProjectWorkspaceContext);
  if (!ctx) {
    throw new Error(
      "useProjectWorkspace must be used within ProjectWorkspaceProvider",
    );
  }
  return ctx;
}
