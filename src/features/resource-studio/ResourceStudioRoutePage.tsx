import { useSearchParams } from "react-router-dom";
import { ResourceStudioPage } from "./ResourceStudioPage";

/** Full-page Resource Studio — optional `?project=` scope. */
export function ResourceStudioRoutePage() {
  const [params] = useSearchParams();
  const projectId = params.get("project") || undefined;
  return <ResourceStudioPage projectId={projectId} />;
}

export default ResourceStudioRoutePage;
