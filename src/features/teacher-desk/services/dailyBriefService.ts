import { teacherProfile } from "../../../data/workspaceData";
import type { Project } from "../../../types/project";
import {
  DAILY_BRIEF_CONTINUE_LABEL,
  DAILY_BRIEF_CREATE_LABEL,
  DAILY_BRIEF_INTRO_FRESH,
  DAILY_BRIEF_INTRO_WITH_WORK,
} from "../constants";
import type { DailyBriefSummaryItem, DailyBriefView } from "../types";
import { formatDeskDay } from "./formatDeskDay";
import { greetingForHour } from "./greeting";
import { pickTeachingInsight } from "./insightService";
import { isInsightDismissedForToday } from "./insightDismissStore";
import { buildTodayFocusView } from "./focusService";

const RECENT_MS = 1000 * 60 * 60 * 24 * 5;

function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

function countResourcesWaiting(projects: readonly Project[]): number {
  return projects.reduce((total, project) => {
    const waiting = project.resources.filter(
      (resource) =>
        resource.status === "draft" || resource.status === "empty",
    ).length;
    return total + waiting;
  }, 0);
}

function countRecentlyCompleted(projects: readonly Project[], now: number): number {
  return projects.filter((project) => {
    if (project.state !== "resources_ready") return false;
    const updated = Date.parse(project.updatedAt);
    if (Number.isNaN(updated)) return false;
    return now - updated <= RECENT_MS;
  }).length;
}

function buildSummary(input: {
  inProgress: number;
  resourcesWaiting: number;
  pendingRecommendations: number;
  recentlyCompleted: number;
  estimatedMinutes: number | null;
}): DailyBriefSummaryItem[] {
  const items: DailyBriefSummaryItem[] = [];

  if (input.inProgress > 0) {
    items.push({
      id: "in_progress",
      label: `${input.inProgress} ${plural(
        input.inProgress,
        "Lecție în lucru",
        "Lecții în lucru",
      )}`,
    });
  }

  if (input.resourcesWaiting > 0) {
    items.push({
      id: "resources_waiting",
      label: `${input.resourcesWaiting} ${plural(
        input.resourcesWaiting,
        "resource waiting for review",
        "resources waiting for review",
      )}`,
    });
  }

  if (input.pendingRecommendations > 0) {
    items.push({
      id: "pending_recommendations",
      label: `${input.pendingRecommendations} ${plural(
        input.pendingRecommendations,
        "pending recommendation",
        "pending recommendations",
      )}`,
    });
  }

  if (input.recentlyCompleted > 0) {
    items.push({
      id: "recently_completed",
      label: `${input.recentlyCompleted} ${plural(
        input.recentlyCompleted,
        "recently completed experience",
        "recently completed experiences",
      )}`,
    });
  }

  if (input.estimatedMinutes != null && input.estimatedMinutes > 0) {
    items.push({
      id: "estimated_remaining",
      label: `About ${input.estimatedMinutes} min of focused work remaining today`,
    });
  }

  return items;
}

/**
 * Personalized Daily Brief from desk context, pending work, and insight signal.
 * Memory / Recommendation engines are represented via local project + insight mocks.
 */
export function buildDailyBrief(
  projects: readonly Project[],
  focusExperience: Project | null,
): DailyBriefView {
  const now = Date.now();
  const inProgress = projects.length;
  const resourcesWaiting = countResourcesWaiting(projects);
  const recentlyCompleted = countRecentlyCompleted(projects, now);

  const insight = focusExperience
    ? pickTeachingInsight(focusExperience.id)
    : null;
  const pendingRecommendations =
    insight && !isInsightDismissedForToday(insight.id) ? 1 : 0;

  const focusView = focusExperience
    ? buildTodayFocusView(focusExperience)
    : null;

  const summary = buildSummary({
    inProgress,
    resourcesWaiting,
    pendingRecommendations,
    recentlyCompleted,
    estimatedMinutes: focusView?.estimatedMinutes ?? null,
  });

  const hasWork = Boolean(focusExperience) || summary.length > 0;

  return {
    greeting: greetingForHour(),
    teacherName: teacherProfile.firstName,
    dayLabel: formatDeskDay(),
    introduction: hasWork
      ? DAILY_BRIEF_INTRO_WITH_WORK
      : DAILY_BRIEF_INTRO_FRESH,
    summary,
    primaryAction: focusExperience ? "continue" : "create",
    primaryLabel: focusExperience
      ? DAILY_BRIEF_CONTINUE_LABEL
      : DAILY_BRIEF_CREATE_LABEL,
    focusExperienceId: focusExperience?.id ?? null,
  };
}
