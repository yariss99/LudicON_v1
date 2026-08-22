import { Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  QUICK_CREATE_PATH,
  STUDIO_BRAND,
  STUDIO_NAV_GROUPS,
} from "../constants/navigation";
import { useTeacherStudio } from "../context/TeacherStudioContext";
import type { StudioNavItem } from "../types";

type StudioSidebarProps = {
  onNavigate?: () => void;
};

/** Query-string entries share a pathname, so compare the whole destination. */
function isActive(item: StudioNavItem, pathname: string, search: string) {
  if (!item.href) return false;
  const [path, query] = item.href.split("?");
  if (path !== pathname) return false;
  if (!query) return search === "" || pathname !== "/create";
  return search.replace(/^\?/, "") === query;
}

export function StudioSidebar({ onNavigate }: StudioSidebarProps) {
  const { mobileNavOpen, unreadNotifications, sidebarCollapsed } =
    useTeacherStudio();
  const { pathname, search } = useLocation();

  return (
    <aside
      className={[
        "ts-sidebar",
        mobileNavOpen ? "is-open" : "",
        sidebarCollapsed ? "is-collapsed" : "",
      ].join(" ")}
      aria-label="Navigare LudicON"
    >
      <Link to="/" className="ts-brand" aria-label={STUDIO_BRAND.name}>
        <span className="ts-brand-badge" aria-hidden>
          L
        </span>
        <span className="ts-brand-text">
          <span className="ts-brand-name">{STUDIO_BRAND.name}</span>
          <span className="ts-brand-meta">Atelierul profesorului</span>
        </span>
      </Link>

      <Link to={QUICK_CREATE_PATH} className="ts-side-create" onClick={onNavigate}>
        <Plus size={16} strokeWidth={2.5} aria-hidden />
        <span className="ts-side-create-text">Creează</span>
      </Link>

      <div className="ts-nav-scroll">
        {STUDIO_NAV_GROUPS.map((group) => (
          <nav
            key={group.id}
            className="ts-nav-section"
            aria-labelledby={`nav-${group.id}`}
          >
            <p id={`nav-${group.id}`} className="ts-nav-section-title">
              {group.label}
            </p>
            <ul className="ts-nav">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item, pathname, search);
                const badge =
                  item.id === "notifications" && unreadNotifications > 0
                    ? unreadNotifications
                    : null;

                if (!item.href) {
                  return (
                    <li key={item.id}>
                      <span
                        className="ts-nav-link is-soon"
                        title={`${item.label} — în curând`}
                      >
                        <Icon size={16} strokeWidth={1.75} aria-hidden />
                        <span className="ts-nav-text">{item.label}</span>
                        <span className="ts-nav-aside">În curând</span>
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <Link
                      to={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={["ts-nav-link", active ? "is-active" : ""].join(
                        " ",
                      )}
                    >
                      <Icon size={16} strokeWidth={1.75} aria-hidden />
                      <span className="ts-nav-text">{item.label}</span>
                      <span className="ts-nav-aside">
                        {badge !== null ? (
                          <span
                            className="ts-badge"
                            aria-label={`${badge} necitite`}
                          >
                            {badge}
                          </span>
                        ) : (
                          item.shortcut
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </div>

      <p className="ts-sidebar-foot">Tu conduci. Copilotul te ajută.</p>
    </aside>
  );
}
