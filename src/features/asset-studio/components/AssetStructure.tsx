import { ALIGNMENT_STATUS_LABEL } from "../constants";
import type { StructureItem } from "../types";

type AssetStructureProps = {
  items: StructureItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function AssetStructure({ items, selectedId, onSelect }: AssetStructureProps) {
  return (
    <nav
      className="rounded-3xl bg-white p-4 ring-1 ring-slate-200/70 lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto"
      aria-label="Structura materialului"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        Structură
      </p>
      <h2 className="mt-1 text-sm font-semibold text-slate-900">
        Cuprinsul materialului
      </h2>
      <ul className="mt-4 space-y-1">
        {items.map((item) => {
          const active = selectedId === item.id;
          return (
            <li key={item.id} style={{ paddingLeft: item.depth * 12 }}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={[
                  "flex w-full flex-col rounded-2xl px-3 py-2.5 text-left transition-colors",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-800 hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="text-sm font-medium">{item.title}</span>
                <span
                  className={[
                    "mt-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    active ? "text-slate-300" : "text-slate-400",
                    item.alignment === "warning" || item.alignment === "conflict"
                      ? active
                        ? "text-amber-200"
                        : "text-amber-700"
                      : "",
                  ].join(" ")}
                >
                  {ALIGNMENT_STATUS_LABEL[item.alignment]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default AssetStructure;
