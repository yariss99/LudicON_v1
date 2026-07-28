import type { ReactNode } from "react";
import { useState } from "react";
import PrimaMark from "./PrimaMark";
import PrimaPanel from "./PrimaPanel";

type TeachingShellProps = {
  header?: ReactNode;
  children: ReactNode;
  prima: ReactNode;
  primaFooter?: ReactNode;
};

/**
 * DESIGN-001 — Continuous teaching desk: workspace + PRIMA.
 */
function TeachingShell({
  header,
  children,
  prima,
  primaFooter,
}: TeachingShellProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--prima-bg)] text-[var(--prima-text)]">
      {header ? (
        <div className="border-b border-[var(--prima-border)] bg-[var(--prima-surface)]/90 backdrop-blur">
          {header}
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 min-h-0">
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Desktop / large tablet: permanent PRIMA */}
        <div className="hidden min-h-0 w-[var(--prima-panel-width)] shrink-0 lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:self-start">
          <PrimaPanel footer={primaFooter}>{prima}</PrimaPanel>
        </div>
      </div>

      {/* Mobile / small tablet: PRIMA as sheet */}
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--prima-primary)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-hover)] lg:hidden"
        aria-label="Deschide PRIMA"
      >
        <PrimaMark size={18} pulse={false} />
        PRIMA
      </button>

      {panelOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/30"
            aria-label="Închide PRIMA"
            onClick={() => setPanelOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-hidden rounded-t-[var(--radius-lg)] bg-[var(--prima-panel)] shadow-[var(--shadow-hover)]">
            <div className="flex justify-end px-3 pt-2">
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="rounded-[var(--radius-full)] px-3 py-1 text-xs font-semibold text-[var(--prima-text-muted)]"
              >
                Închide
              </button>
            </div>
            <div className="max-h-[80dvh] overflow-y-auto">
              <PrimaPanel footer={primaFooter}>{prima}</PrimaPanel>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default TeachingShell;
