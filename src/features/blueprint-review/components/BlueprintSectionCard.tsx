import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SectionReviewView } from "../types";

type BlueprintSectionCardProps = {
  section: SectionReviewView;
};

function BlueprintSectionCard({ section }: BlueprintSectionCardProps) {
  const [historyOpen, setHistoryOpen] = useState(false);

  const confidenceTone =
    section.confidenceLevel === "high"
      ? "bg-emerald-50 text-emerald-800"
      : section.confidenceLevel === "medium"
        ? "bg-sky-50 text-sky-800"
        : section.confidenceLevel === "low"
          ? "bg-amber-50 text-amber-900"
          : "bg-slate-50 text-slate-500";

  return (
    <section
      id={`blueprint-section-${section.id}`}
      className="scroll-mt-24 rounded-3xl bg-white p-5 ring-1 ring-slate-200/70"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            {section.title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            {section.pedagogicalSummary}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${confidenceTone}`}
        >
          Confidence · {section.confidenceLevel}
        </span>
      </div>

      {section.supportingNotes.length > 0 ? (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Supporting notes
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-500">
            {section.supportingNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {section.teacherComments.length > 0 ? (
        <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Teacher comments
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {section.teacherComments.map((comment) => (
              <li key={comment}>“{comment}”</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setHistoryOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
          aria-expanded={historyOpen}
        >
          Revision history
          <ChevronDown
            size={14}
            className={historyOpen ? "rotate-180 transition" : "transition"}
            aria-hidden
          />
        </button>
        {historyOpen ? (
          <ul className="mt-2 space-y-1 text-xs text-slate-500">
            {section.revisionHistory.length === 0 ? (
              <li>No revisions for this section yet.</li>
            ) : (
              section.revisionHistory.map((item) => (
                <li key={`${item.at}_${item.summary}`}>
                  {new Date(item.at).toLocaleString()} — {item.summary}
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export default BlueprintSectionCard;
