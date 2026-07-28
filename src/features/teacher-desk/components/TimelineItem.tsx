import {
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  Presentation,
  Stamp,
} from "lucide-react";
import type { TeachingTimelineItem, TimelineEventKind } from "../types";
import {
  DESK_CARD_HOVER_SHADOW,
  DESK_CARD_SHADOW,
  DESK_RING,
} from "../constants";

type TimelineItemProps = {
  item: TeachingTimelineItem;
};

const KIND_ICON: Record<
  TimelineEventKind,
  { icon: typeof Stamp; label: string }
> = {
  blueprint_approved: { icon: Stamp, label: "Proiect" },
  worksheet_generated: { icon: FileSpreadsheet, label: "Fișă" },
  presentation_regenerated: { icon: Presentation, label: "Prezentare" },
  assessment_updated: { icon: ClipboardCheck, label: "Evaluare" },
  experience_completed: { icon: CheckCircle2, label: "Finalizat" },
};

function TimelineItem({ item }: TimelineItemProps) {
  const meta = KIND_ICON[item.kind];
  const Icon = meta.icon;

  return (
    <article
      className={[
        "flex gap-4 rounded-2xl bg-white px-5 py-5 transition-shadow duration-300 sm:px-6",
        DESK_CARD_SHADOW,
        DESK_CARD_HOVER_SHADOW,
        DESK_RING,
      ].join(" ")}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600"
        aria-hidden
      >
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:justify-between sm:gap-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
        </div>
        <time className="mt-2 block shrink-0 text-xs text-slate-400 sm:mt-0">
          {item.timestampLabel}
        </time>
      </div>
    </article>
  );
}

export default TimelineItem;
