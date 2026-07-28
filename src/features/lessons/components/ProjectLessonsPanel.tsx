import { BookOpen, Plus } from "lucide-react";
import { Button, SurfaceCard } from "../../../components/ui";
import type { Lesson } from "../../../types/lesson";
import { formatRelativeTime } from "../../../utils/date";
import { getLessonStyleLabel } from "../constants";

type ProjectLessonsPanelProps = {
  projectId: string;
  lessons: readonly Lesson[];
};

function ProjectLessonsPanel({
  projectId,
  lessons,
}: ProjectLessonsPanelProps) {
  return (
    <section aria-labelledby="project-lessons" className="mb-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2
            id="project-lessons"
            className="text-sm font-medium uppercase tracking-wide text-slate-400"
          >
            Lecții în acest proiect
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Lecțiile rămân legate de acest proiect de predare.
          </p>
        </div>
        <Button
          to={`/projects/${projectId}/lessons/new`}
          variant="primary"
          className="!rounded-xl"
          size="sm"
        >
          <Plus size={14} />
          Lecție nouă
        </Button>
      </div>

      {lessons.length === 0 ? (
        <SurfaceCard padding="lg" bordered className="text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <BookOpen size={20} />
          </div>
          <p className="font-medium text-slate-800">Încă nu ai lecții</p>
          <p className="mt-1 text-sm text-slate-500">
            Începe să pregătești prima lecție pentru acest proiect.
          </p>
          <div className="mt-5">
            <Button
              to={`/projects/${projectId}/lessons/new`}
              variant="secondary"
              className="!rounded-xl"
            >
              New Lesson
            </Button>
          </div>
        </SurfaceCard>
      ) : (
        <div className="grid gap-3">
          {lessons.map((lesson) => (
            <SurfaceCard
              key={lesson.id}
              padding="md"
              bordered
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BookOpen size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{lesson.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {lesson.subject} · {lesson.grade} · {lesson.duration} min ·{" "}
                    {getLessonStyleLabel(lesson.style)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Generată {formatRelativeTime(lesson.createdAt)}
                  </p>
                </div>
              </div>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Gata
              </span>
            </SurfaceCard>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProjectLessonsPanel;
