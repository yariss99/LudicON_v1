import { useLessonStudio } from "../hooks/useLessonStudio";
import { statusLabel } from "../constants";

export function LessonPreview() {
  const { lesson } = useLessonStudio();
  const blocks = [...lesson.blocks].sort((a, b) => a.order - b.order);
  const p = lesson.properties;

  return (
    <div className="flex-1 overflow-auto px-4 py-8 sm:px-8">
      <article className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-500">
          {statusLabel(lesson.status)}
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {p.title || "Untitled lesson"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {[p.subject, p.grade, `${p.durationMinutes} min`, p.teachingUnit]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {blocks.length === 0 ? (
          <p className="mt-8 text-sm text-slate-400">No sections yet.</p>
        ) : (
          blocks.map((block) => (
            <section
              key={block.id}
              className="mt-8 border-t border-slate-100 pt-6"
            >
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                {block.title}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-slate-600">
                {block.content || "—"}
              </p>
            </section>
          ))
        )}
      </article>
    </div>
  );
}
