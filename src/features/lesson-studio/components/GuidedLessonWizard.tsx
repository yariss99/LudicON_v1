import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RestoreDraftDialog,
  SaveStatusBadge,
} from "../../../modules/editor-persistence";
import { useLessonStudio } from "../hooks/useLessonStudio";
import { EducationalBlock } from "./EducationalBlock";

/**
 * Guided Mode — step-by-step lesson creation wizard.
 */
export function GuidedLessonWizard() {
  const navigate = useNavigate();
  const {
    project,
    lesson,
    autosave,
    lastSavedAt,
    draftOffer,
    setProperties,
    completeGuided,
    saveNow,
  } = useLessonStudio();

  const blocks = useMemo(
    () => [...lesson.blocks].sort((a, b) => a.order - b.order),
    [lesson.blocks],
  );
  const [step, setStep] = useState(0);
  const total = blocks.length + 1; // +1 for basics step
  const isBasics = step === 0;
  const blockIndex = step - 1;
  const currentBlock = !isBasics ? blocks[blockIndex] : null;
  const progress = Math.round((step / Math.max(total - 1, 1)) * 100);

  const finish = () => {
    completeGuided();
    saveNow("Guided complete");
    navigate(`/lesson-studio/${project.id}/${lesson.id}`, { replace: true });
  };

  const next = () => {
    if (step >= total - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            to={`/studio/${project.id}/lessons`}
            className="text-sm text-slate-500 no-underline hover:text-slate-900"
          >
            ← Lessons
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">
              Guided lesson · {lesson.properties.title || "Untitled"}
            </p>
            <p className="text-xs text-slate-400">
              Step {step + 1} of {total}
            </p>
          </div>
          <SaveStatusBadge status={autosave} lastSavedAt={lastSavedAt} />
          <button
            type="button"
            className="rounded-xl px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
            onClick={finish}
          >
            Skip to studio
          </button>
        </div>
        <div className="h-1 bg-slate-100">
          <motion.div
            className="h-full bg-slate-900"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
          />
        </div>
      </header>

      {draftOffer ? <RestoreDraftDialog offer={draftOffer} /> : null}

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <AnimatePresence mode="wait">
          {isBasics ? (
            <motion.section
              key="basics"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.2)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                Step 1 · Basics
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Let’s set up this lesson
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Only a few details — then we’ll build each section together.
              </p>

              <label className="mt-6 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Lesson title
                <input
                  value={lesson.properties.title}
                  onChange={(e) => setProperties({ title: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal text-slate-900 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
                />
              </label>
              <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Subject
                <input
                  value={lesson.properties.subject}
                  onChange={(e) => setProperties({ subject: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal text-slate-900 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
                />
              </label>
              <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Grade
                <input
                  value={lesson.properties.grade}
                  onChange={(e) => setProperties({ grade: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal text-slate-900 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
                />
              </label>
              <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Duration (minutes)
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={lesson.properties.durationMinutes}
                  onChange={(e) =>
                    setProperties({
                      durationMinutes: Number(e.target.value) || 45,
                    })
                  }
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal text-slate-900 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
                />
              </label>
            </motion.section>
          ) : currentBlock ? (
            <motion.section
              key={currentBlock.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                Step {step + 1} · {currentBlock.title}
              </p>
              <EducationalBlock
                block={currentBlock}
                index={blockIndex}
                draggingId={null}
                dropIndex={null}
                focused
                onDragStart={() => undefined}
                onDragOver={() => undefined}
                onDrop={() => undefined}
              />
            </motion.section>
          ) : null}
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {step >= total - 1 ? "Finish & open studio" : "Continue"}
          </button>
        </div>
      </main>
    </div>
  );
}
