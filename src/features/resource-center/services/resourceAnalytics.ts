import type { KnowledgeResource, ResourceAnalytics } from "../types";

export function computeResourceAnalytics(
  resources: readonly KnowledgeResource[],
): ResourceAnalytics {
  const active = resources.filter((r) => !r.archived);

  const mostUsed = [...active]
    .sort(
      (a, b) =>
        b.usage.openCount +
        b.usage.reuseCount * 2 -
        (a.usage.openCount + a.usage.reuseCount * 2),
    )
    .slice(0, 8);

  const mostEffective = [...active]
    .filter((r) => (r.usage.effectivenessScore ?? r.usage.reuseCount) > 0)
    .sort(
      (a, b) =>
        (b.usage.effectivenessScore ?? b.usage.reuseCount) -
        (a.usage.effectivenessScore ?? a.usage.reuseCount),
    )
    .slice(0, 8);

  const recentlyCreated = [...active]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 8);

  const recentlyUpdated = [...active]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 8);

  const unused = active
    .filter((r) => r.usage.openCount === 0 && r.usage.reuseCount === 0)
    .slice(0, 12);

  const coverageMap = new Map<string, number>();
  for (const r of active) {
    for (const ref of r.curriculumRefs) {
      coverageMap.set(ref, (coverageMap.get(ref) ?? 0) + 1);
    }
  }
  const curriculumCoverage = Array.from(coverageMap.entries())
    .map(([ref, count]) => ({ ref, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const authorMap = new Map<string, number>();
  for (const r of active) {
    authorMap.set(r.author, (authorMap.get(r.author) ?? 0) + 1);
  }
  const teacherActivity = Array.from(authorMap.entries())
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count);

  const totalReuses = active.reduce((s, r) => s + r.usage.reuseCount, 0);
  const sharedCount = active.filter((r) => r.shareScope !== "personal").length;

  return {
    mostUsed,
    mostEffective: mostEffective.length ? mostEffective : mostUsed,
    recentlyCreated,
    recentlyUpdated,
    unused,
    curriculumCoverage,
    teacherActivity,
    reuseStats: {
      totalReuses,
      avgReusePerAsset: active.length
        ? Math.round((totalReuses / active.length) * 100) / 100
        : 0,
      sharedCount,
    },
  };
}
