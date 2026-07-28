import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createValidationEngine,
  isDeliverableToTeacher,
} from '../index.js';
import type { ValidationArtifact } from '../types.js';

function lesson(payload: Record<string, unknown>): ValidationArtifact {
  return {
    artifactId: 'art-1',
    artifactType: 'Lesson',
    version: '1',
    workflowId: 'wf-1',
    teacherId: 't-1',
    projectId: 'p-1',
    locale: 'ro',
    payload,
  };
}

describe('ValidationEngine', () => {
  it('rejects publication when learning objectives are missing (CRITICAL)', async () => {
    const engine = createValidationEngine();
    const report = await engine.validate(
      lesson({
        title: 'Fracții',
        subject: 'Matematică',
        grade: 'Clasa a III-a',
        content: 'Activități cu fracții unitare.',
      }),
      { profileId: 'Publication' },
    );
    assert.equal(report.overallStatus, 'rejected');
    assert.ok(report.failedValidators.includes('learning-objective'));
    assert.equal(isDeliverableToTeacher(report), false);
  });

  it('approves a complete lesson for publication', async () => {
    const engine = createValidationEngine();
    const report = await engine.validate(
      lesson({
        title: 'Fracții',
        subject: 'Matematică',
        grade: 'Clasa a III-a',
        content: 'Activități cu fracții unitare.',
        objectives: ['Compară fracții unitare'],
        competencies: ['Operarea cu numere'],
        language: 'ro',
      }),
      {
        profileId: 'Publication',
        expectedSubject: 'Matematică',
        expectedGrade: 'Clasa a III-a',
      },
    );
    assert.ok(
      report.overallStatus === 'approved' ||
        report.overallStatus === 'approved_with_warnings' ||
        report.overallStatus === 'repaired',
    );
    assert.ok(report.overallScore >= 75);
    assert.equal(isDeliverableToTeacher(report), true);
    assert.ok(engine.getAuditService().list().length > 0);
  });

  it('blocks unsafe content as CRITICAL', async () => {
    const engine = createValidationEngine();
    const report = await engine.validate(
      lesson({
        title: 'Bad',
        subject: 'Matematică',
        content: 'how to make a bomb',
        objectives: ['x'],
      }),
      { profileId: 'Draft' },
    );
    assert.equal(report.overallStatus, 'rejected');
    assert.ok(report.errors.some((e) => e.validatorId === 'safety'));
  });

  it('emits WARNING for grade-2 readability rule example', async () => {
    const engine = createValidationEngine();
    const report = await engine.validate(
      {
        artifactId: 'ws-1',
        artifactType: 'Worksheet',
        version: '1',
        payload: {
          title: 'WS',
          subject: 'Matematică',
          grade: '2',
          content: 'Long academic prose',
          readability: 5,
          language: 'ro',
        },
      },
      { profileId: 'InternalReview' },
    );
    assert.ok(
      report.warnings.some((w) => w.metadata.ruleId === 'READABILITY-GRADE2') ||
        report.results.some(
          (r) =>
            r.validatorId === 'language' &&
            r.status === 'failed' &&
            r.severity === 'WARNING',
        ),
    );
  });

  it('repairs missing title from context when allowed', async () => {
    const engine = createValidationEngine();
    const report = await engine.validate(
      lesson({
        subject: '',
        content: 'Body text for draft validation.',
        objectives: ['Obj'],
      }),
      {
        profileId: 'Draft',
        allowRepair: true,
        expectedSubject: 'Matematică',
      },
    );
    assert.ok(report.repairedPayload?.title || report.repairedPayload?.subject);
  });
});
