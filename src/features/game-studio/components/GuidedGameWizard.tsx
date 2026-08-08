import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  RestoreDraftDialog,
  SaveStatusBadge,
} from "../../../modules/editor-persistence";
import { GAME_TYPES } from "../constants";
import { useGameStudio } from "../hooks/useGameStudio";
import type { GameTypeId } from "../types";
import { GameBlockCard } from "./GameBlockCard";

export function GuidedGameWizard() {
  const navigate = useNavigate();
  const {
    project,
    game,
    autosave,
    lastSavedAt,
    draftOffer,
    setProperties,
    setGameType,
    completeGuided,
    saveNow,
  } = useGameStudio();

  const blocks = useMemo(
    () => [...game.blocks].sort((a, b) => a.order - b.order),
    [game.blocks],
  );
  const [step, setStep] = useState(0);
  const preamble = 2;
  const total = blocks.length + preamble;
  const isBasics = step === 0;
  const isType = step === 1;
  const blockIndex = step - preamble;
  const current = step >= preamble ? blocks[blockIndex] : null;
  const progress = Math.round((step / Math.max(total - 1, 1)) * 100);

  const finish = () => {
    completeGuided();
    saveNow();
    navigate(`/game-studio/${project.id}/${game.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            to={`/studio/${project.id}/games`}
            className="text-sm text-slate-500 no-underline hover:text-slate-900"
          >
            ← Games
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">
              Guided game · {game.properties.title || "Untitled"}
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
                Design a game around an objective
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {game.source.kind !== "scratch"
                  ? `Transformed from ${game.source.sourceTitle || game.source.kind}.`
                  : "Not a template pack — build from learning blocks."}
              </p>
              <label className="mt-6 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Title
                <input
                  value={game.properties.title}
                  onChange={(e) => setProperties({ title: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal"
                />
              </label>
              <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Learning objective
                <input
                  value={game.properties.learningObjective}
                  onChange={(e) =>
                    setProperties({ learningObjective: e.target.value })
                  }
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal"
                />
              </label>
              <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Subject
                <input
                  value={game.properties.subject}
                  onChange={(e) => setProperties({ subject: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal"
                />
              </label>
            </motion.section>
          ) : isType ? (
            <motion.section
              key="type"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="rounded-3xl border border-slate-200/80 bg-white p-7"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                Step 2 · Game type
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                How should students play?
              </h1>
              <div className="mt-6 grid gap-2">
                {GAME_TYPES.map((gt) => {
                  const on = game.properties.gameType === gt.id;
                  return (
                    <button
                      key={gt.id}
                      type="button"
                      onClick={() => setGameType(gt.id as GameTypeId)}
                      className={[
                        "rounded-2xl border px-4 py-3 text-left",
                        on
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200",
                      ].join(" ")}
                    >
                      <span className="block text-sm font-semibold">
                        {gt.label}
                      </span>
                      <span
                        className={[
                          "mt-0.5 block text-xs",
                          on ? "text-white/70" : "text-slate-500",
                        ].join(" ")}
                      >
                        {gt.description}
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
              <GameBlockCard
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
