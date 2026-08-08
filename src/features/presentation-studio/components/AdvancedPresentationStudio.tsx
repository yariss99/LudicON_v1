import { useState } from "react";
import { Link } from "react-router-dom";
import { StudioPersistenceControls } from "../../../modules/editor-persistence";
import {
  PRESENTATION_STUDIO_STATUSES,
  estimatePresentationMinutes,
  presentationSourceLabel,
  presentationStatusLabel,
} from "../constants";
import { usePresentationStudio } from "../hooks/usePresentationStudio";
import type { PresentationStudioStatus } from "../types";
import { PresentationCanvas } from "./PresentationCanvas";
import { PresentationMode } from "./PresentationMode";
import { PresentationPreview } from "./PresentationPreview";

export function AdvancedPresentationStudio() {
  const {
    project,
    presentation,
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
  } = usePresentationStudio();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const [presentOpen, setPresentOpen] = useState(false);

  const minutes = estimatePresentationMinutes(presentation.blocks);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA] text-slate-900">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-slate-200/80 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-5">
        <Link
          to={`/studio/${project.id}/presentations`}
          className="rounded-lg px-2 py-1.5 text-sm text-slate-500 no-underline hover:bg-slate-50 hover:text-slate-900"
        >
          ← {project.title}
        </Link>
        <span className="max-w-[12rem] truncate text-sm font-semibold tracking-tight sm:max-w-xs">
          {presentation.properties.title || "Untitled presentation"}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500">
          {presentationStatusLabel(presentation.status)}
        </span>
        <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500 sm:inline">
          {presentation.blocks.length} slides · ~{minutes} min
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
          leadingActions={
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
            </>
          }
          trailingActions={
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              onClick={() => setPresentOpen(true)}
            >
              Present
            </button>
          }
        />
      </header>

      {propsOpen ? (
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
          <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
              Subject
              <input
                value={presentation.properties.subject}
                onChange={(e) => setProperties({ subject: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
              Grade
              <input
                value={presentation.properties.grade}
                onChange={(e) => setProperties({ grade: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
              Status
              <select
                value={presentation.status}
                onChange={(e) =>
                  setStatus(e.target.value as PresentationStudioStatus)
                }
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
              >
                {PRESENTATION_STUDIO_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
              Source
              <p className="flex h-10 items-center rounded-xl border border-slate-100 bg-slate-50 px-3 text-sm font-normal text-slate-700">
                {presentationSourceLabel(presentation.source.kind)}
                {presentation.source.sourceTitle
                  ? ` · ${presentation.source.sourceTitle}`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {previewOpen ? <PresentationPreview /> : <PresentationCanvas />}

      {presentOpen ? (
        <PresentationMode onClose={() => setPresentOpen(false)} />
      ) : null}
    </div>
  );
}
