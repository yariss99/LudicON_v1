import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createDeterministicCompletionTransport,
  createProductionComposition,
} from '../index.js';

describe('Production Composition Root', () => {
  it('refuses stubs', () => {
    assert.throws(
      () =>
        createProductionComposition({
          completionTransport: createDeterministicCompletionTransport(),
          useStubs: true,
        }),
      /refuse stubs/i,
    );
  });

  it('runs full Runtime pipeline with real engines and mandatory Prompt Builder', async () => {
    const composition = createProductionComposition({
      mode: 'integration-test',
      completionTransport: createDeterministicCompletionTransport(),
      env: { NODE_ENV: 'test' },
    });

    await composition.start();
    assert.equal(composition.kernel.platformState, 'ready');

    const types: string[] = [];
    composition.runtime.getEventBus().subscribe((e) => types.push(e.type));

    const result = await composition.execute({
      workflowKind: 'create-lesson',
      teacherId: 't-1',
      projectId: 'p-1',
      intent: 'Draft a fractions lesson',
      educationalContext: {
        subject: 'Matematică',
        grade: 'Clasa a III-a',
        topic: 'Fracții',
        locale: 'ro-RO',
      },
    });

    assert.equal(result.status, 'succeeded');
    assert.ok(result.context.bag.promptPackage, 'PromptPackage must be present');
    assert.ok(result.context.bag.compiledPrompt, 'compiledPrompt gate required');
    assert.ok(result.context.bag.resolvedContext, 'Context snapshot required');
    assert.ok(result.context.bag.aiResult, 'AI result required');
    assert.ok(result.context.bag.validationReport, 'Validation report required');
    assert.ok(result.context.bag.memoryRef, 'Memory ref required');
    assert.ok(types.includes('PromptCompiled'));
    assert.ok(types.includes('AICompleted'));
    assert.ok(types.includes('ValidationPassed') || types.includes('RepairCompleted'));
    assert.ok(types.includes('MemorySaved'));
    assert.ok(types.includes('ExecutionCompleted'));

    // Prompt must precede AI in event order
    const promptIdx = types.indexOf('PromptCompiled');
    const aiIdx = types.indexOf('AICompleted');
    assert.ok(promptIdx >= 0 && aiIdx > promptIdx);

    await composition.stop();
    assert.equal(composition.kernel.platformState, 'stopped');
  });

  it('fails AI step when Prompt Builder output is missing (no bypass)', async () => {
    const composition = createProductionComposition({
      mode: 'integration-test',
      completionTransport: createDeterministicCompletionTransport(),
      env: { NODE_ENV: 'test' },
    });
    await composition.start();

    // Directly invoke AI port without prompt — should fail closed
    const ai = composition.runtime.getEngineRegistry().get('ai');
    const fakeCtx = {
      executionId: 'rex-x',
      requestId: 'req-x',
      teacherId: 't-1',
      projectId: 'p-1',
      startedAt: new Date().toISOString(),
      bag: { intent: 'x', educationalContext: { topic: 'y' } },
      warnings: [],
      costsUsd: 0,
      tokenUsage: 0,
      engineTimingsMs: {},
      cancelled: false,
    };
    const step = await ai.execute({ bag: fakeCtx.bag }, fakeCtx);
    assert.equal(step.ok, false);
    assert.match(String(step.error), /compiledPrompt|Prompt Builder/i);

    await composition.stop();
  });
});
