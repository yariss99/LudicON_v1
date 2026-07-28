export type TimelineStatus =
  | "completed"
  | "in_progress"
  | "upcoming"
  | "needs_review";

export type TimelineResourceKind =
  | "worksheet"
  | "assessment"
  | "presentation"
  | "game"
  | "activities"
  | "notes";

export type TimelineRelatedResource = {
  id: string;
  kind: TimelineResourceKind;
  label: string;
};

export type TimelineLesson = {
  id: string;
  weekId: string;
  title: string;
  subject: string;
  grade: string;
  status: TimelineStatus;
  projectId?: string;
  relatedResourceIds: string[];
  durationMinutes: number;
};

export type TimelineWeek = {
  id: string;
  number: number;
  label: string;
  monthId: string;
  startDate: string;
  endDate: string;
  focus?: string;
};

export type TimelineMonth = {
  id: string;
  label: string;
  semesterId: string;
  shortLabel: string;
};

export type TimelineSemester = {
  id: string;
  label: string;
  yearId: string;
};

export type TimelineMemoryEntry = {
  id: string;
  weekNumber: number;
  title: string;
  notes: string;
  activities: string;
  results: string;
  reflection: string;
};

export type SchoolYearTimeline = {
  id: string;
  label: string;
  previousYearLabel: string;
  semesters: TimelineSemester[];
  months: TimelineMonth[];
  weeks: TimelineWeek[];
  lessons: TimelineLesson[];
  resources: TimelineRelatedResource[];
  memory: TimelineMemoryEntry[];
};

export type MoveSuggestion = {
  lessonId: string;
  fromWeekId: string;
  toWeekId: string;
  related: TimelineRelatedResource[];
};
