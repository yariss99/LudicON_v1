import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createRuntimeOrchestrator,
  registerCoreStubs,
} from '../index.js';

describe('RuntimeOrchestrator', () => {
  it('coordinates the default Core pipeline end-to-end', async () => {
    const runtime = createRuntimeOrchestrator();
    registerCoreStubs((e) => runtime.registerEngine(e));

    const types: string[] = [];
    runtime.getEventBus().subscribe((e) => types.push(e.type));

    const result = await runtime.execute({
      workflowKind: 'create-lesson',
      teacherId: 't-1',
      projectId: 'p-1',
      intent: 'Draft a fractions lesson',
      educationalContext: {
        subject: 'Matematică',
        grade: 'Clasa a III-a',
        topic: 'Fracții',
      },
    });

    assert.equal(result.status, 'succeeded');
    assert.ok(result.artifact);
    assert.equal(
      (result.artifact as { subject?: string }).subject,
      'Matematică',
    );
    assert.ok(types.includes('ContextLoaded'));
    assert.ok(types.includes('AICompleted'));
    assert.ok(types.includes('ValidationPassed'));
    assert.ok(types.includes('MemorySaved'));
    assert.ok(types.includes('ExecutionCompleted'));
    assert.ok(result.observability.durationMs >= 0);
  });

  it('retries a retryable AI failure then succeeds', async () => {
    const runtime = createRuntimeOrchestrator();
    registerCoreStubs((e) => runtime.registerEngine(e), { aiFailOnce: true });

    const result = await runtime.execute({
      workflowKind: 'create-lesson',
      teacherId: 't-1',
      projectId: 'p-1',
      intent: 'Retry path',
      educationalContext: { subject: 'Științe', topic: 'Apă' },
    });

    assert.equal(result.status, 'succeeded');
    assert.ok(result.context.engineTimingsMs['ai.generate'] !== undefined);
  });

  it('fails when a required engine is missing', async () => {
    const runtime = createRuntimeOrchestrator();
    // register nothing
    const result = await runtime.execute({
      workflowKind: 'create-lesson',
      teacherId: 't-1',
      projectId: 'p-1',
      intent: 'x',
      educationalContext: { topic: 'y' },
    });
    assert.equal(result.status, 'failed');
    assert.ok(result.observability.failures[0]?.includes('workflow'));
  });

  it('supports cancellation mid-flight', async () => {
    const runtime = createRuntimeOrchestrator();
    registerCoreStubs((e) => runtime.registerEngine(e));

    const controller = new AbortController();
    // Cancel immediately
    controller.abort();

    const result = await runtime.execute({
      workflowKind: 'create-lesson',
      teacherId: 't-1',
      projectId: 'p-1',
      intent: 'cancelled',
      educationalContext: { topic: 'z' },
      signal: controller.signal,
    });

    assert.ok(
      result.status === 'cancelled' || result.status === 'failed',
    );
  });
});
