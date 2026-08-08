import { motion } from "framer-motion";
import type { ExperienceFeatureRow } from "../types";

type ComparisonTableProps = {
  rows: readonly ExperienceFeatureRow[];
};

function Cell({ value }: { value: boolean }) {
  return (
    <td className="px-4 py-3.5 text-center text-sm">
      {value ? (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 font-semibold text-emerald-700">
          ✓
        </span>
      ) : (
        <span className="text-slate-300">—</span>
      )}
    </td>
  );
}

export function ComparisonTable({ rows }: ComparisonTableProps) {
  return (
    <motion.section
      className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-18px_rgba(15,23,42,0.14)]"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Experience comparison"
    >
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-semibold tracking-tight text-slate-900">
          Compare experiences
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Both modes keep AI support. Advanced unlocks deeper control.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-[0.06em] text-slate-400">
              <th className="px-6 py-3.5 font-semibold">Feature</th>
              <th className="px-4 py-3.5 text-center font-semibold">Guided</th>
              <th className="px-4 py-3.5 text-center font-semibold">Advanced</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.feature}
                className={
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                }
              >
                <th
                  scope="row"
                  className="px-6 py-3.5 text-left text-sm font-medium text-slate-700"
                >
                  {row.feature}
                </th>
                <Cell value={row.guided} />
                <Cell value={row.advanced} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
