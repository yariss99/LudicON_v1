import type { ReactNode } from "react";
import { DESK_MAX_WIDTH_PX } from "../constants";
import "../styles/atelier.css";
import Sidebar from "./Sidebar";
import TopNavigation from "./TopNavigation";

type DeskLayoutProps = {
  mobileNavOpen: boolean;
  onMobileNavToggle: () => void;
  main: ReactNode;
};

function DeskLayout({
  mobileNavOpen,
  onMobileNavToggle,
  main,
}: DeskLayoutProps) {
  return (
    <div className="desk-production min-h-screen antialiased">
      <TopNavigation open={mobileNavOpen} onToggle={onMobileNavToggle} />

      <div
        className="atelier-shell flex min-h-screen w-full"
        style={{ maxWidth: DESK_MAX_WIDTH_PX }}
      >
        <div className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:shrink-0">
          <Sidebar />
        </div>

        {mobileNavOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden" id="desk-mobile-nav">
            <button
              type="button"
              className="absolute inset-0 bg-[var(--prima-text)]/20"
              aria-label="Închide navigarea"
              onClick={onMobileNavToggle}
            />
            <div className="relative z-50 h-full shadow-[var(--atelier-shadow-hover)]">
              <Sidebar onNavigate={onMobileNavToggle} />
            </div>
          </div>
        ) : null}

        <main className="atelier-main-pad min-w-0 flex-1">{main}</main>
      </div>
    </div>
  );
}

export default DeskLayout;
