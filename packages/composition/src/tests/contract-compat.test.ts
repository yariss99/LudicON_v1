import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CORE_CONTRACT_NAMES,
  PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
  type PromptPackage,
  type ValidationReport,
  type RuntimeExecution,
  type ToolExecutionResult,
  type MemorySnapshot,
  type ContextSnapshot,
  type WorkflowContext,
} from '@prima/contracts';

describe('Canonical contract compatibility', () => {
  it('lists all AFPRR-required Core contract names', () => {
    const required = [
      'WorkflowContext',
      'ExecutionContext',
      'PromptPackage',
      'PromptResult',
      'ValidationReport',
      'ValidationSummary',
      'MemorySnapshot',
      'RuntimeExecution',
      'ToolExecutionResult',
      'ContextSnapshot',
      'ArtifactMetadata',
    ];
    for (const name of required) {
      assert.ok(
        (CORE_CONTRACT_NAMES as readonly string[]).includes(name),
        `missing ${name}`,
      );
    }
    assert.equal(PRIMA_CORE_CONTRACT_SCHEMA_VERSION, '1.0.0');
  });

  it('serializes and round-trips Core DTOs as JSON', () => {
    const prompt: PromptPackage = {
      schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
      packageId: 'pp-1',
      system: 's',
      user: 'u',
      requestType: 'GenerateLesson',
      schemaId: 'educational.artifact.v1',
      ast: [{ kind: 'system', text: 's' }],
      educationalContext: { topic: 'Fracții' },
      compiledAt: '2026-07-28T00:00:00.000Z',
    };
    const validation: ValidationReport = {
      schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
      reportId: 'vr-1',
      artifactId: 'a-1',
      artifactType: 'Lesson',
      profileId: 'Publication',
      summary: {
        schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
        overallStatus: 'approved',
        overallScore: 90,
        criticalCount: 0,
        errorCount: 0,
        warningCount: 0,
        readyToExport: true,
      },
      overallScore: 90,
      overallStatus: 'approved',
      issues: [],
      executionTimeMs: 1,
      timestamp: '2026-07-28T00:00:00.000Z',
    };
    const runtime: RuntimeExecution = {
      schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
      executionId: 'rex-1',
      requestId: 'req-1',
      status: 'succeeded',
      durationMs: 12,
      costUsd: 0,
      tokenUsage: 100,
      warnings: [],
      failures: [],
    };
    const tool: ToolExecutionResult = {
      schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
      executionId: 'tex-1',
      toolId: 'export.pdf.v1',
      action: 'export',
      status: 'succeeded',
      durationMs: 1,
      output: { uri: 'memory://x.pdf' },
      errors: [],
      warnings: [],
      costUsd: 0,
    };
    const memory: MemorySnapshot = {
      schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
      snapshotId: 'ms-1',
      label: 't',
      createdAt: '2026-07-28T00:00:00.000Z',
      createdBy: 't-1',
      memoryIds: ['m-1'],
      recordCount: 1,
    };
    const context: ContextSnapshot = {
      schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
      snapshotId: 'cs-1',
      teacherId: 't-1',
      projectId: 'p-1',
      educationalContext: { topic: 'Fracții' },
      resolvedAt: '2026-07-28T00:00:00.000Z',
    };
    const workflow: WorkflowContext = {
      schemaVersion: PRIMA_CORE_CONTRACT_SCHEMA_VERSION,
      workflowId: 'wf-1',
      workflowKind: 'create-lesson',
      teacherId: 't-1',
      projectId: 'p-1',
      educationalContext: { topic: 'Fracții' },
    };

    for (const value of [
      prompt,
      validation,
      runtime,
      tool,
      memory,
      context,
      workflow,
    ]) {
      const round = JSON.parse(JSON.stringify(value));
      assert.equal(round.schemaVersion, PRIMA_CORE_CONTRACT_SCHEMA_VERSION);
    }
  });
});
