import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export type WorkspaceHubCardData = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  count: number;
  href: string;
};

type WorkspaceHubCardProps = {
  card: WorkspaceHubCardData;
  index: number;
};

export function WorkspaceHubCard({ card, index }: WorkspaceHubCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={card.href}
        className="group flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-18px_rgba(15,23,42,0.16)] no-underline transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_36px_-18px_rgba(15,23,42,0.22)]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-2xl shadow-inner"
            aria-hidden
          >
            {card.emoji}
          </span>
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600">
            {card.count}
          </span>
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
          {card.title}
        </h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">
          {card.description}
        </p>
        <span className="mt-4 text-sm font-medium text-slate-400 transition group-hover:text-slate-800">
          Open →
        </span>
      </Link>
    </motion.div>
  );
}
