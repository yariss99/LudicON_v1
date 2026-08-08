import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatRelativeTime } from "../../../utils/date";
import type { WorkspaceResourceItem } from "../services/workspaceInventory";

const KIND_LABEL: Record<string, string> = {
  lesson: "Lesson",
  worksheet: "Worksheet",
  assessment: "Assessment",
  presentation: "Presentation",
  game: "Game",
  story: "Story",
};

type Props = {
  items: WorkspaceResourceItem[];
};

export function RecentActivitySection({ items }: Props) {
  const recent = items.slice(0, 8);

  return (
    <section aria-labelledby="recent-activity">
      <h3
        id="recent-activity"
        className="mb-3 text-lg font-semibold tracking-tight text-slate-900"
      >
        Recent activity
      </h3>
      {recent.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          No resources yet — create your first one.
        </div>
      ) : (
        <ul className="space-y-2">
          {recent.map((item, index) => (
            <motion.li
              key={`${item.kind}-${item.id}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link
                to={item.href}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 no-underline shadow-sm transition hover:border-slate-300"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {KIND_LABEL[item.kind] ?? item.kind} created
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
