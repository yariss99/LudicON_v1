import { Link } from "react-router-dom";
import { Bell, Menu, Search, Settings, PanelLeft, Sparkles } from "lucide-react";
import { useAiCopilot } from "../../ai-copilot";
import { useCopilot } from "../../../modules/copilot";
import { ExperienceModeSwitcher } from "../../experience-mode";
import { APP_BRAND } from "../constants/nav";
import { useAppShell } from "../hooks/useAppShell";

type Props = {
  onOpenMobileNav: () => void;
};

export function AppHeader({ onOpenMobileNav }: Props) {
  const { toggleSidebar } = useAppShell();
  const { setCommandOpen } = useAiCopilot();
  const { openPanel } = useCopilot();

  return (
    <header className="shell-header">
      <button
        type="button"
        className="shell-icon-btn shell-menu-btn"
        aria-label="Open menu"
        onClick={onOpenMobileNav}
      >
        <Menu size={18} />
      </button>

      <button
        type="button"
        className="shell-icon-btn"
        aria-label="Toggle sidebar"
        onClick={toggleSidebar}
      >
        <PanelLeft size={18} />
      </button>

      <Link to="/" className="shell-brand">
        <span className="shell-logo" aria-hidden>
          P
        </span>
        <span className="shell-brand-name">{APP_BRAND.name}</span>
      </Link>

      <label className="shell-search">
        <Search size={15} aria-hidden />
        <input
          type="search"
          placeholder="Search…  Ctrl+K"
          aria-label="Global search"
          onFocus={() => setCommandOpen(true)}
          readOnly
        />
      </label>

      <div className="shell-header-actions">
        <ExperienceModeSwitcher />
        <button
          type="button"
          className="shell-icon-btn"
          aria-label="P.R.R.I.M.A. Copilot"
          title="P.R.R.I.M.A. Copilot"
          onClick={() => openPanel()}
        >
          <Sparkles size={18} />
        </button>
        <Link
          to="/notifications"
          className="shell-icon-btn"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </Link>
        <Link to="/settings" className="shell-icon-btn" aria-label="Settings">
          <Settings size={18} />
        </Link>
        <Link
          to="/settings"
          className="shell-avatar"
          aria-label="Profile"
          title="Profile"
        >
          YO
        </Link>
      </div>
    </header>
  );
}
