import { clamp } from './ids.js';
import {
  DEFAULT_SCORING_MODEL,
  SCORING_MODEL_VERSION,
} from './config/default-scoring.js';
import type {
  DimensionScore,
  QualityBand,
  ScoringModelConfig,
} from './types.js';

/**
 * QualityScorer — configurable weighted overall score + bands.
 * Scoring logic driven by ScoringModelConfig (never hardcoded in UI).
 */
export class QualityScorer {
  constructor(private config: ScoringModelConfig = DEFAULT_SCORING_MODEL) {}

  get modelVersion(): string {
    return SCORING_MODEL_VERSION;
  }

  configure(config: ScoringModelConfig): void {
    this.config = structuredClone(config);
  }

  getConfig(): ScoringModelConfig {
    return structuredClone(this.config);
  }

  overall(dimensionScores: DimensionScore[]): {
    score: number;
    band: QualityBand;
  } {
    if (dimensionScores.length === 0) {
      return { score: 0, band: 'critical' as const };
    }

    let weighted = 0;
    let totalWeight = 0;
    for (const dim of dimensionScores) {
      const w = this.config.dimensionWeights[dim.dimension] ?? 1;
      weighted += dim.score * w;
      totalWeight += w;
    }
    const score = clamp(Math.round(weighted / (totalWeight || 1)));
    return { score, band: this.bandFor(score) };
  }

  bandFor(score: number): QualityBand {
    const t = this.config.bandThresholds;
    if (score >= t.excellent) return 'excellent';
    if (score >= t.veryGood) return 'very_good';
    if (score >= t.good) return 'good';
    if (score >= t.needsImprovement) return 'needs_improvement';
    return 'critical';
  }
}
