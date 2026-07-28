import type { TimelineStatus } from "../../types/timeline";

export const STATUS_LABEL: Record<TimelineStatus, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  upcoming: "Upcoming",
  needs_review: "Needs Review",
};

export const STATUS_STYLE: Record<TimelineStatus, string> = {
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  in_progress: "bg-sky-50 text-sky-700 ring-sky-100",
  upcoming: "bg-slate-100 text-slate-600 ring-slate-200/80",
  needs_review: "bg-amber-50 text-amber-800 ring-amber-100",
};

export const RESOURCE_KIND_LABEL: Record<string, string> = {
  worksheet: "Worksheet",
  assessment: "Assessment",
  presentation: "Presentation",
  game: "Game",
  activities: "Activities",
  notes: "Notes",
};
