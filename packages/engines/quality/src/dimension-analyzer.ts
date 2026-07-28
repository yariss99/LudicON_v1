import type {
  DimensionScore,
  PolicyEvaluationResult,
  QualityDimension,
  QualityPolicy,
  ScoreConfidence,
} from './types.js';

/**
 * DimensionAnalyzer — aggregates policy results into dimension scores.
 */
export class DimensionAnalyzer {
  analyze(
    results: PolicyEvaluationResult[],
    policies: QualityPolicy[],
  ): DimensionScore[] {
    const byDim = new Map<QualityDimension, PolicyEvaluationResult[]>();
    for (const result of results) {
      const list = byDim.get(result.dimension) ?? [];
      list.push(result);
      byDim.set(result.dimension, list);
    }

    const scores: DimensionScore[] = [];
    for (const [dimension, dimResults] of byDim) {
      const policyMeta = policies.filter((p) => p.category === dimension);
      let weighted = 0;
      let weightSum = 0;
      for (const r of dimResults) {
        const meta = policyMeta.find((p) => p.policyId === r.policyId);
        const w = meta?.weight ?? 1;
        weighted += r.score * w;
        weightSum += w;
      }
      const score = Math.round(weighted / (weightSum || 1));
      const confidence = mergeConfidence(dimResults.map((r) => r.confidence));
      const evidence = dimResults.flatMap((r) => r.evidence);
      const strengths = evidence
        .filter((e) => e.kind === 'strength')
        .map((e) => e.statement);
      const weaknesses = evidence
        .filter((e) => e.kind === 'weakness')
        .map((e) => e.statement);
      const suggestedImprovements = [
        ...new Set(dimResults.flatMap((r) => r.improvements)),
      ];
      const policyIds = dimResults.map((r) => r.policyId);

      scores.push({
        dimension,
        score,
        confidence,
        evidence,
        strengths,
        weaknesses,
        suggestedImprovements,
        policyIds,
        explanation: {
          why: `Dimension “${dimension}” scored ${score}/100 from ${policyIds.length} policy evaluation(s).`,
          supportingEvidence: evidence.map((e) => e.statement),
          policies: policyIds,
          howToImprove:
            suggestedImprovements.length > 0
              ? suggestedImprovements
              : ['No improvements required for this dimension'],
        },
      });
    }
    return scores;
  }
}

function mergeConfidence(values: ScoreConfidence[]): ScoreConfidence {
  if (values.includes('low')) return 'low';
  if (values.includes('medium')) return 'medium';
  return 'high';
}
