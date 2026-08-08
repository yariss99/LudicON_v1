import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Gamepad2,
  LayoutTemplate,
  NotebookPen,
  Pencil,
  Plus,
  Presentation,
  Puzzle,
  Sparkles,
  Star,
} from "lucide-react";
import { AppShell } from "../../components/layout";
import { Button, SurfaceCard } from "../../components/ui";
import { useProjects } from "../../context/ProjectContext";
import { ProjectLessonsPanel } from "../lessons";
import { lessonService } from "../../services/lessonService";
import type { ProjectResourceType } from "../../types/project";
import { formatAbsoluteDate, formatRelativeTime } from "../../utils/date";
import ProjectFormDialog from "./components/ProjectFormDialog";
import { getProjectColor } from "./constants";
import { getProjectIcon } from "./iconMap";

const icons: Record<ProjectResourceType, typeof BookOpen> = {
  blueprint: LayoutTemplate,
  lesson: BookOpen,
  activities: Puzzle,
  worksheet: FileText,
  assessment: ClipboardCheck,
  presentation: Presentation,
  game: Gamepad2,
  story: BookOpen,
  notes: NotebookPen,
  reflection: Sparkles,
  resources: FolderOpen,
  ai_notes: Sparkles,
};

const statusLabel = {
  ready: "Gata",
  draft: "Ciornă",
  empty: "Neînceput",
} as const;

function ProjectWorkspacePage() {
  const { projectId = "" } = useParams();
  const {
    getProject,
    openProject,
    updateProject,
    toggleFavorite,
    isTitleTaken,
  } = useProjects();
  const project = getProject(projectId);
  const openedIdRef = useRef<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const lessons = useMemo(
    () => (projectId ? lessonService.listByProject(projectId) : []),
    [projectId],
  );

  useEffect(() => {
    if (!projectId || openedIdRef.current === projectId) return;
    if (!getProject(projectId)) return;
    openedIdRef.current = projectId;
    openProject(projectId);
  }, [projectId, getProject, openProject]);

  if (!project) {
    return (
      <AppShell>
        <p className="text-slate-600">Lecția nu a fost găsită.</p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-slate-700 no-underline hover:text-slate-900"
        >
          Înapoi la birou
        </Link>
      </AppShell>
    );
  }

  const color = getProjectColor(project.color);
  const Icon = getProjectIcon(project.icon);

  return (
    <AppShell>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 no-underline hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        Lecțiile mele
      </Link>

      <header className="mb-10 flex flex-col gap-5 border-b border-slate-200/80 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: color.swatch }}
          >
            <Icon size={26} strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {project.title}
              </h1>
              {project.favorite ? (
                <Star
                  size={18}
                  className="text-amber-500"
                  fill="currentColor"
                  aria-label="Favorit"
                />
              ) : null}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {project.subject} · {project.grade}
              {project.archived ? " · Arhivată" : ""}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Modificată {formatRelativeTime(project.updatedAt)} · creată{" "}
              {formatAbsoluteDate(project.createdAt)}
            </p>
            {project.description ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                {project.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            className="!rounded-xl"
            onClick={() => toggleFavorite(project.id)}
          >
            <Star
              size={16}
              fill={project.favorite ? "currentColor" : "none"}
            />
            {project.favorite ? "Favorită" : "Marchează favorită"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="!rounded-xl"
            onClick={() => setEditOpen(true)}
          >
            <Pencil size={16} />
            Editează
          </Button>
          <Button
            to={`/ai?project=${project.id}`}
            variant="secondary"
            className="!rounded-xl"
          >
            <Sparkles size={16} />
            Colegul tău
          </Button>
          <Button
            to={`/projects/${project.id}/lessons/new`}
            variant="primary"
            className="!rounded-xl"
          >
            <Plus size={16} />
            Lecție nouă
          </Button>
        </div>
      </header>

      <ProjectLessonsPanel projectId={project.id} lessons={lessons} />

      <section aria-labelledby="project-resources">
        <h2
          id="project-resources"
          className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-400"
        >
          În această lecție
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {project.resources.map((resource) => {
            const ResourceIcon = icons[resource.type];
            return (
              <SurfaceCard
                key={resource.id}
                padding="md"
                bordered
                className="flex items-center gap-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <ResourceIcon size={20} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{resource.label}</p>
                  <p className="text-xs text-slate-500">
                    {statusLabel[resource.status]}
                  </p>
                </div>
                {resource.type === "blueprint" ? (
                  <Link
                    to="/prima/planning"
                    className="text-sm font-medium text-blue-600 no-underline hover:text-blue-700"
                  >
                    Deschide
                  </Link>
                ) : resource.status === "empty" ? (
                  <Link
                    to={
                      resource.type === "lesson"
                        ? `/projects/${project.id}/lessons/new`
                        : `/create?intent=${
                            resource.type === "worksheet"
                              ? "worksheet"
                              : resource.type === "game"
                                ? "game"
                                : "lesson"
                          }`
                    }
                    className="text-sm font-medium text-slate-500 no-underline hover:text-slate-800"
                  >
                    Adaugă
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-slate-400">
                    Previzualizare
                  </span>
                )}
              </SurfaceCard>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <SurfaceCard padding="lg" bordered className="bg-blue-50/40">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 text-blue-600" size={18} />
            <div>
              <p className="font-semibold text-slate-900">
                PRIMA cunoaște această lecție
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Colegul tău ține minte clasa, disciplina și planul. Continuă
                conversația fără să repeți ce ați stabilit deja.
              </p>
              <Link
                to={`/ai?project=${project.id}`}
                className="mt-3 inline-flex text-sm font-semibold text-blue-700 no-underline hover:text-blue-800"
              >
                Continuă cu PRIMA →
              </Link>
            </div>
          </div>
        </SurfaceCard>
      </section>

      <ProjectFormDialog
        open={editOpen}
        mode="edit"
        initialProject={project}
        isTitleTaken={isTitleTaken}
        onClose={() => setEditOpen(false)}
        onSubmit={(input) => updateProject(project.id, input)}
      />
    </AppShell>
  );
}

export default ProjectWorkspacePage;
