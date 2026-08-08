import { ResourceStudioProvider } from "./hooks/useResourceStudio";
import { ResourceStudioShell } from "./components/ResourceStudioShell";

export function ResourceStudioPage({
  embedded,
  projectId,
}: {
  embedded?: boolean;
  projectId?: string;
} = {}) {
  return (
    <ResourceStudioProvider projectId={projectId}>
      <ResourceStudioShell embedded={embedded} />
    </ResourceStudioProvider>
  );
}

export default ResourceStudioPage;
