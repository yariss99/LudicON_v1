/**
 * Classroom Studio — operational hub connecting all educational studios.
 */

export type ClassroomModuleId =
  | "dashboard"
  | "timeline"
  | "groups"
  | "portfolios"
  | "calendar"
  | "progress"
  | "teaching";

export type ClassroomActivityKind =
  | "lesson"
  | "presentation"
  | "worksheet"
  | "game"
  | "assessment"
  | "break"
  | "custom";

export type ClassroomActivity = {
  id: string;
  title: string;
  kind: ClassroomActivityKind;
  resourceId?: string;
  resourceHref?: string;
  estimatedMinutes: number;
  teacherNotes: string;
  order: number;
};

export type ClassroomGroup = {
  id: string;
  name: string;
  color: string;
  memberLabels: string[];
  notes: string;
};

export type ClassroomCalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  activityId?: string;
  notes: string;
};

export type ClassroomSession = {
  id: string;
  projectId: string;
  title: string;
  className: string;
  lessonId?: string;
  lessonTitle?: string;
  presentationId?: string;
  worksheetId?: string;
  gameId?: string;
  assessmentId?: string;
  activities: ClassroomActivity[];
  groups: ClassroomGroup[];
  calendarEvents: ClassroomCalendarEvent[];
  activeActivityId: string | null;
  teachingNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type ClassroomResourcePick = {
  lessons: { id: string; title: string }[];
  presentations: { id: string; title: string }[];
  worksheets: { id: string; title: string }[];
  games: { id: string; title: string }[];
  assessments: { id: string; title: string }[];
};
