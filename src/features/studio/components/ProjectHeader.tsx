import { formatAbsoluteDate } from "../../../utils/date";
import type { Project } from "../../../types/project";
import { getProjectColor } from "../../projects/constants";
import { getProjectIcon } from "../../projects/iconMap";

type ProjectHeaderProps = {
  project: Project;
  intentPrompt?: string;
};

function ProjectHeader({ project, intentPrompt }: ProjectHeaderProps) {
  const color = getProjectColor(project.color);
  const Icon = getProjectIcon(project.icon);

  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-slate-200/70 pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ backgroundColor: color.swatch }}
        >
          <Icon size={26} strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400">Lecția mea</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {project.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {project.subject} · {project.grade} · Creată{" "}
            {formatAbsoluteDate(project.createdAt)}
          </p>
          {intentPrompt ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
              “{intentPrompt}”
            </p>
          ) : project.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
              {project.description}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default ProjectHeader;
