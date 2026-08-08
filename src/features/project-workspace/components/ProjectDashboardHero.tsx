import { motion } from "framer-motion";

type Props = {
  title: string;
  schoolYear?: string;
  subject?: string;
  grade?: string;
  percentComplete: number;
};

export function ProjectDashboardHero({
  title,
  schoolYear,
  subject,
  grade,
  percentComplete,
}: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-[#F7F8FA] to-slate-100/90 px-5 py-6 sm:px-7"
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Project workspace
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-1.5 text-sm text-slate-500">
        {[schoolYear, subject, grade].filter(Boolean).join(" · ") ||
          "Teaching project"}
      </p>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold">
          <span className="uppercase tracking-[0.08em] text-slate-400">
            Project progress
          </span>
          <motion.span
            key={percentComplete}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="tabular-nums text-slate-800"
          >
            {percentComplete}%
          </motion.span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80">
          <motion.div
            className="h-full rounded-full bg-slate-900"
            initial={{ width: 0 }}
            animate={{ width: `${percentComplete}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </motion.header>
  );
}
