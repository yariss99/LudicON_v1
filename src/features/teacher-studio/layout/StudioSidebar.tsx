import { NavLink } from "react-router-dom";
import { STUDIO_BRAND, STUDIO_NAV } from "../constants/navigation";
import { useTeacherStudio } from "../context/TeacherStudioContext";

type StudioSidebarProps = {
  onNavigate?: () => void;
};

export function StudioSidebar({ onNavigate }: StudioSidebarProps) {
  const { mobileNavOpen, unreadNotifications } = useTeacherStudio();

  return (
    <aside
      className={["ts-sidebar", mobileNavOpen ? "is-open" : ""].join(" ")}
      aria-label="Navigare Teacher Studio"
    >
      <div className="ts-brand">
        <p className="ts-brand-mark">{STUDIO_BRAND.name}</p>
        <p className="ts-brand-meta">{STUDIO_BRAND.workspaceRo}</p>
      </div>

      <nav aria-label="Zone Studio">
        <ul className="ts-nav">
          {STUDIO_NAV.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.href}
                end={item.href === "/"}
                onClick={onNavigate}
                className={({ isActive }) =>
                  ["ts-nav-link", isActive ? "is-active" : ""].join(" ")
                }
              >
                <span>{item.label}</span>
                <span className="ts-nav-shortcut">
                  {item.id === "notifications" && unreadNotifications > 0 ? (
                    <span className="ts-badge" aria-label={`${unreadNotifications} necitite`}>
                      {unreadNotifications}
                    </span>
                  ) : (
                    item.shortcut
                  )}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
