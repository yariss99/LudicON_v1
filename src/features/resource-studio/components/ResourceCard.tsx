import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import { resourceTypeLabel } from "../constants";
import { useResourceStudio } from "../hooks/useResourceStudio";
import type { ResourceStudioItem } from "../types";

type Props = {
  item: ResourceStudioItem;
  layout: "grid" | "list";
};

export function ResourceCard({ item, layout }: Props) {
  const {
    selectedId,
    setSelectedId,
    toggleFavorite,
    recordUse,
  } = useResourceStudio();
  const selected = selectedId === item.id;

  const open = () => {
    setSelectedId(item.id);
    recordUse(item.id);
  };

  if (layout === "list") {
    return (
      <article
        className={[
          "flex flex-wrap items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition",
          selected
            ? "border-slate-900/20 shadow-sm"
            : "border-slate-200/80 hover:border-slate-300",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={open}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold tracking-tight text-slate-900">
              {item.title}
            </h3>
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500">
              {resourceTypeLabel(item.type)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {[item.subject, item.grade, item.projectTitle]
              .filter(Boolean)
              .join(" · ")}{" "}
            · {formatRelativeTime(item.updatedAt)}
            {item.usageCount > 0 ? ` · used ${item.usageCount}×` : ""}
          </p>
        </button>
        <button
          type="button"
          aria-label={item.favorite ? "Unfavorite" : "Favorite"}
          className={[
            "rounded-lg px-2 py-1 text-sm",
            item.favorite ? "text-amber-500" : "text-slate-300 hover:text-amber-400",
          ].join(" ")}
          onClick={() => toggleFavorite(item.id)}
        >
          ★
        </button>
        {item.sourceHref ? (
          <Link
            to={item.sourceHref}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white no-underline"
            onClick={() => recordUse(item.id)}
          >
            Open
          </Link>
        ) : null}
      </article>
    );
  }

  return (
    <article
      className={[
        "flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition",
        selected
          ? "border-slate-900/25 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)]"
          : "border-slate-200/80 hover:border-slate-300",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={open} className="min-w-0 flex-1 text-left">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {resourceTypeLabel(item.type)}
          </span>
          <h3 className="mt-1 line-clamp-2 font-semibold tracking-tight text-slate-900">
            {item.title}
          </h3>
        </button>
        <button
          type="button"
          aria-label={item.favorite ? "Unfavorite" : "Favorite"}
          className={[
            "rounded-lg px-1.5 text-base leading-none",
            item.favorite ? "text-amber-500" : "text-slate-300 hover:text-amber-400",
          ].join(" ")}
          onClick={() => toggleFavorite(item.id)}
        >
          ★
        </button>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
        {item.description || item.contentPreview || "No description"}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {item.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[0.65rem] font-medium text-slate-500"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="mt-auto pt-3 text-[0.7rem] text-slate-400">
        {item.projectTitle}
        {item.subject ? ` · ${item.subject}` : ""}
        {item.grade ? ` · ${item.grade}` : ""}
        <br />
        Created {formatRelativeTime(item.createdAt)}
        {item.usageCount > 0 ? ` · reused ${item.usageCount}×` : ""}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={open}
          className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Details
        </button>
        {item.sourceHref ? (
          <Link
            to={item.sourceHref}
            onClick={() => recordUse(item.id)}
            className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white no-underline hover:bg-slate-800"
          >
            Open
          </Link>
        ) : null}
      </div>
    </article>
  );
}
