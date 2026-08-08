import {
  estimatePresentationMinutes,
  presentationStatusLabel,
} from "../constants";
import { usePresentationStudio } from "../hooks/usePresentationStudio";

export function PresentationPreview() {
  const { presentation } = usePresentationStudio();
  const blocks = [...presentation.blocks].sort((a, b) => a.order - b.order);
  const p = presentation.properties;
  const minutes = estimatePresentationMinutes(blocks);

  return (
    <div className="flex-1 overflow-auto px-4 py-8 sm:px-8">
      <article className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-500">
            {presentationStatusLabel(presentation.status)}
          </span>
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-500">
            {blocks.length} slides · ~{minutes} min
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {p.title || "Untitled presentation"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {[p.subject, p.grade].filter(Boolean).join(" · ")}
        </p>

        {blocks.map((block, i) => (
          <section
            key={block.id}
            className="mt-8 border-t border-slate-100 pt-6"
          >
            <p className="text-xs font-semibold text-slate-400">
              Slide {i + 1} · {block.type.replace(/_/g, " ")}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
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
