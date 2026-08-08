import { LessonsLibrary } from "../../lesson-studio/pages/LessonsLibrary";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

/**
 * Project Workspace → Lessons tab → Lesson Studio library.
 */
export function LessonsTab() {
  const { project } = useProjectWorkspace();

  return (
    <LessonsLibrary
      projectId={project.id}
      projectSubject={project.subject}
      projectGrade={project.grade}
    />
  );
}
