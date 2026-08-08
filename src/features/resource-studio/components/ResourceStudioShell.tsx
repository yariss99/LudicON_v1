import { useState } from "react";
import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import {
  RESOURCE_SECTIONS,
  RESOURCE_TYPES,
} from "../constants";
import { useResourceStudio } from "../hooks/useResourceStudio";
import type {
  ResourceSortOption,
  ResourceStudioType,
  ResourceViewMode,
} from "../types";
import { ImportModal } from "./ImportModal";
import { ResourceCard } from "./ResourceCard";
import { ResourceDetailPanel } from "./ResourceDetailPanel";

type Props = {
  embedded?: boolean;
};

export function ResourceStudioShell({ embedded = false }: Props) {
  const {
    projectScope,
    section,
    setSection,
    view,
    setView,
    sort,
    setSort,
    filters,
    setFilters,
    visible,
    subjects,
    grades,
    sectionCounts,
    autosave,
    lastSavedAt,
    refresh,
    selectedId,
  } = useResourceStudio();
  const [importOpen, setImportOpen] = useState(false);

  const autosaveLabel =
    autosave === "saving"
      ? "Saving…"
      : autosave === "dirty"
        ? "Editing…"
        : lastSavedAt
          ? `Saved ${formatRelativeTime(lastSavedAt)}`
          : "Synced";

  return (
    <div
      className={[
        "flex flex-col bg-[#F7F8FA] text-slate-900",
        embedded ? "min-h-[70vh]" : "min-h-screen",
      ].join(" ")}
    >
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {!embedded ? (
              <Link
                to={
                  projectScope
                    ? `/studio/${projectScope.id}/overview`
                    : "/projects"
                }
                className="text-sm text-slate-500 no-underline hover:text-slate-900"
              >
                ← {projectScope ? projectScope.title : "Projects"}
              </Link>
            ) : null}
            <h1
              className={[
                "font-semibold tracking-tight text-slate-900",
                embedded ? "text-xl" : "mt-1 text-2xl",
              ].join(" ")}
            >
              Resource Studio
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {projectScope
                ? `Central library for ${projectScope.title} — never lose an educational asset.`
                : "Central library for every educational asset across your projects."}
              <span className="ml-2 text-xs text-slate-400">
                {autosaveLabel}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refresh}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Refresh index
            </button>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Import
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="hidden w-52 shrink-0 overflow-auto border-r border-slate-200 bg-white p-3 md:block">
          <p className="mb-2 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Library
          </p>
          <ul className="flex flex-col gap-0.5">
            {RESOURCE_SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={[
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition",
                    section === s.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span>{s.label}</span>
                  <span
                    className={[
                      "text-[0.7rem] tabular-nums",
                      section === s.id ? "text-white/70" : "text-slate-400",
                    ].join(" ")}
                  >
                    {sectionCounts[s.id]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-slate-200/80 bg-white px-4 py-3 sm:px-6">
            <div className="mb-3 flex gap-1 overflow-x-auto md:hidden">
              {RESOURCE_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={[
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                    section === s.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                value={filters.query}
                onChange={(e) => setFilters({ query: e.target.value })}
                placeholder="Search title, tags, project…"
                className="h-10 min-w-[160px] flex-1 rounded-xl border border-slate-200 bg-[#F7F8FA] px-3 text-sm sm:bg-white"
              />
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({
                    type: e.target.value as ResourceStudioType | "",
                  })
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Type</option>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ subject: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={filters.grade}
                onChange={(e) => setFilters({ grade: e.target.value })}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Grade</option>
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ResourceSortOption)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="updated">Recently updated</option>
                <option value="created">Recently created</option>
                <option value="recent">Recently used</option>
                <option value="usage">Most reused</option>
                <option value="alpha">Alphabetical</option>
              </select>
              <select
                value={view}
                onChange={(e) => setView(e.target.value as ResourceViewMode)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  setFilters({ favoritesOnly: !filters.favoritesOnly })
                }
                className={[
                  "h-10 rounded-xl border px-3 text-sm font-medium",
                  filters.favoritesOnly
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-white text-slate-600",
                ].join(" ")}
              >
                ★ Favorites
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            <main className="min-w-0 flex-1 overflow-auto px-4 py-5 sm:px-6">
              {visible.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-slate-100" />
                  <h3 className="text-lg font-semibold tracking-tight">
                    No resources here yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Create lessons, worksheets, or assessments — or import a
                    document, image, or link. Everything lands in this library.
                  </p>
                  <button
                    type="button"
                    onClick={() => setImportOpen(true)}
                    className="mt-5 inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
                  >
                    Import resource
                  </button>
                </div>
              ) : (
                <div
                  className={
                    view === "grid"
                      ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col gap-2"
                  }
                >
                  {visible.map((item) => (
                    <ResourceCard key={item.id} item={item} layout={view} />
                  ))}
                </div>
              )}
            </main>

            <div
              className={[
                selectedId ? "flex" : "hidden lg:flex",
                "fixed inset-0 z-30 bg-white lg:static lg:inset-auto lg:z-auto lg:bg-transparent",
              ].join(" ")}
            >
              <ResourceDetailPanel />
            </div>
          </div>
        </div>
      </div>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
