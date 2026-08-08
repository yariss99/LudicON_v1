import { useState } from "react";
import { Link } from "react-router-dom";
import { StudioPersistenceControls } from "../../../modules/editor-persistence";
import {
  ASSESSMENT_PURPOSES,
  ASSESSMENT_STUDIO_STATUSES,
  assessmentPurposeLabel,
  assessmentStatusLabel,
} from "../constants";
import { useAssessmentStudio } from "../hooks/useAssessmentStudio";
import type { AssessmentPurpose, AssessmentStudioStatus } from "../types";
import { AssessmentCanvas } from "./AssessmentCanvas";
import { AssessmentPreview } from "./AssessmentPreview";
import { AssessmentSummaryPanel } from "./AssessmentSummaryPanel";
import { LearningInsightsPanel } from "./LearningInsightsPanel";

export function AdvancedAssessmentStudio() {
  const {
    project,
    assessment,
    projectCompetencies,
    autosave,
    lastSavedAt,
    canUndo,
    canRedo,
    versions,
    draftOffer,
    saveNow,
    undo,
    redo,
    restoreVersion,
    setStatus,
    setProperties,
    setPurpose,
    toggleDocumentCompetency,
  } = useAssessmentStudio();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA] text-slate-900">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-slate-200/80 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-5">
        <Link
          to={`/studio/${project.id}/assessments`}
          className="rounded-lg px-2 py-1.5 text-sm text-slate-500 no-underline hover:bg-slate-50 hover:text-slate-900"
        >
          ← {project.title}
        </Link>
        <span className="max-w-[12rem] truncate text-sm font-semibold tracking-tight sm:max-w-xs">
          {assessment.properties.title || "Untitled assessment"}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500">
          {assessmentStatusLabel(assessment.status)}
        </span>
        <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500 sm:inline">
          {assessmentPurposeLabel(assessment.properties.purpose)}
        </span>

        <StudioPersistenceControls
          status={autosave}
          lastSavedAt={lastSavedAt}
          canUndo={canUndo}
          canRedo={canRedo}
          versions={versions}
          draftOffer={draftOffer}
          onUndo={undo}
          onRedo={redo}
          onSave={saveNow}
          onRestore={restoreVersion}
          trailingActions={
            <>
              <button
                type="button"
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                onClick={() => setPropsOpen((v) => !v)}
              >
                {propsOpen ? "Hide panel" : "Summary"}
              </button>
              <button
                type="button"
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                onClick={() => setPreviewOpen((v) => !v)}
              >
                {previewOpen ? "Edit" : "Preview"}
              </button>
              <button
                type="button"
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                onClick={() => setExportOpen(true)}
              >
                Export
              </button>
            </>
          }
        />
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          {previewOpen ? <AssessmentPreview /> : <AssessmentCanvas />}
        </div>

        {propsOpen ? (
          <aside className="hidden w-80 shrink-0 overflow-auto border-l border-slate-200 bg-white p-4 lg:block">
            <div className="space-y-4">
              <AssessmentSummaryPanel />
              <LearningInsightsPanel />

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                <h2 className="text-sm font-semibold tracking-tight">
                  Properties
                </h2>
                <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-500">
                  Purpose
                  <select
                    value={assessment.properties.purpose}
                    onChange={(e) =>
                      setPurpose(e.target.value as AssessmentPurpose)
                    }
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
                  >
                    {ASSESSMENT_PURPOSES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-500">
                  Subject
                  <input
                    value={assessment.properties.subject}
                    onChange={(e) =>
                      setProperties({ subject: e.target.value })
                    }
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-500">
                  Grade
                  <input
                    value={assessment.properties.grade}
                    onChange={(e) => setProperties({ grade: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-500">
                  Planned duration (min)
                  <input
                    type="number"
                    value={assessment.properties.durationMinutes}
                    onChange={(e) =>
                      setProperties({
                        durationMinutes: Number(e.target.value) || 20,
                      })
                    }
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-500">
                  Status
                  <select
                    value={assessment.status}
                    onChange={(e) =>
                      setStatus(e.target.value as AssessmentStudioStatus)
                    }
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
                  >
                    {ASSESSMENT_STUDIO_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500">
                    Project competencies
                  </p>
                  {projectCompetencies.length === 0 ? (
                    <p className="mt-2 text-xs text-slate-400">
                      None yet — add them in{" "}
                      <Link
                        to={`/studio/${project.id}/settings`}
                        className="font-medium text-slate-700 underline"
                      >
                        Settings
                      </Link>
                      .
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {projectCompetencies.map((c) => {
                        const on =
                          assessment.properties.competencies.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleDocumentCompetency(c)}
                            className={[
                              "rounded-lg px-2 py-1 text-xs font-medium transition",
                              on
                                ? "bg-slate-900 text-white"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100",
                            ].join(" ")}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      {exportOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setExportOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold tracking-tight">Export</h2>
            <p className="mt-2 text-sm text-slate-500">
              Export placeholder — printable / shareable assessment export will
              land in a later sprint. Your work is already saved locally.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                onClick={() => setExportOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white opacity-60"
                disabled
              >
                Export PDF (soon)
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
