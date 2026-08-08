import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Project } from "../../../types/project";
import { formatRelativeTime } from "../../../utils/date";

type Props = {
  projects: readonly Project[];
};

export function ProjectsSection({ projects }: Props) {
  return (
    <section aria-labelledby="my-projects">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2
          id="my-projects"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          My Projects
        </h2>
        {projects.length > 0 ? (
          <Link
            to="/projects"
            className="text-sm font-medium text-slate-500 no-underline hover:text-slate-800"
          >
            View all
          </Link>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"
        >
          <p className="text-base font-medium text-slate-800">
            No projects yet.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Create your first project.
          </p>
          <Link
            to="/projects/new"
            className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-slate-800"
          >
            New project
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.slice(0, 6).map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
            >
              <Link
                to={`/studio/${project.id}/overview`}
                className="block rounded-2xl border border-slate-200/80 bg-white p-4 no-underline shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <p className="font-semibold tracking-tight text-slate-900">
                  {project.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {[project.subject, project.grade].filter(Boolean).join(" · ") ||
                    "Project"}
                </p>
                <p className="mt-3 text-[0.7rem] font-medium uppercase tracking-[0.08em] text-slate-400">
                  Updated {formatRelativeTime(project.updatedAt)}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
