import { Link } from "react-router-dom";
import { createId } from "../../../utils/id";
import { formatAbsoluteDate, formatRelativeTime } from "../../../utils/date";
import { RESOURCE_TYPES, resourceTypeLabel } from "../constants";
import { useResourceStudio } from "../hooks/useResourceStudio";
import type { ResourceStudioType } from "../types";
import { AiInsightsPanel } from "./AiInsightsPanel";

export function ResourceDetailPanel() {
  const {
    selected,
    updateResource,
    toggleFavorite,
    linkReuse,
    deleteResource,
    recordUse,
    setSelectedId,
  } = useResourceStudio();

  if (!selected) {
    return (
      <aside className="hidden w-80 shrink-0 overflow-auto border-l border-slate-200 bg-white p-4 lg:block">
        <p className="text-sm font-semibold tracking-tight text-slate-900">
          Resource details
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Select a resource to edit metadata, mark favorites, or reuse it across
          lessons, worksheets, assessments, and presentations.
        </p>
        <div className="mt-6">
          <AiInsightsPanel />
        </div>
      </aside>
    );
  }

  const tagsText = selected.tags.join(", ");

  return (
    <aside className="w-full shrink-0 overflow-auto border-l border-slate-200 bg-white p-4 lg:w-80">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {resourceTypeLabel(selected.type)}
          </p>
          <h2 className="mt-1 text-sm font-semibold tracking-tight text-slate-900">
            Details
          </h2>
        </div>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-50 lg:hidden"
          onClick={() => setSelectedId(null)}
        >
          Close
        </button>
      </div>

      <label className="mt-4 flex flex-col gap-1 text-xs font-semibold text-slate-500">
        Title
        <input
          value={selected.title}
          onChange={(e) =>
            updateResource(selected.id, { title: e.target.value })
          }
          className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
        />
      </label>

      <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-500">
        Type
        <select
          value={selected.type}
          onChange={(e) =>
            updateResource(selected.id, {
              type: e.target.value as ResourceStudioType,
            })
          }
          className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
        >
          {RESOURCE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Subject
          <input
            value={selected.subject}
            onChange={(e) =>
              updateResource(selected.id, { subject: e.target.value })
            }
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Grade
          <input
            value={selected.grade}
            onChange={(e) =>
              updateResource(selected.id, { grade: e.target.value })
            }
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
          />
        </label>
      </div>

      <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-500">
        Tags
        <input
          value={tagsText}
          onChange={(e) =>
            updateResource(selected.id, {
              tags: e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
          placeholder="comma, separated"
          className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-normal"
        />
      </label>

      <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-slate-500">
        Description
        <textarea
          value={selected.description}
          onChange={(e) =>
            updateResource(selected.id, { description: e.target.value })
          }
          rows={3}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
        />
      </label>

      <dl className="mt-4 space-y-2 rounded-2xl bg-slate-50 px-3 py-3 text-xs text-slate-500">
        <div className="flex justify-between gap-2">
          <dt>Project</dt>
          <dd className="font-medium text-slate-700">{selected.projectTitle}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Created</dt>
          <dd>{formatAbsoluteDate(selected.createdAt)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Updated</dt>
          <dd>{formatRelativeTime(selected.updatedAt)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Usage</dt>
          <dd>{selected.usageCount}×</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Linked to</dt>
          <dd>{selected.linkedTo.length} artifacts</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggleFavorite(selected.id)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
        >
          {selected.favorite ? "Unfavorite" : "Favorite"}
        </button>
        <button
          type="button"
          onClick={() => {
            const artifactId = createId("reuse");
            linkReuse(selected.id, artifactId);
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
          title="Marks this resource as reused in another artifact"
        >
          Mark reused
        </button>
        {selected.sourceHref ? (
          <Link
            to={selected.sourceHref}
            onClick={() => recordUse(selected.id)}
            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white no-underline"
          >
            Open source
          </Link>
        ) : null}
        {selected.sourceKind !== "studio" ? (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete “${selected.title}”?`)) {
                deleteResource(selected.id);
              }
            }}
            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600"
          >
            Delete
          </button>
        ) : null}
      </div>

      <div className="mt-6">
        <AiInsightsPanel />
      </div>
    </aside>
  );
}
