import type {
  ExperienceEvolutionPoint,
  ExperienceVersion,
} from "../../types/classroom";

export function buildEvolution(
  versions: ExperienceVersion[],
  projectId: string,
): ExperienceEvolutionPoint[] {
  return versions
    .filter((v) => v.projectId === projectId)
    .sort((a, b) => a.version - b.version)
    .map((version) => {
      const resourceCount = version.resources.length;
      const readyCount = version.resources.filter(
        (r) => r.status === "ready",
      ).length;
      const methodBonus = Math.min(version.methods.length * 8, 32);
      const maturity = Math.min(
        100,
        Math.round(
          (readyCount / Math.max(resourceCount, 1)) * 55 +
            methodBonus +
            Math.min(version.version * 8, 24),
        ),
      );

      return {
        versionId: version.id,
        version: version.version,
        label: version.label,
        savedAt: version.savedAt,
        note: version.note,
        resourceCount,
        readyCount,
        maturity,
      };
    });
}
