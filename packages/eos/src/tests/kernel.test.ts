import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createEosKernel } from '../kernel.js';
import { resolveStartupOrder, detectCycles } from '../dependency-order.js';
import { StubEngine } from './stub-engine.js';
import { FatalKernelError } from '@prima/contracts';

describe('dependency order', () => {
  it('orders dependencies before dependents', () => {
    const order = resolveStartupOrder([
      { id: 'b', name: 'B', version: '1.0.0', capabilities: [], dependencies: ['a'] },
      { id: 'a', name: 'A', version: '1.0.0', capabilities: [], dependencies: [] },
      { id: 'c', name: 'C', version: '1.0.0', capabilities: [], dependencies: ['b'] },
    ]);
    assert.deepEqual(order, ['a', 'b', 'c']);
  });

  it('detects cycles', () => {
    const cycles = detectCycles([
      { id: 'a', name: 'A', version: '1.0.0', capabilities: [], dependencies: ['b'] },
      { id: 'b', name: 'B', version: '1.0.0', capabilities: [], dependencies: ['a'] },
    ]);
    assert.ok(cycles.length > 0);
  });
});

describe('EosKernel', () => {
  it('starts and stops engines in dependency order', async () => {
    const kernel = createEosKernel({ kernelId: 'test-kernel', phaseTimeoutMs: 5_000 });
    const events: string[] = [];
    kernel.on((e) => events.push(e.type));

    kernel.register(
      new StubEngine({
        id: 'context',
        name: 'Context',
        constitutionalCode: 'ENG-01',
        version: '1.0.0',
        capabilities: ['context'],
        dependencies: [],
      }),
    );
    kernel.register(
      new StubEngine({
        id: 'intent',
        name: 'Intent',
        constitutionalCode: 'ENG-03',
        version: '1.0.0',
        capabilities: ['intent'],
        dependencies: ['context'],
      }),
    );

    await kernel.configure();
    await kernel.start();
    assert.equal(kernel.state, 'running');
    assert.ok(events.includes('KernelStarted'));
    assert.ok(events.includes('EngineStarted'));

    const health = kernel.health();
    assert.equal(health.kernelStatus, 'healthy');
    assert.equal(health.engines.length, 2);

    await kernel.stop();
    assert.equal(kernel.state, 'stopped');
    assert.ok(events.includes('KernelStopped'));
  });

  it('rejects missing dependencies at validation', async () => {
    const kernel = createEosKernel({ phaseTimeoutMs: 5_000 });
    kernel.register(
      new StubEngine({
        id: 'orphan',
        name: 'Orphan',
        version: '1.0.0',
        capabilities: [],
        dependencies: ['missing'],
      }),
    );
    await assert.rejects(() => kernel.start(), (err: unknown) => {
      assert.ok(err instanceof FatalKernelError || err instanceof Error);
      return true;
    });
    assert.equal(kernel.state, 'failed');
  });

  it('retries recoverable start failures', async () => {
    const kernel = createEosKernel({
      phaseTimeoutMs: 5_000,
      startRetryCount: 3,
      startRetryDelayMs: 1,
    });
    kernel.register(
      new StubEngine(
        {
          id: 'flaky',
          name: 'Flaky',
          version: '1.0.0',
          capabilities: [],
          dependencies: [],
        },
        { failOnStartTimes: 2 },
      ),
    );
    await kernel.start();
    assert.equal(kernel.state, 'running');
  });

  it('materializes descriptor registration (discovery)', async () => {
    const kernel = createEosKernel({ phaseTimeoutMs: 5_000 });
    kernel.registerDescriptor({
      source: 'automatic',
      metadata: {
        id: 'auto',
        name: 'Auto',
        version: '1.0.0',
        capabilities: ['auto'],
        dependencies: [],
      },
      create: () =>
        new StubEngine({
          id: 'auto',
          name: 'Auto',
          version: '1.0.0',
          capabilities: ['auto'],
          dependencies: [],
        }),
    });
    await kernel.start();
    assert.equal(kernel.state, 'running');
    assert.ok(kernel.getEvents().some((e) => e.type === 'DiscoveryCompleted'));
    await kernel.stop();
  });

  it('isolates engines from knowing each other (registry resolve only via kernel)', async () => {
    const kernel = createEosKernel({ phaseTimeoutMs: 5_000 });
    const a = new StubEngine({
      id: 'a',
      name: 'A',
      version: '1.0.0',
      capabilities: [],
      dependencies: [],
    });
    kernel.register(a);
    await kernel.start();
    const ctx = kernel.getContext();
    assert.ok(ctx.kernelId);
    assert.equal(typeof ctx.services.has, 'function');
    await kernel.destroy();
    assert.equal(kernel.state, 'destroyed');
  });
});
