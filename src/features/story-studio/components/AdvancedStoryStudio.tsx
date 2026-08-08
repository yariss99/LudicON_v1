import { useState } from "react";
import { Link } from "react-router-dom";
import { StudioPersistenceControls } from "../../../modules/editor-persistence";
import {
  STORY_STUDIO_STATUSES,
  STORY_THEMES,
  storySourceLabel,
  storyStatusLabel,
  storyThemeLabel,
} from "../constants";
import { useStoryStudio } from "../hooks/useStoryStudio";
import type { StoryStudioStatus, StoryThemeId } from "../types";
import { AiSuggestionsPanel } from "./AiSuggestionsPanel";
import { StoryCanvas } from "./StoryCanvas";
import { StoryPreview } from "./StoryPreview";
import { StoryTimeline } from "./StoryTimeline";

export function AdvancedStoryStudio() {
  const {
    project,
    story,
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
    setTheme,
  } = useStoryStudio();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA] text-slate-900">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-slate-200/80 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-5">
        <Link
          to={`/studio/${project.id}/stories`}
          className="rounded-lg px-2 py-1.5 text-sm text-slate-500 no-underline hover:bg-slate-50 hover:text-slate-900"
        >
          ← {project.title}
        </Link>
        <span className="max-w-[12rem] truncate text-sm font-semibold tracking-tight sm:max-w-xs">
          {story.properties.title || "Untitled story"}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500">
          {storyStatusLabel(story.status)}
        </span>
        <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500 sm:inline">
          {storyThemeLabel(story.properties.theme)}
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
                onClick={() => setSideOpen((v) => !v)}
              >
                {sideOpen ? "Hide panel" : "Timeline"}
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

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          {previewOpen ? (
            <StoryPreview />
          ) : (
            <StoryCanvas
              activeId={activeId}
              onActiveChange={setActiveId}
            />
          )}
        </div>

        {sideOpen ? (
          <aside className="hidden w-80 shrink-0 overflow-auto border-l border-slate-200 bg-white p-4 lg:block">
            <div className="space-y-4">
              <StoryTimeline
                activeId={activeId}
                onSelect={setActiveId}
              />
              <AiSuggestionsPanel />
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
                <h2 className="text-sm font-semibold tracking-tight">
                  Properties
                </h2>
                <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-500">
                  Theme
                  <select
                    value={story.properties.theme}
                    onChange={(e) => setTheme(e.target.value as StoryThemeId)}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
                  >
                    {STORY_THEMES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-500">
                  Subject
                  <input
                    value={story.properties.subject}
                    onChange={(e) =>
                      setProperties({ subject: e.target.value })
                    }
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-500">
                  Grade
                  <input
                    value={story.properties.grade}
                    onChange={(e) => setProperties({ grade: e.target.value })}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-500">
                  Status
                  <select
                    value={story.status}
                    onChange={(e) =>
                      setStatus(e.target.value as StoryStudioStatus)
                    }
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
                  >
                    {STORY_STUDIO_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-3 text-xs text-slate-400">
                  Source: {storySourceLabel(story.source.kind)}
                  {story.source.sourceTitle
                    ? ` · ${story.source.sourceTitle}`
                    : ""}
                </p>
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
