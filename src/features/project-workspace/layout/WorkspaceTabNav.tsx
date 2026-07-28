import { NavLink, useLocation, useParams } from "react-router-dom";
import { WORKSPACE_TABS } from "../constants";
import type { ProjectWorkspaceTabId } from "../types";

export function WorkspaceTabNav() {
  const { projectId = "" } = useParams();
  const location = useLocation();
  const base = location.pathname.startsWith("/projects/")
    ? `/projects/${projectId}`
    : `/studio/${projectId}`;

  return (
    <nav className="pw-tabs" aria-label="Secțiuni proiect">
      {WORKSPACE_TABS.map((tab) => (
        <NavLink
          key={tab.id}
          to={`${base}/${tab.id}`}
          className={({ isActive }) =>
            ["pw-tab", isActive ? "is-active" : ""].join(" ")
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function isWorkspaceTab(value: string): value is ProjectWorkspaceTabId {
  return WORKSPACE_TABS.some((t) => t.id === value);
}

export function tabFromPath(pathname: string): ProjectWorkspaceTabId {
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "overview";
  return isWorkspaceTab(segment) ? segment : "overview";
}
