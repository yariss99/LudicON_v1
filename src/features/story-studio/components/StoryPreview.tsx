import {
  storyStatusLabel,
  storyThemeLabel,
} from "../constants";
import { useStoryStudio } from "../hooks/useStoryStudio";

export function StoryPreview() {
  const { story } = useStoryStudio();
  const blocks = [...story.blocks].sort((a, b) => a.order - b.order);
  const p = story.properties;

  return (
    <div className="flex-1 overflow-auto px-4 py-8 sm:px-8">
      <article className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-500">
            {storyStatusLabel(story.status)}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-500">
            {storyThemeLabel(p.theme)}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {p.title || "Untitled story"}
        </h1>
        {p.learningObjective ? (
          <p className="mt-2 text-sm font-medium text-slate-600">
            Objective: {p.learningObjective}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-slate-500">
          {[p.subject, p.grade].filter(Boolean).join(" · ")}
        </p>
        {p.synopsis ? (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {p.synopsis}
          </p>
        ) : null}
        {blocks.map((block, i) => (
          <section
            key={block.id}
            className="mt-8 border-t border-slate-100 pt-6"
          >
            <p className="text-xs font-semibold text-slate-400">
              Beat {i + 1} · {block.type.replace(/_/g, " ")}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              {block.title}
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-slate-600">
              {block.content || "—"}
            </p>
          </section>
        ))}
      </article>
    </div>
  );
}
