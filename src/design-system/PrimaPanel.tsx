import type { ReactNode } from "react";
import PrimaMark from "./PrimaMark";

type PrimaPanelProps = {
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * DESIGN-001 — Permanent right rail. Observes, suggests, never interrupts.
 */
function PrimaPanel({ children, footer }: PrimaPanelProps) {
  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col border-l border-[var(--prima-border)] bg-[var(--prima-panel)]"
      style={{ maxWidth: "var(--prima-panel-width)" }}
      aria-label="PRIMA"
    >
      <div className="flex items-center gap-2.5 border-b border-[var(--prima-border)] px-4 py-3.5">
        <PrimaMark size={24} />
        <div>
          <p className="text-sm font-semibold tracking-tight text-[var(--prima-text)]">
            PRIMA
          </p>
          <p className="text-[11px] text-[var(--prima-text-muted)]">
            Alături de tine în lecție
          </p>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {children}
      </div>
      {footer ? (
        <div className="border-t border-[var(--prima-border)] px-4 py-3">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

export default PrimaPanel;
