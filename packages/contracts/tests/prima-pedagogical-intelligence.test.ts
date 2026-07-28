import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PIE_DIMENSION_IDS,
  PRIMA_PIE_SCHEMA_VERSION,
  clampPieScore,
  emptyPieAnalysisInput,
  validatePieAnalysisInputMvp,
  weightedOverall,
} from '../dist/prima-pedagogical-intelligence.js';

describe('Pedagogical Intelligence Engine contracts (FEATURE-003)', () => {
  it('exposes ten analysis dimensions', () => {
    assert.equal(PIE_DIMENSION_IDS.length, 10);
    assert.equal(PRIMA_PIE_SCHEMA_VERSION, '1.0.0');
  });

  it('validates required input fields', () => {
    const issues = validatePieAnalysisInputMvp(
      emptyPieAnalysisInput({ lessonProjectId: '', title: '' }),
    );
    assert.ok(issues.some((i) => i.code === 'PIE-V-001'));
    assert.ok(issues.some((i) => i.code === 'PIE-V-002'));
  });

  it('clamps and weights scores for improvement scorecards', () => {
    assert.equal(clampPieScore(120), 100);
    assert.equal(clampPieScore(-5), 0);
    const overall = weightedOverall(
      [
        {
          dimension: 'curriculum_alignment',
          score: 100,
          summary: '',
          evidence: [],
        },
        {
          dimension: 'differentiation',
          score: 50,
          summary: '',
          evidence: [],
        },
      ],
      { curriculum_alignment: 1, differentiation: 1 },
    );
    assert.equal(overall, 75);
  });
});
