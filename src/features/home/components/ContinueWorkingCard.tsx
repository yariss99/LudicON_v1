import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Project } from "../../../types/project";
import { getProjectColor } from "../../projects/constants";
import { getProjectIcon } from "../../projects/iconMap";
import {
  getProjectProgress,
  getRemainingTasks,
} from "../utils/projectProgress";

type ContinueWorkingCardProps = {
  project: Project | null;
  onCreate: () => void;
};

function ContinueWorkingCard({ project, onCreate }: ContinueWorkingCardProps) {
  const navigate = useNavigate();

  if (!project) {
    return (
      <section className="desk-enter desk-enter-delay-2 rounded-[28px] border border-dashed border-slate-200 bg-white/80 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Continue working
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
          Let&apos;s create your first learning experience.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Describe an idea above — PRIMA will open a living workspace for you.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        >
          Start from intention
          <ArrowRight size={14} />
        </button>
      </section>
    );
  }

  const progress = getProjectProgress(project);
  const remaining = getRemainingTasks(project);
  const color = getProjectColor(project.color);
  const Icon = getProjectIcon(project.icon);

  return (
    <section className="desk-enter desk-enter-delay-2 group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-shadow duration-300 hover:shadow-[0_20px_48px_rgba(15,23,42,0.09)]">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-[0.12] transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundColor: color.swatch }}
        aria-hidden
      />

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        Continue working
      </p>

      <div className="mt-4 flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ backgroundColor: color.swatch }}
        >
          <Icon size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold tracking-tight text-slate-900">
            {project.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {project.subject} · {project.grade}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">{progress}% complete</span>
          <span className="text-slate-400">Keep going</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="desk-progress h-full rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: color.swatch,
            }}
          />
        </div>
      </div>

      {remaining.length > 0 ? (
        <ul className="mt-5 space-y-1.5">
          {remaining.map((task) => (
            <li
              key={task}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              {task}
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={() => navigate(`/studio/${project.id}`)}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
      >
        Continue
        <ArrowRight size={14} />
      </button>
    </section>
  );
}

export default ContinueWorkingCard;
