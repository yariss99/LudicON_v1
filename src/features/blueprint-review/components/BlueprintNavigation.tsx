import { NAV_STATUS_LABEL } from "../constants";
import type { SectionReviewView } from "../types";

type BlueprintNavigationProps = {
  sections: SectionReviewView[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

function BlueprintNavigation({
  sections,
  activeId,
  onSelect,
}: BlueprintNavigationProps) {
  return (
    <nav
      className="rounded-3xl bg-white p-4 ring-1 ring-slate-200/70 lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto"
      aria-label="Părțile proiectului lecției"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        Proiectul lecției
      </p>
      <h2 className="mt-1 text-sm font-semibold text-slate-900">Navigare</h2>
      <ul className="mt-4 space-y-1">
        {sections.map((section) => {
          const active = activeId === section.id;
          const statusColor =
            section.navStatus === "completed"
              ? "text-emerald-700"
              : section.navStatus === "needs_review"
                ? "text-amber-700"
                : "text-slate-400";

          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                className={[
                  "flex w-full flex-col rounded-2xl px-3 py-2.5 text-left transition-colors",
                  active
                    ? "bg-slate-900 text-white"
                    : "hover:bg-slate-50 text-slate-800",
                ].join(" ")}
              >
                <span className="text-sm font-medium">{section.title}</span>
                <span
                  className={[
                    "mt-0.5 text-[11px]",
                    active ? "text-slate-300" : statusColor,
                  ].join(" ")}
                >
                  {NAV_STATUS_LABEL[section.navStatus]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BlueprintNavigation;
