import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PRIMA_SLI_SCHEMA_VERSION,
  SLI_PRIVACY_PRINCIPLES,
} from '../dist/prima-student-learning.js';

describe('Student Learning Intelligence contracts (FEATURE-008)', () => {
  it('declares privacy principles and schema', () => {
    assert.equal(PRIMA_SLI_SCHEMA_VERSION, '1.0.0');
    assert.ok(SLI_PRIVACY_PRINCIPLES.includes('no_ranking'));
    assert.ok(SLI_PRIVACY_PRINCIPLES.includes('no_predictive_grading'));
    assert.ok(SLI_PRIVACY_PRINCIPLES.includes('teacher_approval_required'));
  });
});
