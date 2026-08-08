import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppShellProvider, useAppShell } from "./hooks/useAppShell";
import { AppHeader } from "./components/AppHeader";
import { AppSidebar } from "./components/AppSidebar";
import "./styles/app-shell.css";

function ShellFrame() {
  const { sidebarCollapsed } = useAppShell();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <div className="shell-frame">
        <AppHeader onOpenMobileNav={() => setMobileOpen(true)} />
        <div
          className={[
            "shell-body",
            sidebarCollapsed ? "is-collapsed" : "",
          ].join(" ")}
        >
          {mobileOpen ? (
            <button
              type="button"
              className="shell-overlay is-open"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
          ) : null}
          <AppSidebar
            mobileOpen={mobileOpen}
            onNavigate={() => setMobileOpen(false)}
          />
          <main className="shell-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export function AppShellLayout() {
  return (
    <AppShellProvider>
      <ShellFrame />
    </AppShellProvider>
  );
}
