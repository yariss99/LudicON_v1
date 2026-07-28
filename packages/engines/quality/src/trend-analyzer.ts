import type { QualityHistory } from './quality-history.js';
import type {
  QualityDimension,
  QualityReport,
  TrendSnapshot,
} from './types.js';

/**
 * TrendAnalyzer — quality over time for teacher growth insights.
 */
export class TrendAnalyzer {
  private readonly cache = new Map<string, TrendSnapshot>();

  constructor(private readonly history: QualityHistory) {}

  analyze(teacherId: string): TrendSnapshot {
    const reports = this.history.forTeacher(teacherId);
    if (reports.length === 0) {
      const empty: TrendSnapshot = {
        teacherId,
        averageQuality: 0,
        recurringWeaknesses: [],
        teacherGrowth: 0,
        historyCount: 0,
      };
      this.cache.set(teacherId, empty);
      return empty;
    }

    const averageQuality = Math.round(
      reports.reduce((s, r) => s + r.overallScore, 0) / reports.length,
    );

    const weaknessCounts = new Map<QualityDimension, number>();
    for (const report of reports) {
      for (const dim of report.dimensionScores) {
        if (dim.score < 60) {
          weaknessCounts.set(dim.dimension, (weaknessCounts.get(dim.dimension) ?? 0) + 1);
        }
      }
    }
    const recurringWeaknesses = [...weaknessCounts.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([dim]) => dim);

    const mostImprovedDimension = this.findMostImproved(reports);
    const previous = reports[1];
    const latest = reports[0]!;
    const teacherGrowth = previous
      ? latest.overallScore - previous.overallScore
      : 0;

    const comparedToPrevious = previous
      ? this.compare(latest, previous)
      : undefined;

    const snapshot: TrendSnapshot = {
      teacherId,
      averageQuality,
      mostImprovedDimension,
      recurringWeaknesses,
      teacherGrowth,
      historyCount: reports.length,
      lastReportId: latest.reportId,
      comparedToPrevious,
    };
    this.cache.set(teacherId, snapshot);
    return structuredClone(snapshot);
  }

  getCached(teacherId: string): TrendSnapshot | undefined {
    const hit = this.cache.get(teacherId);
    return hit ? structuredClone(hit) : undefined;
  }

  private findMostImproved(
    reports: QualityReport[],
  ): QualityDimension | undefined {
    if (reports.length < 2) return undefined;
    const latest = reports[0]!;
    const previous = reports[1]!;
    let best: { dim: QualityDimension; delta: number } | undefined;
    for (const dim of latest.dimensionScores) {
      const prev = previous.dimensionScores.find(
        (d) => d.dimension === dim.dimension,
      );
      if (!prev) continue;
      const delta = dim.score - prev.score;
      if (!best || delta > best.delta) best = { dim: dim.dimension, delta };
    }
    return best && best.delta > 0 ? best.dim : undefined;
  }

  private compare(latest: QualityReport, previous: QualityReport) {
    const improved: QualityDimension[] = [];
    const declined: QualityDimension[] = [];
    for (const dim of latest.dimensionScores) {
      const prev = previous.dimensionScores.find(
        (d) => d.dimension === dim.dimension,
      );
      if (!prev) continue;
      if (dim.score > prev.score) improved.push(dim.dimension);
      if (dim.score < prev.score) declined.push(dim.dimension);
    }
    return {
      overallDelta: latest.overallScore - previous.overallScore,
      improved,
      declined,
    };
  }
}
