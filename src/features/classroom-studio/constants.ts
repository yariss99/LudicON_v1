import type { ClassroomActivityKind, ClassroomModuleId } from "./types";

export const CLASSROOM_MODULES: readonly {
  id: ClassroomModuleId;
  label: string;
  description: string;
}[] = [
  {
    id: "dashboard",
    label: "Class Dashboard",
    description: "Overview of today’s teaching plan and linked resources.",
  },
  {
    id: "timeline",
    label: "Teaching Timeline",
    description: "Sequence of activities for the session.",
  },
  {
    id: "groups",
    label: "Groups",
    description: "Classroom groups for future differentiated activities.",
  },
  {
    id: "portfolios",
    label: "Student Portfolios",
    description: "Placeholder for learner evidence collections.",
  },
  {
    id: "calendar",
    label: "Lesson Calendar",
    description: "Schedule teaching sessions across days.",
  },
  {
    id: "progress",
    label: "Classroom Progress",
    description: "Session readiness and resource coverage.",
  },
  {
    id: "teaching",
    label: "Teaching Mode",
    description: "Live facilitation with notes and next steps.",
  },
] as const;

export const ACTIVITY_KIND_LABEL: Record<ClassroomActivityKind, string> = {
  lesson: "Lesson",
  presentation: "Presentation",
  worksheet: "Worksheet",
  game: "Game",
  assessment: "Assessment",
  break: "Break",
  custom: "Activity",
};

export const GROUP_COLORS = [
  "#0F172A",
  "#334155",
  "#475569",
  "#1E293B",
  "#64748B",
  "#94A3B8",
] as const;

export const CLASSROOM_AI_SUGGESTIONS = [
  {
    id: "pacing",
    label: "Adjust pacing",
    detail: "Shorten the next block if the class is running behind.",
  },
  {
    id: "intervention",
    label: "Recommend intervention",
    detail: "Offer a quick check-in for groups still on the previous challenge.",
  },
  {
    id: "differentiation",
    label: "Suggest differentiation",
    detail: "Assign an alternate path to one group in a future release.",
  },
  {
    id: "next",
    label: "Recommend next activity",
    detail: "Move to practice or assessment based on current progress.",
  },
] as const;

export const FUTURE_PLACEHOLDERS = [
  {
    id: "devices",
    label: "Student devices",
    detail: "Push activities to learner devices.",
  },
  {
    id: "live",
    label: "Live classroom",
    detail: "Real-time presence and shared board.",
  },
  {
    id: "attendance",
    label: "Attendance",
    detail: "Quick roll call linked to the session.",
  },
  {
    id: "parents",
    label: "Parent communication",
    detail: "Share session highlights with families.",
  },
  {
    id: "portfolios",
    label: "Student portfolios",
    detail: "Collect evidence across lessons and assessments.",
  },
] as const;
