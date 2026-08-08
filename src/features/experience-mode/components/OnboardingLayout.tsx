import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

type OnboardingLayoutProps = {
  children: ReactNode;
  onSkip: () => void;
};

export function OnboardingLayout({ children, onSkip }: OnboardingLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F8FA] text-slate-900">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(15,23,42,0.06), transparent), radial-gradient(ellipse 40% 30% at 100% 0%, rgba(15,23,42,0.04), transparent)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-slate-900 no-underline"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
            P
          </span>
          <span>P.R.R.I.M.A. ON</span>
        </Link>

        <button
          type="button"
          onClick={onSkip}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900 hover:shadow-sm"
        >
          Skip for now
        </button>
      </header>

      <motion.main
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col px-6 pb-16 pt-6 sm:px-10 sm:pt-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>

      <footer className="relative z-10 px-6 pb-10 text-center sm:px-10">
        <p className="mx-auto max-w-md text-xs leading-relaxed text-slate-400">
          You can change your work experience at any time from the application
          header.
        </p>
      </footer>
    </div>
  );
}
