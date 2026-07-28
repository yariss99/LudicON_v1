import type { DimensionScore, QualityReport } from './types.js';

/**
 * QualityExplainer — no score without explanation.
 */
export class QualityExplainer {
  explainReport(report: QualityReport) {
    return {
      reportId: report.reportId,
      overall: {
        score: report.overallScore,
        band: report.overallBand,
        why: `Overall quality is ${report.overallBand.replace('_', ' ')} (${report.overallScore}/100) using scoring model ${report.scoringModelVersion}.`,
        risks: report.detectedRisks.map((r) => r.message),
        improvements: report.suggestedImprovements,
      },
      dimensions: report.dimensionScores.map((d) => this.explainDimension(d)),
      /** Blueprint/content is never rewritten by this engine */
      mutatesBlueprint: false as const,
      generatesContent: false as const,
    };
  }

  explainDimension(dimension: DimensionScore) {
    if (
      !dimension.explanation.why ||
      dimension.explanation.supportingEvidence.length === 0 ||
      dimension.explanation.policies.length === 0
    ) {
      throw new Error(`Dimension ${dimension.dimension} lacks explanation`);
    }
    return {
      dimension: dimension.dimension,
      score: dimension.score,
      confidence: dimension.confidence,
      why: dimension.explanation.why,
      evidence: dimension.explanation.supportingEvidence,
      policies: dimension.explanation.policies,
      howToImprove: dimension.explanation.howToImprove,
    };
  }

  explainScore(report: QualityReport, dimension: DimensionScore['dimension']) {
    const dim = report.dimensionScores.find((d) => d.dimension === dimension);
    if (!dim) return { error: 'Dimension not found in report' as const };
    return this.explainDimension(dim);
  }
}
