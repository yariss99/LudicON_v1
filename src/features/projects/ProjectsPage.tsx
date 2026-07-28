import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { AppShell } from "../../components/layout";
import {
  Button,
  ConfirmDialog,
  SearchInput,
} from "../../components/ui";
import { useProjects } from "../../context/ProjectContext";
import { useProjectList } from "../../hooks/useProjectList";
import type { Project, ProjectFormInput } from "../../types/project";
import CreateProjectDialog from "./components/CreateProjectDialog";
import ProjectEmptyState from "./components/ProjectEmptyState";
import ProjectFormDialog from "./components/ProjectFormDialog";
import ProjectGrid from "./components/ProjectGrid";
import ProjectSortSelect from "./components/ProjectSortSelect";

function ProjectsPage() {
  const navigate = useNavigate();
  const {
    projects,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    archiveProject,
    unarchiveProject,
    toggleFavorite,
    isTitleTaken,
  } = useProjects();

  const {
    query,
    setQuery,
    sort,
    setSort,
    scope,
    setScope,
    results,
    isFiltering,
    isEmpty,
    activeCount,
    archivedCount,
  } = useProjectList(projects);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const handleCreate = (input: ProjectFormInput) => {
    createProject(input);
    navigate("/create/experience");
  };

  const handleArchive = (project: Project) => {
    if (project.archived) {
      unarchiveProject(project.id);
      return;
    }
    archiveProject(project.id);
  };

  const showFirstEmpty =
    isEmpty && !isFiltering && scope === "active" && activeCount === 0;

  return (
    <AppShell>
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Lecțiile mele</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Spațiul tău de predare
          </h1>
          <p className="mt-2 max-w-xl text-base text-slate-500">
            Fiecare lecție adună obiectivele, activitățile, evaluarea și
            materialele într-un singur loc.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          className="!rounded-xl"
          onClick={() => setCreateOpen(true)}
        >
          <Plus size={16} />
          Creează o lecție
        </Button>
      </header>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl flex-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Caută lecții…"
            label="Caută lecții"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-sm">
            {(
              [
                ["active", `În lucru (${activeCount})`],
                ["archived", `Arhivate (${archivedCount})`],
                ["all", "Toate"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setScope(value)}
                className={[
                  "rounded-lg px-3 py-1.5 transition-colors",
                  scope === value
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
          <ProjectSortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      {showFirstEmpty ? (
        <ProjectEmptyState
          illustrated
          title="Bine ai venit în PRIMA."
          description="Creează prima ta lecție și lasă PRIMA să te ghideze de la idee la materiale gata de clasă."
          actionLabel="Creează o lecție"
          onAction={() => setCreateOpen(true)}
        />
      ) : isEmpty ? (
        <ProjectEmptyState
          title={
            isFiltering
              ? "Nicio lecție nu corespunde căutării"
              : scope === "archived"
                ? "Nicio lecție arhivată"
                : "Încă nu ai lecții"
          }
          description={
            isFiltering
              ? "Încearcă alt termen sau șterge filtrul."
              : "Schimbă filtrul sau creează o lecție nouă."
          }
          actionLabel={
            scope === "active" ? "Creează o lecție" : undefined
          }
          onAction={
            scope === "active" ? () => setCreateOpen(true) : undefined
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {results.length}{" "}
            {results.length === 1 ? "lecție" : "lecții"}
            {isFiltering ? " găsite" : ""}
          </p>
          <ProjectGrid
            projects={results}
            onEdit={setEditing}
            onDuplicate={(project) => duplicateProject(project.id)}
            onArchive={handleArchive}
            onDelete={setDeleting}
            onToggleFavorite={(project) => toggleFavorite(project.id)}
          />
        </>
      )}

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        isTitleTaken={isTitleTaken}
      />

      <ProjectFormDialog
        open={Boolean(editing)}
        mode="edit"
        initialProject={editing}
        isTitleTaken={isTitleTaken}
        onClose={() => setEditing(null)}
        onSubmit={(input) => {
          if (!editing) return;
          updateProject(editing.id, input);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Șterge lecția"
        description={
          deleting
            ? `„${deleting.title}” va fi ștearsă definitiv. Materialele legate nu vor mai fi disponibile.`
            : ""
        }
        confirmLabel="Șterge lecția"
        tone="danger"
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          deleteProject(deleting.id);
        }}
      />
    </AppShell>
  );
}

export default ProjectsPage;
