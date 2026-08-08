import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  ClipboardCheck,
  FileText,
  Gamepad2,
  Presentation,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { ActiveSuggestion, SuggestionIconId } from "../types";

const ICONS: Record<SuggestionIconId, LucideIcon> = {
  worksheet: FileText,
  presentation: Presentation,
  assessment: ClipboardCheck,
  remedial: Sparkles,
  story: BookMarked,
  game: Gamepad2,
};

type Props = {
  suggestion: ActiveSuggestion;
  onDismiss: (id: string) => void;
  index?: number;
};

export function SuggestionCard({ suggestion, onDismiss, index = 0 }: Props) {
  const Icon = ICONS[suggestion.icon] ?? Sparkles;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: 20, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 28, scale: 0.96 }}
      transition={{
        duration: 0.32,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.4)]"
    >
      <div className="flex items-start gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-900"
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">
            {suggestion.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {suggestion.explanation}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              to={suggestion.href}
              className="inline-flex items-center rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white no-underline transition hover:bg-slate-800"
            >
              {suggestion.actionLabel}
            </Link>
            {suggestion.dismissable ? (
              <button
                type="button"
                onClick={() => onDismiss(suggestion.id)}
                className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                Dismiss
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
