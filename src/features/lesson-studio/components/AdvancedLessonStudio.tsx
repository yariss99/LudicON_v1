import { useState } from "react";
import { Link } from "react-router-dom";
import { StudioPersistenceControls } from "../../../modules/editor-persistence";
import { LESSON_STATUSES, statusLabel } from "../constants";
import { useLessonStudio } from "../hooks/useLessonStudio";
import { LessonCanvas } from "./LessonCanvas";
import { LessonPreview } from "./LessonPreview";
import type { LessonStudioStatus } from "../types";

/**
 * Advanced Mode — direct Notion-like Lesson Studio.
 */
export function AdvancedLessonStudio() {
  const {
    project,
    lesson,
    autosave,
    lastSavedAt,
    canUndo,
    canRedo,
    versions,
    draftOffer,
    undo,
    redo,
    restoreVersion,
    saveNow,
    setStatus,
    setProperties,
    wordCount,
  } = useLessonStudio();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA] text-slate-900">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-slate-200/80 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-5">
        <Link
          to={`/studio/${project.id}/lessons`}
          className="rounded-lg px-2 py-1.5 text-sm text-slate-500 no-underline hover:bg-slate-50 hover:text-slate-900"
        >
          ← {project.title}
        </Link>
        <span className="hidden text-slate-300 sm:inline">/</span>
        <span className="max-w-[12rem] truncate text-sm font-semibold tracking-tight sm:max-w-xs">
          {lesson.properties.title || "Untitled lesson"}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
            lesson.status === "published"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {statusLabel(lesson.status)}
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
          onSave={() => saveNow()}
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
        />
      </header>

      {propsOpen ? (
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
          <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
              Subject
              <input
                value={lesson.properties.subject}
                onChange={(e) => setProperties({ subject: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
              Grade
              <input
                value={lesson.properties.grade}
                onChange={(e) => setProperties({ grade: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
              Duration
              <input
                type="number"
                value={lesson.properties.durationMinutes}
                onChange={(e) =>
                  setProperties({
                    durationMinutes: Number(e.target.value) || 45,
                  })
                }
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
              Status
              <select
                value={lesson.status}
                onChange={(e) =>
                  setStatus(e.target.value as LessonStudioStatus)
                }
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
              >
                {LESSON_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="sm:col-span-2 text-xs text-slate-400">
              {wordCount} words · v{lesson.version}
            </p>
          </div>
        </div>
      ) : null}

      {previewOpen ? <LessonPreview /> : <LessonCanvas />}
    </div>
  );
}
