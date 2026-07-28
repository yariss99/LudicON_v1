import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_REFLECTION_PROMPTS,
  PRIMA_RPTI_SCHEMA_VERSION,
  promptsForMode,
} from '../dist/prima-reflective-practice.js';

describe('Reflective Practice contracts (FEATURE-006)', () => {
  it('exposes prompt catalog and schema version', () => {
    assert.equal(PRIMA_RPTI_SCHEMA_VERSION, '1.0.0');
    assert.ok(DEFAULT_REFLECTION_PROMPTS.length >= 6);
  });

  it('limits quick mode to a short prompt set', () => {
    const quick = promptsForMode('quick');
    assert.ok(quick.length <= 3);
    assert.ok(quick.every((p) => typeof p.questionRo === 'string'));
  });
});
