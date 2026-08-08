import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

type CreateProjectLayoutProps = {
  children: ReactNode;
};

export function CreateProjectLayout({ children }: CreateProjectLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <nav
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="hover:text-slate-900">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link to="/projects" className="hover:text-slate-900">
          Projects
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-900">New Project</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
