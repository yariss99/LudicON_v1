import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Gamepad2,
  Presentation,
  School,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type {
  PedagogicalSuggestion,
  SuggestionIconId,
} from "../suggestionTypes";

const ICONS: Record<SuggestionIconId, LucideIcon> = {
  worksheet: FileText,
  presentation: Presentation,
  assessment: ClipboardCheck,
  game: Gamepad2,
  story: BookOpen,
  remedial: Sparkles,
  classroom: School,
};

type Props = {
  suggestion: PedagogicalSuggestion;
  onDismiss: (id: string) => void;
  index?: number;
};

export function SuggestionCard({ suggestion, onDismiss, index = 0 }: Props) {
  const Icon = ICONS[suggestion.icon] ?? Sparkles;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{
        duration: 0.28,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)]"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-800">
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
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
              className="inline-flex items-center rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white no-underline transition hover:bg-slate-800"
            >
              {suggestion.actionLabel}
            </Link>
            <button
              type="button"
              onClick={() => onDismiss(suggestion.id)}
              className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
