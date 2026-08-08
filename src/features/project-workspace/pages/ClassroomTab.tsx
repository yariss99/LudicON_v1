import { ClassroomStudioPage } from "../../classroom-studio/ClassroomStudioPage";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

/**
 * Project Workspace → Classroom tab → Classroom Studio hub.
 */
export function ClassroomTab() {
  const { project } = useProjectWorkspace();
  return <ClassroomStudioPage embedded projectId={project.id} />;
}
