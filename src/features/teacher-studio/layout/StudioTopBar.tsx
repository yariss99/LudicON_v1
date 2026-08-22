import { Bell, PanelLeft, PanelRight, Search, Settings, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "../../../theme";
import { useTeacherStudio } from "../context/TeacherStudioContext";

export function StudioTopBar() {
  const {
    contextSnapshot,
    assistantOpen,
    toggleAssistant,
    setMobileNavOpen,
    toggleSidebar,
    sidebarCollapsed,
    unreadNotifications,
  } = useTeacherStudio();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd + K focuses the search, which is why the hint is shown at all.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k") return;
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /** Search reuses the Projects page filter, which reads `?q=`. */
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/projects?q=${encodeURIComponent(term)}` : "/projects");
  }

  return (
    <header className="ts-topbar">
      <div className="ts-topbar-left">
        <button
          type="button"
          className="ts-icon-btn ts-icon-only"
          aria-label={
            sidebarCollapsed ? "Extinde navigarea" : "Restrânge navigarea"
          }
          aria-pressed={sidebarCollapsed}
          onClick={toggleSidebar}
        >
          <PanelLeft size={16} aria-hidden />
        </button>

        <button
          type="button"
          className="ts-icon-btn ts-icon-only ts-mobile-toggle"
          aria-label="Deschide meniul"
          onClick={() => setMobileNavOpen(true)}
        >
          <PanelLeft size={16} aria-hidden />
        </button>

        <div className="ts-topbar-context">
          <p className="ts-topbar-kicker">Context curent</p>
          <p className="ts-topbar-title">
            {contextSnapshot.activeProjectTitle ??
              "Niciun proiect activ — alege unul pentru a începe"}
          </p>
        </div>
      </div>

      <form className="ts-topbar-search" role="search" onSubmit={handleSearch}>
        <Search size={15} aria-hidden className="ts-topbar-search-icon" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Caută în proiecte…"
          aria-label="Caută în proiecte"
          aria-keyshortcuts="Control+K"
        />
        <kbd className="ts-topbar-search-hint" aria-hidden>
          Ctrl K
        </kbd>
      </form>

      <div className="ts-topbar-actions">
        <Link to="/create" className="ts-icon-btn ts-icon-primary">
          <Sparkles size={15} aria-hidden />
          Creează
        </Link>

        <Link
          to="/notifications"
          className="ts-icon-btn ts-icon-only"
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

        <ThemeToggle />

        <Link
          to="/settings"
          className="ts-icon-btn ts-icon-only"
          aria-label="Setări"
        >
          <Settings size={15} aria-hidden />
        </Link>

        <button
          type="button"
          className={["ts-icon-btn", assistantOpen ? "is-active" : ""].join(" ")}
          aria-pressed={assistantOpen}
          aria-label="Comută copilotul PRIMA"
          onClick={toggleAssistant}
        >
          <PanelRight size={15} aria-hidden />
          Copilot
        </button>
      </div>
    </header>
  );
}
