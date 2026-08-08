import { GamesLibrary } from "../../game-studio/pages/GamesLibrary";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

/**
 * Project Workspace → Games tab → Game Studio library.
 */
export function GamesTab() {
  const { project } = useProjectWorkspace();

  return (
    <GamesLibrary
      projectId={project.id}
      projectSubject={project.subject}
      projectGrade={project.grade}
    />
  );
}
