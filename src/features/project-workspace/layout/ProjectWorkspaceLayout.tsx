import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { tabFromPath, WorkspaceTabNav } from "./WorkspaceTabNav";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import "../styles/project-workspace.css";

export function ProjectWorkspaceLayout() {
  const location = useLocation();
  const { setTab } = useProjectWorkspace();

  useEffect(() => {
    setTab(tabFromPath(location.pathname));
  }, [location.pathname, setTab]);

  return (
    <div className="project-workspace">
      <div className="pw-shell">
        <Link className="pw-back" to="/projects">
          ← Înapoi la proiecte
        </Link>
        <WorkspaceHeader />
        <WorkspaceTabNav />
        <div className="pw-panel">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
