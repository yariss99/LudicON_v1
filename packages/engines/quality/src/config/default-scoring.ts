import type { ScoringModelConfig } from '../types.js';
import { ALL_QUALITY_DIMENSIONS } from '../types.js';

/** External scoring model configuration — weights & bands are data, not UI logic */
export const DEFAULT_SCORING_MODEL: ScoringModelConfig = {
  dimensionWeights: Object.fromEntries(
    ALL_QUALITY_DIMENSIONS.map((d) => [d, 1]),
  ) as ScoringModelConfig['dimensionWeights'],
  bandThresholds: {
    excellent: 90,
    veryGood: 80,
    good: 65,
    needsImprovement: 40,
  },
};

export const SCORING_MODEL_VERSION = 'quality-scoring-1.0.0';
