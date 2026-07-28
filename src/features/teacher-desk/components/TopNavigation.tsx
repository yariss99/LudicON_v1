import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { PrimaMark } from "../../../design-system";

type TopNavigationProps = {
  open: boolean;
  onToggle: () => void;
};

function TopNavigation({ open, onToggle }: TopNavigationProps) {
  return (
    <header className="flex items-center justify-between border-b border-[rgba(15,23,42,0.04)] bg-[var(--atelier-surface)] px-4 py-3 lg:hidden">
      <Link to="/" className="flex items-center gap-2.5 no-underline">
        <PrimaMark size={28} />
        <span className="atelier-card-title">PRIMA</span>
      </Link>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="desk-mobile-nav"
        aria-label={open ? "Închide navigarea" : "Deschide navigarea"}
        className="min-h-[var(--touch-min)] min-w-[var(--touch-min)] rounded-[var(--atelier-radius-sm)] p-2 text-[var(--prima-text-muted)] transition-colors duration-[var(--atelier-motion)] hover:bg-[var(--atelier-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--prima-primary)]"
      >
        {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
      </button>
    </header>
  );
}

export default TopNavigation;
