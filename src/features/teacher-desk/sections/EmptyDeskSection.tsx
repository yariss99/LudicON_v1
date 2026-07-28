import { Plus } from "lucide-react";
import {
  CREATE_EXPERIENCE_LABEL,
  DESK_CARD_RADIUS,
  DESK_CARD_SHADOW,
  DESK_RING,
  EMPTY_DESK_SUBTITLE,
  EMPTY_DESK_TITLE,
} from "../constants";

type EmptyDeskSectionProps = {
  onCreate: () => void;
};

function EmptyDeskSection({ onCreate }: EmptyDeskSectionProps) {
  return (
    <section
      className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center"
      aria-labelledby="empty-desk-heading"
    >
      <div
        className={[
          DESK_CARD_RADIUS,
          DESK_CARD_SHADOW,
          DESK_RING,
          "w-full max-w-xl bg-white px-8 py-14 sm:px-12",
        ].join(" ")}
      >
        <div
          className="mx-auto flex h-40 w-full max-w-sm items-center justify-center rounded-3xl bg-gradient-to-br from-slate-50 via-sky-50/80 to-slate-100"
          role="img"
          aria-label="Ilustrație pentru prima ta lecție"
        >
          <div className="h-20 w-28 rounded-2xl bg-white/80 ring-1 ring-slate-200/70" />
        </div>

        <h1
          id="empty-desk-heading"
          className="mt-10 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
        >
          {EMPTY_DESK_TITLE}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-500">
          {EMPTY_DESK_SUBTITLE}
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          <Plus size={18} strokeWidth={2} aria-hidden />
          {CREATE_EXPERIENCE_LABEL}
        </button>
      </div>
    </section>
  );
}

export default EmptyDeskSection;
