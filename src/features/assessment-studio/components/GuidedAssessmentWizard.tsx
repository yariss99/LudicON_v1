import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  RestoreDraftDialog,
  SaveStatusBadge,
} from "../../../modules/editor-persistence";
import {
  ASSESSMENT_PURPOSES,
  assessmentPurposeLabel,
} from "../constants";
import { useAssessmentStudio } from "../hooks/useAssessmentStudio";
import type { AssessmentPurpose } from "../types";
import { AssessmentBlockCard } from "./AssessmentBlockCard";

export function GuidedAssessmentWizard() {
  const navigate = useNavigate();
  const {
    project,
    assessment,
    projectCompetencies,
    autosave,
    lastSavedAt,
    draftOffer,
    setProperties,
    setPurpose,
    toggleDocumentCompetency,
    completeGuided,
    saveNow,
  } = useAssessmentStudio();

  const blocks = useMemo(
    () => [...assessment.blocks].sort((a, b) => a.order - b.order),
    [assessment.blocks],
  );
  // Basics (0) → Purpose (1) → Competencies (2) → each block
  const [step, setStep] = useState(0);
  const preamble = 3;
  const total = blocks.length + preamble;
  const isBasics = step === 0;
  const isPurpose = step === 1;
  const isCompetencies = step === 2;
  const blockIndex = step - preamble;
  const current = step >= preamble ? blocks[blockIndex] : null;
  const progress = Math.round((step / Math.max(total - 1, 1)) * 100);

  const finish = () => {
    completeGuided();
    saveNow();
    navigate(`/assessment-studio/${project.id}/${assessment.id}`, {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            to={`/studio/${project.id}/assessments`}
            className="text-sm text-slate-500 no-underline hover:text-slate-900"
          >
            ← Assessments
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">
              Guided assessment · {assessment.properties.title || "Untitled"}
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
                Step 1 · Basics
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Measure competencies, not just scores
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Build an assessment that reveals learning and guides what comes
                next.
              </p>
              <label className="mt-6 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Title
                <input
                  value={assessment.properties.title}
                  onChange={(e) => setProperties({ title: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal"
                />
              </label>
              <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Subject
                <input
                  value={assessment.properties.subject}
                  onChange={(e) => setProperties({ subject: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal"
                />
              </label>
              <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Grade
                <input
                  value={assessment.properties.grade}
                  onChange={(e) => setProperties({ grade: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal"
                />
              </label>
              <label className="mt-4 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                Instructions for students
                <textarea
                  value={assessment.properties.instructions}
                  onChange={(e) =>
                    setProperties({ instructions: e.target.value })
                  }
                  rows={3}
                  className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal"
                />
              </label>
            </motion.section>
          ) : isPurpose ? (
            <motion.section
              key="purpose"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.2)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                Step 2 · Purpose
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Why are you assessing?
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Purpose shapes the items you write and how results inform
                teaching.
              </p>
              <div className="mt-6 grid gap-2">
                {ASSESSMENT_PURPOSES.map((p) => {
                  const on = assessment.properties.purpose === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPurpose(p.id as AssessmentPurpose)}
                      className={[
                        "rounded-2xl border px-4 py-3 text-left transition",
                        on
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white hover:border-slate-300",
                      ].join(" ")}
                    >
                      <span className="block text-sm font-semibold">
                        {p.label}
                      </span>
                      <span
                        className={[
                          "mt-0.5 block text-xs",
                          on ? "text-white/70" : "text-slate-500",
                        ].join(" ")}
                      >
                        {p.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.section>
          ) : isCompetencies ? (
            <motion.section
              key="competencies"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.2)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                Step 3 · Competencies
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                What should this assessment measure?
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Competencies come from this project
                {assessment.properties.purpose
                  ? ` · ${assessmentPurposeLabel(assessment.properties.purpose)}`
                  : ""}
                .
              </p>
              {projectCompetencies.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  No project competencies yet. Add them in{" "}
                  <Link
                    to={`/studio/${project.id}/settings`}
                    className="font-semibold text-slate-800 underline"
                  >
                    project Settings
                  </Link>
                  , then return here.
                </div>
              ) : (
                <div className="mt-6 flex flex-wrap gap-2">
                  {projectCompetencies.map((c) => {
                    const on = assessment.properties.competencies.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleDocumentCompetency(c)}
                        className={[
                          "rounded-xl px-3 py-2 text-sm font-medium transition",
                          on
                            ? "bg-slate-900 text-white"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100",
                        ].join(" ")}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}
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
              <AssessmentBlockCard
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
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {step >= total - 1 ? "Finish & open studio" : "Continue"}
          </button>
        </div>
      </main>
    </div>
  );
}
