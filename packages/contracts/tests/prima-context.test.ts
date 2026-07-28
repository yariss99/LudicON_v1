import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PRIMA_CONTEXT_SCHEMA_VERSION,
  validatePrimaContextMvp,
  type PrimaContext,
} from '../dist/prima-context.js';

function baseContext(overrides: Partial<PrimaContext> = {}): PrimaContext {
  return {
    contextId: 'ctx-1',
    schemaVersion: PRIMA_CONTEXT_SCHEMA_VERSION,
    contextVersion: 1,
    createdAt: new Date().toISOString(),
    correlationId: 'corr-1',
    sufficiency: 'Partial',
    identity: {
      meta: {
        id: 'identity',
        presence: 'present',
        classification: 'confidential',
        persistence: 'session',
      },
      data: { subjectId: 'teacher-1', actorType: 'teacher' },
    },
    correlation: {
      meta: {
        id: 'correlation',
        presence: 'present',
        classification: 'internal',
        persistence: 'transient',
      },
      data: { correlationId: 'corr-1' },
    },
    provenance: [],
    ...overrides,
  };
}

describe('PrimaContext MVP validation', () => {
  it('accepts a minimal valid context', () => {
    const result = validatePrimaContextMvp(baseContext());
    assert.equal(result.ok, true, result.issues.map((i) => i.message).join('; '));
  });

  it('rejects Student Context when present', () => {
    const result = validatePrimaContextMvp(
      baseContext({
        student: {
          meta: {
            id: 'student',
            presence: 'present',
            classification: 'restricted',
            persistence: 'session',
          },
          data: { studentId: 's1' },
        },
      }),
    );
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => i.code === 'CTX_STUDENT_FORBIDDEN'));
  });

  it('requires identity', () => {
    const result = validatePrimaContextMvp(
      baseContext({
        identity: {
          meta: {
            id: 'identity',
            presence: 'absent',
            classification: 'confidential',
            persistence: 'session',
          },
        },
      }),
    );
    assert.equal(result.ok, false);
  });
});
