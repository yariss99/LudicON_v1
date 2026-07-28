import type { ReactNode } from "react";

type PrimaWorkspaceLayoutProps = {
  children: ReactNode;
};

function PrimaWorkspaceLayout({ children }: PrimaWorkspaceLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-20 font-sans antialiased">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-blue-50/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[760px]">{children}</div>
    </div>
  );
}

export default PrimaWorkspaceLayout;
