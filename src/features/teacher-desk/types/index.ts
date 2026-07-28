import type { LucideIcon } from "lucide-react";
import type { Project } from "../../../types/project";

export type DeskNavId =
  | "atelier"
  | "lessons"
  | "create"
  | "library"
  | "prima"
  | "growth"
  | "settings";

export type DeskNavItem = {
  id: DeskNavId;
  label: string;
  href: string;
  icon: LucideIcon;
};

export type QuickAccessId =
  | "library"
  | "templates"
  | "ask_prima"
  | "settings";

export type QuickAccessItem = {
  id: QuickAccessId;
  title: string;
  description: string;
  href?: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export type InsightCategory =
  | "Evaluare"
  | "Diferențiere"
  | "Integrare digitală"
  | "Obiective de învățare"
  | "Calitatea planului"
  | "Resurse"
  | "Accesibilitate";

export type InsightState =
  | "loading"
  | "none"
  | "available"
  | "accepted"
  | "dismissed";

/** Single pedagogical insight for the active Learning Experience. */
export type TeachingInsight = {
  id: string;
  category: InsightCategory;
  title: string;
  explanation: string;
  whyItMatters: string;
  expectedImpact: string;
  /** Short label for ImpactBadge */
  impactLabel: string;
  suggestedAction: string;
};

export type TimelineEventKind =
  | "blueprint_approved"
  | "worksheet_generated"
  | "presentation_regenerated"
  | "assessment_updated"
  | "experience_completed";

export type TeachingTimelineItem = {
  id: string;
  kind: TimelineEventKind;
  title: string;
  detail: string;
  timestampLabel: string;
};

export type DeskNetworkState = "loading" | "ready" | "error";

export type JourneyStageId =
  | "context"
  | "competencies"
  | "objectives"
  | "activities"
  | "assessment"
  | "resources"
  | "review"
  | "generate";

export type JourneyStageStatus = "completed" | "current" | "pending";

export type JourneyStage = {
  id: JourneyStageId;
  label: string;
  status: JourneyStageStatus;
};

export type TodayFocusView = {
  experience: Project;
  stages: JourneyStage[];
  currentStageId: JourneyStageId;
  nextStep: string;
  estimatedMinutes: number;
  estimatedTimeLabel: string;
};

export type DailyBriefSummaryItem = {
  id: string;
  label: string;
};

export type DailyBriefPrimaryAction = "continue" | "create";

export type DailyBriefView = {
  greeting: string;
  teacherName: string;
  dayLabel: string;
  introduction: string;
  summary: DailyBriefSummaryItem[];
  primaryAction: DailyBriefPrimaryAction;
  primaryLabel: string;
  focusExperienceId: string | null;
};

export type TeachingOutcomeStatus = "completed" | "upcoming";

export type TeachingOutcome = {
  id: string;
  label: string;
  status: TeachingOutcomeStatus;
};

export type TodaysTeachingView = {
  experienceId: string;
  outcomes: TeachingOutcome[];
  estimatedMinutes: number;
  estimatedCompletionLabel: string;
};

export type DeskExperience = Project;
