import { StoriesLibrary } from "../../story-studio/pages/StoriesLibrary";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

/**
 * Project Workspace → Stories tab → Story Studio library.
 */
export function StoriesTab() {
  const { project } = useProjectWorkspace();

  return (
    <StoriesLibrary
      projectId={project.id}
      projectSubject={project.subject}
      projectGrade={project.grade}
    />
  );
}
