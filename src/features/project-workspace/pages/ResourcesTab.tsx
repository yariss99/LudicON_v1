import { Link } from "react-router-dom";
import { ResourceCenterPage } from "../../resource-center/ResourceCenterPage";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

/**
 * Project Workspace → Resources tab.
 * Embeds the Intelligent Resource Center scoped to the current project.
 */
export function ResourcesTab() {
  const { project } = useProjectWorkspace();

  return (
    <div>
      <div className="pw-toolbar" style={{ marginBottom: "0.75rem" }}>
        <div>
          <h2 className="pw-section-title" style={{ marginBottom: 0 }}>
            Resurse inteligente
          </h2>
          <p className="pw-lead" style={{ marginBottom: 0 }}>
            Knowledge repository pentru proiect — indexare, căutare semantică,
            graph, partajare. Nu este un file manager.
          </p>
        </div>
        <div className="pw-header-actions">
          <Link
            className="pw-btn pw-btn-primary"
            to={`/resource-center?project=${project.id}`}
          >
            Deschide pe ecran întreg
          </Link>
        </div>
      </div>
      <ResourceCenterPage embedded projectId={project.id} />
    </div>
  );
}
