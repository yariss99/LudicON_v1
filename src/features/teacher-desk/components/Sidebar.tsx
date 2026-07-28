import { NavLink } from "react-router-dom";
import { DESK_NAV } from "../services";

type SidebarProps = {
  onNavigate?: () => void;
};

function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside
      className="atelier-sidebar flex h-full shrink-0 flex-col"
      aria-label="Navigare principală"
    >
      <div className="atelier-sidebar-brand">
        <p className="atelier-brand-mark">PRIMA</p>
        <p className="atelier-meta mt-1.5">Atelierul Profesorului</p>
      </div>

      <nav className="atelier-nav flex-1 overflow-y-auto" aria-label="Atelierul Profesorului">
        <ul className="atelier-nav-list">
          {DESK_NAV.map((item) => {
            const Icon = item.icon;
            const end = item.href === "/";
            return (
              <li key={item.id}>
                <NavLink
                  to={item.href}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    ["atelier-nav-link", isActive ? "is-active" : ""].join(" ")
                  }
                >
                  <span className="atelier-nav-icon">
                    <Icon size={20} strokeWidth={1.65} aria-hidden />
                  </span>
                  <span>{item.label}</span>
                  <span className="atelier-nav-dot" aria-hidden />
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
