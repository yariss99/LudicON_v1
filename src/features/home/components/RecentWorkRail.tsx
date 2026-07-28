import { useNavigate } from "react-router-dom";
import type { Project } from "../../../types/project";
import { formatRelativeTime } from "../../../utils/date";
import { getProjectColor } from "../../projects/constants";
import { getProjectIcon } from "../../projects/iconMap";
import { getProjectProgress } from "../utils/projectProgress";

type RecentWorkRailProps = {
  projects: readonly Project[];
};

function RecentWorkRail({ projects }: RecentWorkRailProps) {
  const navigate = useNavigate();

  if (projects.length === 0) return null;

  return (
    <section className="desk-enter desk-enter-delay-4 mt-10">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
          Recent work
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          What were you working on?
        </h2>
      </div>

      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
        {projects.map((project) => {
          const color = getProjectColor(project.color);
          const Icon = getProjectIcon(project.icon);
          const progress = getProjectProgress(project);

          return (
            <button
              key={project.id}
              type="button"
              onClick={() => navigate(`/studio/${project.id}`)}
              className="min-w-[240px] max-w-[260px] shrink-0 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: color.swatch }}
                >
                  <Icon size={18} />
                </div>
                <span className="text-xs text-slate-400">
                  {formatRelativeTime(project.updatedAt)}
                </span>
              </div>
              <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                {project.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {project.subject} · {progress}%
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default RecentWorkRail;
