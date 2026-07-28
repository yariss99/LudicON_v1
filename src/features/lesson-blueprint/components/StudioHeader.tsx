import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  AUTO_SAVE_HEADER,
  AUTO_SAVE_SYNCING,
  LESSON_BLUEPRINT_SUBTITLE,
  LESSON_BLUEPRINT_TITLE,
} from "../constants";
import { formatRelativeTime } from "../services/studioState";

type StudioHeaderProps = {
  subject?: string;
  grade?: string;
  topic?: string;
  saving: boolean;
  updatedAt: string;
};

function StudioHeader({
  subject,
  grade,
  topic,
  saving,
  updatedAt,
}: StudioHeaderProps) {
  const titleLine = [subject, grade, topic].filter(Boolean).join(" · ");

  return (
    <header className="border-b border-slate-200/70 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            to="/create/experience"
            className="mt-1 inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-slate-500 no-underline hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowLeft size={16} aria-hidden />
            Conversație
          </Link>
          <div className="hidden h-10 w-px bg-slate-200 sm:block" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {LESSON_BLUEPRINT_TITLE}
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {titleLine || "Lecția ta"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {LESSON_BLUEPRINT_SUBTITLE}
            </p>
            <p className="mt-2 text-xs font-medium text-emerald-700">
              {saving ? AUTO_SAVE_SYNCING : AUTO_SAVE_HEADER}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Ultima modificare · {formatRelativeTime(updatedAt)}
        </p>
      </div>
    </header>
  );
}

export default StudioHeader;
