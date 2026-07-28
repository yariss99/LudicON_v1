import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import type { RecentProject } from "../../types/dashboard";
import { dashboardRo } from "../../i18n";
import ProgressBar from "../ui/ProgressBar";
import SectionHeader from "../ui/SectionHeader";

const { sections, continue: continueLabels } = dashboardRo;

type ProjectRowProps = {
  project: RecentProject;
};

function ProjectRow({ project }: ProjectRowProps) {
  return (
    <Link
      to={project.href}
      className="group flex flex-col gap-4 rounded-[24px] bg-white px-6 py-5 ring-1 ring-slate-100/70 transition-all duration-300 hover:shadow-[0_8px_28px_rgba(79,70,229,0.07)] hover:ring-indigo-100/80 sm:flex-row sm:items-center sm:gap-8"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">
          {project.type}
        </p>
        <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-indigo-700">
          {project.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock size={13} />
          {continueLabels.edited} {project.updatedAt}
        </div>
      </div>

      <div className="w-full shrink-0 sm:w-44">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-slate-500">{continueLabels.progress}</span>
          <span className="font-semibold text-indigo-600">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </div>

      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 opacity-0 transition-all group-hover:opacity-100 sm:opacity-70">
        {continueLabels.continue}
        <ArrowRight size={14} />
      </span>
    </Link>
  );
}

type ContinueWorkingProps = {
  projects: RecentProject[];
};

function ContinueWorking({ projects }: ContinueWorkingProps) {
  return (
    <section>
      <SectionHeader
        title={sections.continueWork}
        size="subtle"
        action={
          <Link
            to="/projects"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
          >
            {sections.viewAll}
          </Link>
        }
      />
      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

export default ContinueWorking;
export { ProjectRow };
