import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { WorkspaceBreadcrumb } from "../components/WorkspaceBreadcrumb";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { tabFromPath, WorkspaceTabNav } from "./WorkspaceTabNav";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import "../styles/project-workspace.css";

export function ProjectWorkspaceLayout() {
  const location = useLocation();
  const { project, setTab } = useProjectWorkspace();

  useEffect(() => {
    setTab(tabFromPath(location.pathname));
  }, [location.pathname, setTab]);

  return (
    <div className="project-workspace">
      <div className="pw-shell">
        <WorkspaceBreadcrumb projectTitle={project.title} />
        <WorkspaceHeader />
        <WorkspaceTabNav />
        <div className="pw-panel">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
