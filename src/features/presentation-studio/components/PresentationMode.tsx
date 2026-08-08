import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { estimatePresentationMinutes } from "../constants";
import { usePresentationStudio } from "../hooks/usePresentationStudio";

type Props = {
  onClose: () => void;
};

export function PresentationMode({ onClose }: Props) {
  const { presentation } = usePresentationStudio();
  const blocks = useMemo(
    () => [...presentation.blocks].sort((a, b) => a.order - b.order),
    [presentation.blocks],
  );
  const [index, setIndex] = useState(0);
  const current = blocks[index];
  const next = blocks[index + 1];
  const total = blocks.length;
  const minutes = estimatePresentationMinutes(blocks);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setIndex((i) => Math.min(total - 1, i + 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, total]);

  if (!current) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white">
        <p>No slides yet.</p>
        <button type="button" className="ml-4 underline" onClick={onClose}>
          Exit
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <p className="text-sm font-medium text-white/70">
          {presentation.properties.title || "Presentation"}
        </p>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums">
          {index + 1} / {total}
        </span>
        <span className="text-xs text-white/40">~{minutes} min total</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            title="Coming soon"
            className="rounded-lg px-2.5 py-1.5 text-xs text-white/30"
          >
            Send to students
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="rounded-lg px-2.5 py-1.5 text-xs text-white/30"
          >
            Interactive classroom
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="rounded-lg px-2.5 py-1.5 text-xs text-white/30"
          >
            Live polling
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
          >
            Exit
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10 sm:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-3xl"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
                {current.type.replace(/_/g, " ")}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                {current.title}
              </h1>
              <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed text-white/75 sm:text-xl">
                {current.content || "—"}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex gap-3">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm disabled:opacity-30"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={index >= total - 1}
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </main>

        <aside className="w-full shrink-0 border-t border-white/10 bg-black/30 p-5 lg:w-80 lg:border-l lg:border-t-0">
          <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
            Teacher notes
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
            {current.teacherNotes || "No notes for this slide."}
          </p>
          <p className="mt-4 text-xs text-white/40">
            Estimated · {current.estimatedSeconds}s
          </p>

          <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
            Next activity
          </h2>
          {next ? (
            <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold">{next.title}</p>
              <p className="mt-1 line-clamp-3 text-xs text-white/50">
                {next.content || next.type.replace(/_/g, " ")}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/40">End of deck</p>
          )}

          <div className="mt-8 rounded-2xl border border-dashed border-white/15 p-3">
            <p className="text-xs font-semibold text-white/50">Classroom</p>
            <p className="mt-1 text-xs leading-relaxed text-white/35">
              Send slide, interactive classroom, and live polling will appear
              here in a later release.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
