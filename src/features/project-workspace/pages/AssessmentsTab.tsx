import { AssessmentsLibrary } from "../../assessment-studio/pages/AssessmentsLibrary";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

/**
 * Project Workspace → Assessments tab → Assessment Studio library.
 */
export function AssessmentsTab() {
  const { project } = useProjectWorkspace();

  return (
    <AssessmentsLibrary
      projectId={project.id}
      projectSubject={project.subject}
      projectGrade={project.grade}
    />
  );
}
