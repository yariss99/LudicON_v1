import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { getProjectColor } from "../../projects/constants";
import { getProjectIcon } from "../../projects/iconMap";
import { formatRelativeTime } from "../../../utils/date";
import type { Project } from "../../../types/project";

/**
 * Canonical project destination. Keeping it inside the shared card is what
 * guarantees the desk and the Projects page cannot drift apart.
 */
function projectHref(project: Project): string {
  return `/studio/${project.id}`;
}

type ProjectCardProps = {
  readonly project: Project;
  /** Marks the most recently updated project on the desk. */
  readonly featured?: boolean;
  readonly onOpen?: () => void;
  /** Secondary control rendered beside the card, never inside its link. */
  readonly action?: ReactNode;
};

export function ProjectCard({
  project,
  featured = false,
  onOpen,
  action,
}: ProjectCardProps) {
  const Icon = getProjectIcon(project.icon);
  const swatch = getProjectColor(project.color).swatch;

  // Only render metadata the project actually has.
  const context = [project.subject, project.grade]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" · ");

  const tags = project.resources
    .filter((resource) => resource.status !== "empty")
    .slice(0, 3);

  return (
    <div className={["ts-project-cell", featured ? "is-featured" : ""].join(" ")}>
      <Link
        to={projectHref(project)}
        className="ts-project-card"
        onClick={onOpen}
        style={{ "--ts-p": swatch } as CSSProperties}
      >
        <span className="ts-project-top">
          <span className="ts-project-icon" aria-hidden>
            <Icon size={18} strokeWidth={1.75} />
          </span>
          {featured ? (
            <span className="ts-project-flag">Ultimul proiect</span>
          ) : null}
        </span>

        <span className="ts-project-title">{project.title}</span>

        {context ? <span className="ts-project-meta">{context}</span> : null}

        {tags.length > 0 || project.favorite || project.archived ? (
          <span className="ts-project-tags">
            {project.favorite ? (
              <span className="ts-project-tag is-fav">Favorit</span>
            ) : null}
            {project.archived ? (
              <span className="ts-project-tag">Arhivat</span>
            ) : null}
            {tags.map((resource) => (
              <span key={resource.id} className="ts-project-tag">
                {resource.label}
              </span>
            ))}
          </span>
        ) : null}

        <span className="ts-project-foot">
          <time dateTime={project.updatedAt}>
            Actualizat {formatRelativeTime(project.updatedAt)}
          </time>
          <span className="ts-project-go">
            {featured ? "Continuă" : null}
            <ArrowRight size={14} aria-hidden />
          </span>
        </span>
      </Link>

      {action ? <div className="ts-project-actions">{action}</div> : null}
    </div>
  );
}
