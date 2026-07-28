import { CheckCircle2 } from "lucide-react";
import { Button, SurfaceCard } from "../../../components/ui";
import type { Lesson } from "../../../types/lesson";
import { getLessonStyleLabel } from "../constants";

type LessonSuccessProps = {
  lesson: Lesson;
  onViewProject: () => void;
  onCreateAnother: () => void;
};

function LessonSuccess({
  lesson,
  onViewProject,
  onCreateAnother,
}: LessonSuccessProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <SurfaceCard padding="lg" bordered className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={28} />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Lecția este gata
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          „{lesson.title}” este salvată. Poți continua proiectarea oricând.
        </p>

        <div className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 text-left">
          <p className="text-sm font-semibold text-slate-900">{lesson.title}</p>
          <p className="mt-1 text-sm text-slate-500">
            {lesson.subject} · {lesson.grade} · {lesson.duration} min ·{" "}
            {getLessonStyleLabel(lesson.style)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {lesson.content.summary}
          </p>
          <ul className="mt-4 space-y-2">
            {lesson.content.sections.map((section) => (
              <li
                key={section.id}
                className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700"
              >
                <span className="font-medium">{section.title}</span>
                <span className="text-slate-400">
                  {" "}
                  · {section.durationMinutes} min
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="secondary"
            className="!rounded-xl"
            onClick={onCreateAnother}
          >
            Lecție nouă
          </Button>
          <Button
            type="button"
            variant="primary"
            className="!rounded-xl"
            onClick={onViewProject}
          >
            Deschide lecția
          </Button>
        </div>
      </SurfaceCard>
    </div>
  );
}

export default LessonSuccess;
