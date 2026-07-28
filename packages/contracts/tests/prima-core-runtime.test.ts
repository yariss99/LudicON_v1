import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CORE_CONTRACT_NAMES,
  PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
  type PromptPackage,
  type ValidationReport,
  type RuntimeExecution,
} from '../dist/prima-core-runtime.js';

describe('prima-core-runtime contracts', () => {
  it('exposes a frozen schema version and contract catalog', () => {
    assert.equal(PRIMA_CORE_CONTRACT_SCHEMA_VERSION, '1.0.0');
    assert.ok(CORE_CONTRACT_NAMES.includes('PromptPackage'));
    assert.ok(CORE_CONTRACT_NAMES.includes('ValidationReport'));
    assert.ok(CORE_CONTRACT_NAMES.includes('RuntimeExecution'));
  });

  it('PromptPackage and ValidationReport are structurally immutable-shaped', () => {
    const pkg: PromptPackage = {
      schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
      packageId: 'pp-1',
      system: 'sys',
      user: 'usr',
      requestType: 'GenerateLesson',
      schemaId: 'lesson.v1',
      ast: Object.freeze([{ kind: 'system', text: 'sys' }]),
      educationalContext: Object.freeze({ topic: 'Fracții' }),
      compiledAt: new Date().toISOString(),
    };
    assert.equal(pkg.schemaVersion, '1.0.0');

    const report: ValidationReport = {
      schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
      reportId: 'vr-1',
      artifactId: 'a-1',
      artifactType: 'Lesson',
      profileId: 'Publication',
      summary: {
        schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
        overallStatus: 'approved',
        overallScore: 1,
        criticalCount: 0,
        errorCount: 0,
        warningCount: 0,
        readyToExport: true,
      },
      overallScore: 1,
      overallStatus: 'approved',
      issues: [],
      executionTimeMs: 1,
      timestamp: new Date().toISOString(),
    };
    assert.equal(report.summary.readyToExport, true);

    const exec: RuntimeExecution = {
      schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
      executionId: 'rex-1',
      requestId: 'req-1',
      status: 'succeeded',
      durationMs: 10,
      costUsd: 0,
      tokenUsage: 0,
      warnings: [],
      failures: [],
    };
    assert.equal(exec.status, 'succeeded');
  });
});
