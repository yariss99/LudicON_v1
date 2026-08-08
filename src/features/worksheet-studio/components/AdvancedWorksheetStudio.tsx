import { useState } from "react";
import { Link } from "react-router-dom";
import { StudioPersistenceControls } from "../../../modules/editor-persistence";
import {
  WORKSHEET_STATUSES,
  worksheetStatusLabel,
} from "../constants";
import { useWorksheetStudio } from "../hooks/useWorksheetStudio";
import type { WorksheetStatus } from "../types";
import { WorksheetCanvas } from "./WorksheetCanvas";
import { WorksheetPreview } from "./WorksheetPreview";

export function AdvancedWorksheetStudio() {
  const {
    project,
    worksheet,
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
  } = useWorksheetStudio();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA] text-slate-900">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-slate-200/80 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-5">
        <Link
          to={`/studio/${project.id}/worksheets`}
          className="rounded-lg px-2 py-1.5 text-sm text-slate-500 no-underline hover:bg-slate-50 hover:text-slate-900"
        >
          ← {project.title}
        </Link>
        <span className="max-w-[12rem] truncate text-sm font-semibold tracking-tight sm:max-w-xs">
          {worksheet.properties.title || "Untitled worksheet"}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500">
          {worksheetStatusLabel(worksheet.status)}
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
                Properties
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

      {propsOpen ? (
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
          <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
              Subject
              <input
                value={worksheet.properties.subject}
                onChange={(e) => setProperties({ subject: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
              Grade
              <input
                value={worksheet.properties.grade}
                onChange={(e) => setProperties({ grade: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
              Duration
              <input
                type="number"
                value={worksheet.properties.durationMinutes}
                onChange={(e) =>
                  setProperties({
                    durationMinutes: Number(e.target.value) || 20,
                  })
                }
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
              Status
              <select
                value={worksheet.status}
                onChange={(e) =>
                  setStatus(e.target.value as WorksheetStatus)
                }
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
              >
                {WORKSHEET_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}

      {previewOpen ? <WorksheetPreview /> : <WorksheetCanvas />}

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
              Export placeholder — PDF / printable worksheet export will land in
              a later sprint. Your work is already saved locally.
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
