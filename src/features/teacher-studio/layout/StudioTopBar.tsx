import { Bell, Menu, PanelRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTeacherStudio } from "../context/TeacherStudioContext";

export function StudioTopBar() {
  const {
    contextSnapshot,
    assistantOpen,
    toggleAssistant,
    setMobileNavOpen,
    unreadNotifications,
  } = useTeacherStudio();

  return (
    <header className="ts-topbar">
      <div className="ts-topbar-context">
        <p className="ts-topbar-kicker">Context curent</p>
        <p className="ts-topbar-title">
          {contextSnapshot.activeProjectTitle ??
            "Niciun proiect activ — alege unul pentru a începe"}
        </p>
      </div>

      <div className="ts-topbar-actions">
        <button
          type="button"
          className="ts-icon-btn ts-mobile-toggle"
          aria-label="Deschide navigarea"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu size={16} aria-hidden />
        </button>

        <Link to="/create/experience" className="ts-icon-btn">
          <Sparkles size={15} aria-hidden />
          Creează
        </Link>

        <Link
          to="/notifications"
          className="ts-icon-btn"
          aria-label={
            unreadNotifications
              ? `Notificări, ${unreadNotifications} necitite`
              : "Notificări"
          }
        >
          <Bell size={15} aria-hidden />
          {unreadNotifications > 0 ? (
            <span className="ts-badge">{unreadNotifications}</span>
          ) : null}
        </Link>

        <button
          type="button"
          className={["ts-icon-btn", assistantOpen ? "is-active" : ""].join(
            " ",
          )}
          aria-pressed={assistantOpen}
          aria-label="Comută asistentul PRIMA"
          onClick={toggleAssistant}
        >
          <PanelRight size={15} aria-hidden />
          PRIMA
        </button>
      </div>
    </header>
  );
}
