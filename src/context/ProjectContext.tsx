import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Project,
  ProjectFormInput,
  UpdateProjectInput,
} from "../types/project";
import type { ParsedStudioIntent } from "../types/studio";
import { projectService } from "../services/projectService";
import { studioService } from "../services/studioService";
import { sortProjectsByUpdatedAt } from "../utils/projectSearch";

type ProjectContextValue = {
  projects: Project[];
  createProject: (input: ProjectFormInput) => Project;
  createStudioProject: (intent: ParsedStudioIntent) => Project;
  updateProject: (id: string, input: UpdateProjectInput) => Project;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project;
  archiveProject: (id: string) => void;
  unarchiveProject: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isTitleTaken: (title: string, excludeId?: string) => boolean;
  getProject: (id: string) => Project | undefined;
  openProject: (id: string) => void;
  refresh: () => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

type ProjectProviderProps = {
  children: ReactNode;
};

function reload(): Project[] {
  return sortProjectsByUpdatedAt(projectService.list());
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = useState<Project[]>(() => reload());

  const refresh = useCallback(() => {
    setProjects(reload());
  }, []);

  const createProject = useCallback((input: ProjectFormInput) => {
    const project = projectService.create(input);
    setProjects(reload());
    return project;
  }, []);

  const createStudioProject = useCallback((intent: ParsedStudioIntent) => {
    const project = studioService.createProjectFromIntent(intent);
    setProjects(reload());
    return project;
  }, []);

  const updateProject = useCallback((id: string, input: UpdateProjectInput) => {
    const project = projectService.update(id, input);
    setProjects(reload());
    return project;
  }, []);

  const deleteProject = useCallback((id: string) => {
    projectService.delete(id);
    setProjects(reload());
  }, []);

  const duplicateProject = useCallback((id: string) => {
    const project = projectService.duplicate(id);
    setProjects(reload());
    return project;
  }, []);

  const archiveProject = useCallback((id: string) => {
    projectService.setArchived(id, true);
    setProjects(reload());
  }, []);

  const unarchiveProject = useCallback((id: string) => {
    projectService.setArchived(id, false);
    setProjects(reload());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    projectService.toggleFavorite(id);
    setProjects(reload());
  }, []);

  const isTitleTaken = useCallback(
    (title: string, excludeId?: string) =>
      projectService.isTitleTaken(title, excludeId),
    [],
  );

  const getProject = useCallback(
    (id: string) => projects.find((project) => project.id === id),
    [projects],
  );

  const openProject = useCallback((id: string) => {
    projectService.touch(id);
    setProjects(reload());
  }, []);

  const value = useMemo(
    () => ({
      projects,
      createProject,
      createStudioProject,
      updateProject,
      deleteProject,
      duplicateProject,
      archiveProject,
      unarchiveProject,
      toggleFavorite,
      isTitleTaken,
      getProject,
      openProject,
      refresh,
    }),
    [
      projects,
      createProject,
      createStudioProject,
      updateProject,
      deleteProject,
      duplicateProject,
      archiveProject,
      unarchiveProject,
      toggleFavorite,
      isTitleTaken,
      getProject,
      openProject,
      refresh,
    ],
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

/** Context consumer hook — colocated with provider by design */
// oxlint-disable-next-line react/only-export-components -- shared context hook
export function useProjects(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within ProjectProvider");
  }
  return context;
}
