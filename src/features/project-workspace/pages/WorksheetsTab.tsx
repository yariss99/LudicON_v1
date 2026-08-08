import { WorksheetsLibrary } from "../../worksheet-studio/pages/WorksheetsLibrary";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

/**
 * Project Workspace → Worksheets tab → Worksheet Studio library.
 */
export function WorksheetsTab() {
  const { project } = useProjectWorkspace();

  return (
    <WorksheetsLibrary
      projectId={project.id}
      projectSubject={project.subject}
      projectGrade={project.grade}
    />
  );
}
