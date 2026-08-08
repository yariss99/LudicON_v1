import { Link } from "react-router-dom";
import type { Project } from "../../../types/project";
import { formatRelativeTime } from "../../../utils/date";
import { getProjectColor } from "../constants";
import { assetCount, statusLabel } from "./projectFormUtils";
import "../styles/projects.css";

type ProjectCardProps = {
  project: Project;
  onEdit: (project: Project) => void;
  onDuplicate: (project: Project) => void;
  onArchive: (project: Project) => void;
  onDelete: (project: Project) => void;
};

export function ProjectCard({
  project,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: ProjectCardProps) {
  const color = getProjectColor(project.coverColor || project.color);
  const assets = assetCount(project.resources);

  return (
    <article className="pm-card">
      <div className="pm-card-cover" style={{ background: color.swatch }} />
      <div className="pm-card-body">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "0.75rem",
            alignItems: "flex-start",
          }}
        >
          <h3 className="pm-card-title">{project.title}</h3>
          <span className={`pm-badge pm-badge-${project.status}`}>
            {statusLabel(project.status)}
          </span>
        </div>

        <div className="pm-card-meta">
          {project.grade}
          {project.subject ? ` · ${project.subject}` : ""}
        </div>

        <div className="pm-card-meta">
          Updated {formatRelativeTime(project.updatedAt)} · {assets} asset
          {assets === 1 ? "" : "s"}
        </div>

        <div className="pm-card-actions">
          <Link
            className="pm-btn pm-btn-primary"
            to={`/projects/${project.id}`}
          >
            Open
          </Link>
          <button
            type="button"
            className="pm-btn"
            onClick={() => onEdit(project)}
          >
            Edit
          </button>
          <button
            type="button"
            className="pm-btn"
            onClick={() => onDuplicate(project)}
          >
            Duplicate
          </button>
          <button
            type="button"
            className="pm-btn"
            onClick={() => onArchive(project)}
          >
            {project.status === "archived" ? "Unarchive" : "Archive"}
          </button>
          <button
            type="button"
            className="pm-btn pm-btn-danger"
            onClick={() => onDelete(project)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
