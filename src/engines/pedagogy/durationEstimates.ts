import type { ProjectResource, ProjectResourceType } from "../../types/project";

/** Pedagogical time heuristics — not generative, rule-based. */
const BASE_MINUTES: Record<ProjectResourceType, number> = {
  blueprint: 0,
  lesson: 12,
  activities: 10,
  worksheet: 12,
  assessment: 8,
  presentation: 8,
  game: 12,
  notes: 0,
  reflection: 5,
  resources: 0,
  ai_notes: 0,
};

const STATUS_FACTOR: Record<ProjectResource["status"], number> = {
  ready: 1,
  draft: 0.85,
  empty: 0.35,
};

export function estimateResourceMinutes(resource: ProjectResource): number {
  const base = BASE_MINUTES[resource.type] ?? 0;
  if (base === 0) return 0;
  return Math.round(base * STATUS_FACTOR[resource.status]);
}

export function estimateExperienceMinutes(resources: ProjectResource[]): {
  total: number;
  breakdown: Array<{ resourceId: string; label: string; minutes: number }>;
} {
  const breakdown = resources
    .map((resource) => ({
      resourceId: resource.id,
      label: resource.label,
      minutes: estimateResourceMinutes(resource),
    }))
    .filter((item) => item.minutes > 0);

  const total = breakdown.reduce((sum, item) => sum + item.minutes, 0);
  return { total, breakdown };
}
