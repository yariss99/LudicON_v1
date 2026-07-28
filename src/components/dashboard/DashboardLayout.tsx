import type { ReactNode } from "react";
import DashboardHeader from "./DashboardHeader";

type DashboardLayoutProps = {
  children: ReactNode;
};

function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] font-sans text-slate-900 antialiased">
      <DashboardHeader />

      <main className="relative mx-auto w-full max-w-[1440px] px-6 pb-32 pt-8 sm:px-12 sm:pt-10">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
