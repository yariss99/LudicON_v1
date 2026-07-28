import type { InsightCategory } from "../types";

type InsightBadgeProps = {
  category: InsightCategory;
};

function InsightBadge({ category }: InsightBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 ring-1 ring-slate-200/80">
      {category}
    </span>
  );
}

export default InsightBadge;
