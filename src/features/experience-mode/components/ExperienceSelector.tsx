import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EXPERIENCE_CARDS, EXPERIENCE_COMPARISON } from "../constants";
import type { ExperienceMode } from "../types";
import { ComparisonTable } from "./ComparisonTable";
import { ExperienceCard } from "./ExperienceCard";

type ExperienceSelectorProps = {
  onSelect: (mode: ExperienceMode) => void;
};

export function ExperienceSelector({ onSelect }: ExperienceSelectorProps) {
  const [selected, setSelected] = useState<ExperienceMode | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [previewMode, setPreviewMode] = useState<ExperienceMode | null>(null);

  const handleSelect = (mode: ExperienceMode) => {
    if (selecting) return;
    setSelected(mode);
    setSelecting(true);
    window.setTimeout(() => {
      onSelect(mode);
    }, 520);
  };

  return (
    <div className="flex flex-col gap-12">
      <header className="mx-auto max-w-2xl text-center">
        <motion.p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Experience Mode
        </motion.p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
          Welcome to P.R.R.I.M.A. ON
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
          Choose how you would like to work.
          <br className="hidden sm:block" />
          You can change this option at any time.
          <br />
          P.R.R.I.M.A. ON will adapt to your preferred workflow.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        {EXPERIENCE_CARDS.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + index * 0.08 }}
          >
            <ExperienceCard
              card={card}
              selected={selected === card.id}
              selecting={selecting}
              onSelect={handleSelect}
              onPreview={setPreviewMode}
            />
          </motion.div>
        ))}
      </div>

      <ComparisonTable rows={EXPERIENCE_COMPARISON} />

      <AnimatePresence>
        {previewMode ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPreviewMode(null);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="experience-preview-title"
              className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
            >
              <h2
                id="experience-preview-title"
                className="text-lg font-semibold tracking-tight text-slate-900"
              >
                Preview ·{" "}
                {previewMode === "guided" ? "Guided" : "Advanced"} Experience
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Demo video placeholder — a short walkthrough of this experience
                will appear here in a future release.
              </p>
              <div className="mt-5 flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                    ▶
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    Preview coming soon
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={() => setPreviewMode(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
