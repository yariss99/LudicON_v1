/**
 * Quality scorer — configurable weighted aggregate 0–100.
 */

import {
  DEFAULT_QUALITY_WEIGHTS,
  type QualityWeights,
  type ValidatorId,
  type ValidatorResult,
} from './types.js';

const DIMENSION_MAP: Record<keyof QualityWeights, readonly ValidatorId[]> = {
  schema: ['schema'],
  curriculum: ['curriculum', 'reference'],
  pedagogical: ['pedagogical', 'safety'],
  learningObjectives: ['learning-objective', 'competency'],
  consistency: ['consistency', 'duplicate', 'ai-output'],
  accessibility: ['accessibility'],
  language: ['language', 'formatting'],
};

export class QualityScorer {
  constructor(private readonly weights: QualityWeights = DEFAULT_QUALITY_WEIGHTS) {
    const sum =
      weights.schema +
      weights.curriculum +
      weights.pedagogical +
      weights.learningObjectives +
      weights.consistency +
      weights.accessibility +
      weights.language;
    if (Math.abs(sum - 1) > 0.001) {
      throw new Error(`Quality weights must sum to 1 (got ${sum}).`);
    }
  }

  score(results: readonly ValidatorResult[]): number {
    const byId = new Map(results.map((r) => [r.validatorId, r]));
    let total = 0;

    for (const [dim, weight] of Object.entries(this.weights) as [
      keyof QualityWeights,
      number,
    ][]) {
      const ids = DIMENSION_MAP[dim];
      const scores = ids
        .map((id) => byId.get(id)?.score)
        .filter((s): s is number => typeof s === 'number');
      const dimScore =
        scores.length === 0
          ? 100
          : scores.reduce((a, b) => a + b, 0) / scores.length;
      total += dimScore * weight;
    }

    return Math.round(Math.max(0, Math.min(100, total)));
  }
}
