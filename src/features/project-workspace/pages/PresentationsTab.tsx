import { PresentationsLibrary } from "../../presentation-studio/pages/PresentationsLibrary";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

/**
 * Project Workspace → Presentations tab → Presentation Studio library.
 */
export function PresentationsTab() {
  const { project } = useProjectWorkspace();

  return (
    <PresentationsLibrary
      projectId={project.id}
      projectSubject={project.subject}
      projectGrade={project.grade}
    />
  );
}
