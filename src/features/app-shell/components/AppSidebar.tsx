import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { APP_NAV } from "../constants/nav";
import { useAppShell } from "../hooks/useAppShell";

type Props = {
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

export function AppSidebar({ mobileOpen, onNavigate }: Props) {
  const { sidebarCollapsed, toggleSidebar } = useAppShell();

  return (
    <aside
      className={[
        "shell-sidebar",
        mobileOpen ? "is-mobile-open" : "",
      ].join(" ")}
      aria-label="Primary"
    >
      <nav className="shell-nav">
        {APP_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                ["shell-nav-item", isActive ? "is-active" : ""].join(" ")
              }
              title={item.label}
              onClick={onNavigate}
            >
              <Icon size={18} aria-hidden />
              <span className="shell-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="shell-sidebar-foot">
        <button
          type="button"
          className="shell-collapse-btn"
          onClick={toggleSidebar}
          aria-pressed={sidebarCollapsed}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronsRight size={16} aria-hidden />
          ) : (
            <ChevronsLeft size={16} aria-hidden />
          )}
          <span className="shell-collapse-label">
            {sidebarCollapsed ? "Expand" : "Collapse"}
          </span>
        </button>
      </div>
    </aside>
  );
}
