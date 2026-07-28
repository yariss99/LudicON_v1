import type { Project } from "../../../types/project";
import ProjectEmptyState from "../../projects/components/ProjectEmptyState";
import ProjectGrid from "../../projects/components/ProjectGrid";

type RecentProjectsProps = {
  projects: readonly Project[];
  onCreateProject: () => void;
  onEdit: (project: Project) => void;
  onDuplicate: (project: Project) => void;
  onArchive: (project: Project) => void;
  onDelete: (project: Project) => void;
  onToggleFavorite: (project: Project) => void;
};

function RecentProjects({
  projects,
  onCreateProject,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onToggleFavorite,
}: RecentProjectsProps) {
  return (
    <section aria-labelledby="continue-teaching" className="mb-12">
      <div className="mb-6">
        <h2
          id="continue-teaching"
          className="text-lg font-semibold text-slate-900"
        >
          Continuă predarea
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Reia lecțiile recente exact de unde ai rămas.
        </p>
      </div>

      {projects.length === 0 ? (
        <ProjectEmptyState
          illustrated
          title="Bine ai venit în PRIMA."
          description="Nu ai început încă o lecție. Spune-mi despre lecția pe care dorești să o pregătești, iar PRIMA te va ghida pas cu pas."
          actionLabel="Creează o lecție"
          onAction={onCreateProject}
        />
      ) : (
        <ProjectGrid
          projects={projects}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </section>
  );
}

export default RecentProjects;
