import type { ReactNode } from "react";
import AppNav from "./AppNav";

type AppShellProps = {
  children: ReactNode;
  /** Partner mode: quieter canvas, tighter reading width */
  variant?: "studio" | "partner";
};

function AppShell({ children, variant = "studio" }: AppShellProps) {
  return (
    <div
      className={[
        "min-h-screen font-sans text-slate-900 antialiased",
        variant === "partner" ? "bg-white" : "bg-[#F8FAFC]",
      ].join(" ")}
    >
      <AppNav />
      <main className="min-h-screen pl-[72px] lg:pl-60">
        <div
          className={[
            "mx-auto w-full px-5 pb-24 pt-8 sm:px-8 sm:pt-10 lg:px-12",
            variant === "partner" ? "max-w-3xl" : "max-w-6xl",
          ].join(" ")}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppShell;
