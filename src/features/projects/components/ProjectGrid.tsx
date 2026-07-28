import type { Project } from "../../../types/project";
import ProjectCard from "./ProjectCard";

type ProjectGridProps = {
  projects: readonly Project[];
  onEdit: (project: Project) => void;
  onDuplicate: (project: Project) => void;
  onArchive: (project: Project) => void;
  onDelete: (project: Project) => void;
  onToggleFavorite: (project: Project) => void;
};

function ProjectGrid({
  projects,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onToggleFavorite,
}: ProjectGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

export default ProjectGrid;
