import type { ReactNode } from "react";

type UpeShellProps = {
  header: ReactNode;
  left: ReactNode;
  canvas: ReactNode;
  right: ReactNode;
  bottom: ReactNode;
  bottomOpen: boolean;
};

/**
 * FEATURE-004 — Five-zone Universal Pedagogical Editor chrome.
 */
function UpeShell({
  header,
  left,
  canvas,
  right,
  bottom,
  bottomOpen,
}: UpeShellProps) {
  return (
    <div className="flex h-[100dvh] flex-col bg-[var(--prima-bg)] text-[var(--prima-text)]">
      <header className="shrink-0 border-b border-[var(--prima-border)] bg-[var(--prima-surface)]">
        {header}
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-[var(--prima-border)] bg-[var(--prima-surface)] md:block lg:w-64">
          {left}
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {canvas}
        </main>

        <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-[var(--prima-border)] bg-[var(--prima-panel)] xl:block">
          {right}
        </aside>
      </div>

      {bottomOpen ? (
        <section className="max-h-[28vh] shrink-0 overflow-hidden border-t border-[var(--prima-border)] bg-[var(--prima-surface)]">
          {bottom}
        </section>
      ) : null}
    </div>
  );
}

export default UpeShell;
