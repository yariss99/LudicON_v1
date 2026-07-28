import { ClipboardList, X } from "lucide-react";
import type { ProgressSectionView } from "../types";
import { SECTION_STATUS_LABEL } from "../constants";
import ProgressSection from "./ProgressSection";

type BlueprintLivePanelProps = {
  sections: ProgressSectionView[];
  nextHint: string;
  canOpenWorkspace: boolean;
  onOpenWorkspace: () => void;
  /** Desktop sticky / tablet collapsible body / mobile drawer */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout: "sticky" | "collapsible" | "drawer";
};

function PanelBody({
  sections,
  nextHint,
  canOpenWorkspace,
  onOpenWorkspace,
}: Pick<
  BlueprintLivePanelProps,
  "sections" | "nextHint" | "canOpenWorkspace" | "onOpenWorkspace"
>) {
  const completed = sections.filter((s) => s.status === "completed").length;
  const inProgress = sections.find((s) => s.status === "in_progress");
  const needsReview = sections.filter((s) => s.status === "needs_review").length;

  return (
    <>
      <div className="border-b border-slate-100 pb-4">
        <p className="text-sm font-semibold text-slate-900">
          Proiectul lecției
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Ce știm până acum. Modificările se fac prin conversație.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
            {completed} {SECTION_STATUS_LABEL.completed}
          </span>
          {needsReview > 0 ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
              {needsReview} {SECTION_STATUS_LABEL.needs_review}
            </span>
          ) : null}
          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-500">
            {completed} din {sections.length} gata
          </span>
        </div>
      </div>

      <ul className="mt-2 divide-y divide-slate-50">
        {sections.map((section) => (
          <ProgressSection key={section.id} section={section} />
        ))}
      </ul>

      <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Următorul pas
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          {inProgress
            ? `${inProgress.label} e în lucru. ${nextHint}`
            : nextHint}
        </p>
      </div>

      {canOpenWorkspace ? (
        <button
          type="button"
          onClick={onOpenWorkspace}
          className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          Verifică și modifică lecția
        </button>
      ) : (
        <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
          Continuă conversația — o întrebare pe rând.
        </p>
      )}
    </>
  );
}

/**
 * IT-002.5 — Blueprint Live Panel
 * Sticky on desktop, collapsible on tablet, drawer on mobile.
 * Sections update in place — never remount the whole list.
 */
function BlueprintLivePanel({
  sections,
  nextHint,
  canOpenWorkspace,
  onOpenWorkspace,
  open,
  onOpenChange,
  layout,
}: BlueprintLivePanelProps) {
  const body = (
    <PanelBody
      sections={sections}
      nextHint={nextHint}
      canOpenWorkspace={canOpenWorkspace}
      onOpenWorkspace={onOpenWorkspace}
    />
  );

  if (layout === "drawer") {
    return (
      <>
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="fixed bottom-5 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          <ClipboardList size={16} aria-hidden />
          Proiectul lecției
        </button>

        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal>
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/35"
              aria-label="Închide proiectul lecției"
              onClick={() => onOpenChange(false)}
            />
            <aside
              className="absolute inset-y-0 right-0 flex w-[min(100%,360px)] flex-col bg-white shadow-2xl"
              aria-label="Proiectul lecției"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  Proiectul lecției
                </p>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <X size={16} aria-hidden />
                  <span className="sr-only">Închide</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{body}</div>
            </aside>
          </div>
        ) : null}
      </>
    );
  }

  if (layout === "collapsible") {
    return (
      <aside
        className="rounded-3xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70"
        aria-label="Proiectul lecției"
      >
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
          aria-expanded={open}
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Proiectul lecției
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {open ? "Atinge pentru a închide" : "Atinge ca să vezi ce știm până acum"}
            </p>
          </div>
          <ClipboardList size={18} className="text-slate-400" aria-hidden />
        </button>
        <div
          className={[
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="overflow-hidden">
            <div className="border-t border-slate-100 px-5 pb-5 pt-2">{body}</div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="flex h-fit flex-col rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70 lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto"
      aria-label="Proiectul lecției"
    >
      {body}
    </aside>
  );
}

export default BlueprintLivePanel;
