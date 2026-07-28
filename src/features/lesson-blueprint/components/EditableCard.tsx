import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import type { ReactNode } from "react";

type EditableCardProps = {
  id: string;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
  hint?: string;
  readOnly?: boolean;
  onAddInfo?: () => void;
  showAddInfo?: boolean;
};

function EditableCard({
  id,
  title,
  collapsed,
  onToggle,
  children,
  hint,
  readOnly,
  onAddInfo,
  showAddInfo,
}: EditableCardProps) {
  return (
    <section
      id={id}
      className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition-[padding] duration-300 sm:p-7"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {hint && !collapsed ? (
            <p className="mt-1 text-sm text-slate-500">{hint}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!readOnly && !collapsed ? (
            <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
              <Pencil size={12} aria-hidden />
              Editare
            </span>
          ) : null}
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <>
                Extinde <ChevronDown size={14} aria-hidden />
              </>
            ) : (
              <>
                Restrânge <ChevronUp size={14} aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>
      <div
        className={[
          "grid transition-all duration-300 ease-out",
          collapsed
            ? "mt-0 grid-rows-[0fr] opacity-0"
            : "mt-5 grid-rows-[1fr] opacity-100",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          {showAddInfo && onAddInfo && !readOnly ? (
            <div className="mb-4 space-y-3">
              <p className="text-sm leading-relaxed text-slate-500">{hint}</p>
              <button
                type="button"
                onClick={onAddInfo}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Adaugă informații
              </button>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}

export default EditableCard;
