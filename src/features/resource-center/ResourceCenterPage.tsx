import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ResourceCenterProvider,
  useResourceCenter,
} from "./hooks/useResourceCenter";
import { ResourceCenterHeader } from "./components/ResourceCenterHeader";
import { ResourceSectionNav } from "./components/ResourceSectionNav";
import { ResourceMainPane } from "./components/ResourceMainPane";
import { ResourceSideRail } from "./components/ResourceSideRail";
import "./styles/resource-center.css";

function ResourceCenterShell({ embedded }: { embedded?: boolean }) {
  return (
    <div
      className={["resource-center", embedded ? "rc-embedded" : ""].join(" ")}
    >
      <div className="rc-shell">
        <ResourceCenterHeader embedded={embedded} />
        <div className="rc-body">
          <ResourceSectionNav />
          <main className="rc-main">
            <ResourceMainPane />
          </main>
          <ResourceSideRail />
        </div>
      </div>
    </div>
  );
}

/** Full page: `/resource-center` or `/resource-center/:resourceId` */
export function ResourceCenterPage({
  embedded,
  projectId: projectIdProp,
}: {
  embedded?: boolean;
  projectId?: string;
} = {}) {
  const { resourceId = "" } = useParams();
  const [params] = useSearchParams();
  const projectId = projectIdProp || params.get("project") || undefined;

  return (
    <ResourceCenterProvider
      projectId={projectId}
      initialResourceId={resourceId || undefined}
    >
      <ResourceCenterShell embedded={embedded} />
    </ResourceCenterProvider>
  );
}

/** Focused detail route helper when resource missing after load */
export function ResourceCenterMissing() {
  const { selectedId } = useResourceCenter();
  return (
    <div className="resource-center">
      <div className="rc-empty" style={{ margin: "4rem auto", maxWidth: 420 }}>
        <h1 className="rc-section-title">Resursă negăsită</h1>
        <p className="rc-lead">ID: {selectedId ?? "—"}</p>
        <Link className="rc-btn rc-btn-primary" to="/resource-center">
          Înapoi la Resource Center
        </Link>
      </div>
    </div>
  );
}

export default ResourceCenterPage;
