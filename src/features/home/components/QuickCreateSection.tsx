import { QUICK_CREATE_ITEMS, type QuickCreateItem } from "../constants";

type QuickCreateSectionProps = {
  onSelect: (item: QuickCreateItem) => void;
};

function QuickCreateSection({ onSelect }: QuickCreateSectionProps) {
  return (
    <section className="desk-enter desk-enter-delay mb-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        Quick actions
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {QUICK_CREATE_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              style={{ animationDelay: `${60 + index * 35}ms` }}
              className="desk-card group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <span className="text-sm font-medium text-slate-800">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default QuickCreateSection;
