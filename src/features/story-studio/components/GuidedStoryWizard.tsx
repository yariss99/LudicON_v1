import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  RestoreDraftDialog,
  SaveStatusBadge,
} from "../../../modules/editor-persistence";
import { STORY_THEMES } from "../constants";
import { useStoryStudio } from "../hooks/useStoryStudio";
import type { StoryThemeId } from "../types";
import { StoryBlockCard } from "./StoryBlockCard";

export function GuidedStoryWizard() {
  const navigate = useNavigate();
  const {
    project,
    story,
    autosave,
    lastSavedAt,
    draftOffer,
    setProperties,
    setTheme,
    completeGuided,
    saveNow,
  } = useStoryStudio();

  const blocks = useMemo(
    () => [...story.blocks].sort((a, b) => a.order - b.order),
    [story.blocks],
  );
  const [step, setStep] = useState(0);
  const preamble = 2;
  const total = blocks.length + preamble;
  const isBasics = step === 0;
  const isTheme = step === 1;
  const blockIndex = step - preamble;
  const current = step >= preamble ? blocks[blockIndex] : null;
  const progress = Math.round((step / Math.max(total - 1, 1)) * 100);

  const finish = () => {
    completeGuided();
    saveNow();
    navigate(`/story-studio/${project.id}/${story.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            to={`/studio/${project.id}/stories`}
            className="text-sm text-slate-500 no-underline hover:text-slate-900"
          >
            ← Stories
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">
              Guided story · {story.properties.title || "Untitled"}
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
                Step 1 · Learning focus
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Tell a story that teaches
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {story.source.kind !== "blank"
                  ? `Transformed from ${story.source.sourceTitle || story.source.kind}.`
                  : "Interactive narrative blocks — not a plain text story."}
              </p>
              <label className="mt-6 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Title
                <input
                  value={story.properties.title}
                  onChange={(e) => setProperties({ title: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal"
                />
              </label>
              <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Learning objective
                <input
                  value={story.properties.learningObjective}
                  onChange={(e) =>
                    setProperties({ learningObjective: e.target.value })
                  }
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal"
                />
              </label>
              <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Subject
                <input
                  value={story.properties.subject}
                  onChange={(e) => setProperties({ subject: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal"
                />
              </label>
            </motion.section>
          ) : isTheme ? (
            <motion.section
              key="theme"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="rounded-3xl border border-slate-200/80 bg-white p-7"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                Step 2 · Theme
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                What world should learners enter?
              </h1>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {STORY_THEMES.map((t) => {
                  const on = story.properties.theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id as StoryThemeId)}
                      className={[
                        "rounded-2xl border px-4 py-3 text-left",
                        on
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200",
                      ].join(" ")}
                    >
                      <span className="block text-sm font-semibold">
                        {t.label}
                      </span>
                      <span
                        className={[
                          "mt-0.5 block text-xs",
                          on ? "text-white/70" : "text-slate-500",
                        ].join(" ")}
                      >
                        {t.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.section>
          ) : current ? (
            <motion.section
              key={current.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                Step {step + 1} · {current.title}
              </p>
              <StoryBlockCard
                block={current}
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
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (step >= total - 1) finish();
              else setStep((s) => s + 1);
            }}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            {step >= total - 1 ? "Finish & open studio" : "Continue"}
          </button>
        </div>
      </main>
    </div>
  );
}
