import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Star } from "lucide-react";
import SurfaceCard from "../../../components/ui/SurfaceCard";
import ContextMenu, {
  type ContextMenuItem,
} from "../../../components/ui/ContextMenu";
import type { Project } from "../../../types/project";
import { formatRelativeTime } from "../../../utils/date";
import { experienceStatusLabel } from "../../../utils/experienceLabels";
import { getProjectProgress } from "../../home/utils/projectProgress";
import { getProjectColor } from "../constants";
import { getProjectIcon } from "../iconMap";

type ProjectCardProps = {
  project: Project;
  onEdit: (project: Project) => void;
  onDuplicate: (project: Project) => void;
  onArchive: (project: Project) => void;
  onDelete: (project: Project) => void;
  onToggleFavorite: (project: Project) => void;
};

function ProjectCard({
  project,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onToggleFavorite,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const color = getProjectColor(project.color);
  const Icon = getProjectIcon(project.icon);
  const status = experienceStatusLabel(project.state);
  const blueprintProgress = getProjectProgress(project);

  const menuItems: ContextMenuItem[] = [
    {
      id: "open",
      label: "Deschide",
      onSelect: () => navigate(`/studio/${project.id}`),
    },
    {
      id: "edit",
      label: "Modifică lecția",
      onSelect: () => onEdit(project),
    },
    {
      id: "duplicate",
      label: "Duplică lecția",
      onSelect: () => onDuplicate(project),
    },
    {
      id: "archive",
      label: project.archived ? "Restaurează lecția" : "Arhivează lecția",
      onSelect: () => onArchive(project),
    },
    {
      id: "delete",
      label: "Șterge lecția",
      tone: "danger",
      onSelect: () => onDelete(project),
    },
  ];

  return (
    <article className="group h-full">
      <SurfaceCard
        hover
        padding="lg"
        bordered
        className="flex h-full flex-col transition-colors group-hover:border-slate-200"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/studio/${project.id}`)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: color.swatch }}
            aria-label={`Open ${project.title}`}
          >
            <Icon size={22} strokeWidth={1.75} />
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleFavorite(project)}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                project.favorite
                  ? "text-amber-500 hover:bg-amber-50"
                  : "text-slate-300 hover:bg-slate-100 hover:text-amber-500",
              ].join(" ")}
              aria-label={
                project.favorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Star
                size={18}
                strokeWidth={1.75}
                fill={project.favorite ? "currentColor" : "none"}
              />
            </button>
            <ContextMenu
              triggerLabel={`Menu for ${project.title}`}
              trigger={<MoreHorizontal size={18} />}
              items={menuItems}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/studio/${project.id}`)}
          className="block w-full border-0 bg-transparent p-0 text-left"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${color.soft} ${color.text}`}
            >
              {project.subject}
            </span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {status}
            </span>
            {project.archived ? (
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                Arhivată
              </span>
            ) : null}
          </div>

          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            {project.title}
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">{project.grade}</p>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Progresul lecției · {blueprintProgress}%
          </p>
        </button>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">
            Modificată {formatRelativeTime(project.updatedAt)}
          </p>
          <button
            type="button"
            onClick={() => navigate(`/studio/${project.id}`)}
            className="text-xs font-semibold text-slate-800 transition-colors hover:text-slate-950"
          >
            Continuă
          </button>
        </div>
      </SurfaceCard>
    </article>
  );
}

export default ProjectCard;
