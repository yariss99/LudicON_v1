import { useId, useState } from "react";
import { AlertTriangle, Check, ChevronDown } from "lucide-react";
import { SECTION_STATUS_LABEL } from "../constants";
import type { ProgressSectionView, SectionStatus } from "../types";

type ProgressSectionProps = {
  section: ProgressSectionView;
};

function StatusGlyph({ status }: { status: SectionStatus }) {
  if (status === "completed") {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
        aria-hidden
      >
        <Check size={14} strokeWidth={2.5} />
      </span>
    );
  }

  if (status === "in_progress") {
    return (
      <span
        className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200"
        aria-hidden
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-sky-300/40" />
        <span className="relative h-2 w-2 rounded-full bg-sky-500" />
      </span>
    );
  }

  if (status === "needs_review") {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200"
        aria-hidden
      >
        <AlertTriangle size={13} strokeWidth={2.4} />
      </span>
    );
  }

  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-300 ring-1 ring-slate-200"
      aria-hidden
    >
      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
    </span>
  );
}

function ProgressSection({ section }: ProgressSectionProps) {
  const panelId = useId();
  const [expanded, setExpanded] = useState(false);
  const canExpand =
    section.status === "completed" && section.detailLines.length > 0;
  const isOpen = canExpand && expanded;

  return (
    <li
      className={[
        "rounded-2xl px-2 py-2.5 transition-[background-color,box-shadow,transform] duration-500 ease-out",
        section.highlighted
          ? "bg-sky-50/80 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.45)]"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="flex gap-3">
        <StatusGlyph status={section.status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">
                {section.label}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                {SECTION_STATUS_LABEL[section.status]}
              </p>
            </div>
            {canExpand ? (
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setExpanded((value) => !value)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <ChevronDown
                  size={16}
                  className={[
                    "transition-transform duration-300",
                    isOpen ? "rotate-180" : "",
                  ].join(" ")}
                  aria-hidden
                />
                <span className="sr-only">
                  {isOpen ? "Collapse" : "Expand"} {section.label}
                </span>
              </button>
            ) : null}
          </div>

          <p className="mt-1 text-xs leading-relaxed text-slate-500 transition-opacity duration-300">
            {section.preview ??
              (section.status === "in_progress"
                ? "Listening…"
                : section.status === "needs_review"
                  ? "Needs a clearer answer in conversation"
                  : "Waiting")}
          </p>

          <div
            id={panelId}
            className={[
              "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
              isOpen
                ? "mt-2 grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            ].join(" ")}
          >
            <div className="overflow-hidden">
              <ul className="space-y-1 rounded-xl bg-slate-50/80 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-100">
                {section.detailLines.map((line) => (
                  <li key={line} className="leading-relaxed">
                    {line}
                  </li>
                ))}
                <li className="pt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Read only — refine through conversation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export default ProgressSection;
