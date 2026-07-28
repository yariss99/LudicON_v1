import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { EngineRegistry } from '../engine-registry.js';
import { RuntimeEventBus } from '../event-bus.js';
import { PipelineManager } from '../pipeline-manager.js';
import type {
  PipelineDefinition,
  RuntimeEnginePort,
  RuntimeExecutionContext,
} from '../types.js';

function makeCtx(
  bag: Record<string, unknown> = {},
): RuntimeExecutionContext {
  return {
    executionId: 'rex-test',
    requestId: 'req-test',
    teacherId: 't-1',
    projectId: 'p-1',
    startedAt: new Date().toISOString(),
    bag,
    warnings: [],
    costsUsd: 0,
    tokenUsage: 0,
    engineTimingsMs: {},
    cancelled: false,
  };
}

function engine(
  id: string,
  fn: RuntimeEnginePort['execute'],
): RuntimeEnginePort {
  return {
    engineId: id,
    displayName: id,
    version: '0.0.0',
    execute: fn,
  };
}

describe('PipelineManager', () => {
  it('runs parallel steps in the same group', async () => {
    const order: string[] = [];
    const engines = new EngineRegistry();
    engines.register(
      engine('a', async () => {
        await new Promise((r) => setTimeout(r, 30));
        order.push('a');
        return { ok: true, output: { a: 1 } };
      }),
    );
    engines.register(
      engine('b', async () => {
        order.push('b');
        return { ok: true, output: { b: 1 } };
      }),
    );

    const pipeline: PipelineDefinition = {
      pipelineId: 'parallel-demo',
      displayName: 'parallel',
      steps: [
        { stepId: 'a', engineId: 'a', parallelGroup: 'g1' },
        { stepId: 'b', engineId: 'b', parallelGroup: 'g1' },
      ],
    };

    const ctx = makeCtx();
    const mgr = new PipelineManager(engines, new RuntimeEventBus());
    await mgr.run(pipeline, ctx);

    assert.equal(ctx.bag.a, 1);
    assert.equal(ctx.bag.b, 1);
    // b finishes first while a is still waiting
    assert.equal(order[0], 'b');
  });

  it('skips conditional steps when when() is false', async () => {
    const engines = new EngineRegistry();
    let ran = false;
    engines.register(
      engine('x', async () => {
        ran = true;
        return { ok: true, output: { x: true } };
      }),
    );

    const pipeline: PipelineDefinition = {
      pipelineId: 'cond',
      displayName: 'cond',
      steps: [
        {
          stepId: 'x',
          engineId: 'x',
          when: (ctx) => ctx.bag.run === true,
        },
      ],
    };

    const ctx = makeCtx({ run: false });
    await new PipelineManager(engines, new RuntimeEventBus()).run(
      pipeline,
      ctx,
    );
    assert.equal(ran, false);
    assert.equal(ctx.bag.x, undefined);
  });

  it('rolls back bag changes on rollback failure mode', async () => {
    const engines = new EngineRegistry();
    engines.register(
      engine('mut', async (_input, ctx) => {
        ctx.bag.mutated = true;
        return { ok: false, error: 'boom' };
      }),
    );

    const pipeline: PipelineDefinition = {
      pipelineId: 'rb',
      displayName: 'rb',
      steps: [
        {
          stepId: 'mut',
          engineId: 'mut',
          onFailure: 'rollback',
        },
      ],
    };

    const ctx = makeCtx({ keep: 1 });
    await assert.rejects(() =>
      new PipelineManager(engines, new RuntimeEventBus()).run(pipeline, ctx),
    );
    assert.equal(ctx.bag.keep, 1);
    assert.equal(ctx.bag.mutated, undefined);
  });

  it('times out a slow engine', async () => {
    const engines = new EngineRegistry();
    engines.register(
      engine('slow', async () => {
        await new Promise((r) => setTimeout(r, 100));
        return { ok: true, output: {} };
      }),
    );

    const pipeline: PipelineDefinition = {
      pipelineId: 'to',
      displayName: 'to',
      steps: [{ stepId: 'slow', engineId: 'slow', timeoutMs: 20 }],
    };

    await assert.rejects(
      () =>
        new PipelineManager(engines, new RuntimeEventBus()).run(
          pipeline,
          makeCtx(),
        ),
      /timed out/,
    );
  });
});
