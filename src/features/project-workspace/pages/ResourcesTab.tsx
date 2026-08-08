import { ResourceStudioPage } from "../../resource-studio/ResourceStudioPage";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

/**
 * Project Workspace → Resources tab → Resource Studio library.
 */
export function ResourcesTab() {
  const { project } = useProjectWorkspace();

  return <ResourceStudioPage embedded projectId={project.id} />;
}
