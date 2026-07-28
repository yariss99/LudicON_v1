import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createPrimaCoreKernel,
  createRuntimeBridge,
  createStubCoreEngine,
  staticDiscoverer,
  DependencyContainer,
} from '../index.js';

describe('PrimaCoreKernel', () => {
  it('boots to PlatformReady with engines and runtime', async () => {
    const types: string[] = [];
    const kernel = createPrimaCoreKernel({
      platformId: 'test-platform',
      env: { NODE_ENV: 'test', PRIMA_FEATURE_MEMORY: 'true' },
      configuration: {
        providers: { openai: { enabled: true } },
      },
      discoverers: [
        staticDiscoverer([
          createStubCoreEngine('workflow'),
          createStubCoreEngine('context', { dependencies: ['workflow'] }),
        ]),
      ],
      runtime: createRuntimeBridge({ useStubs: true }),
    });
    kernel.on((e) => types.push(e.type));

    const report = await kernel.start();
    assert.equal(kernel.platformState, 'ready');
    assert.ok(report.durationMs !== undefined);
    assert.ok(types.includes('PlatformStarting'));
    assert.ok(types.includes('EngineRegistered'));
    assert.ok(types.includes('EngineInitialized'));
    assert.ok(types.includes('PlatformReady'));
    assert.equal(kernel.isFeatureEnabled('memory'), true);

    const health = await kernel.healthCheck();
    assert.equal(health.status, 'healthy');
    assert.ok(health.memoryUsage);
    assert.equal(health.engines.length, 2);

    const diag = await kernel.diagnosticsReport();
    assert.equal(diag.version.kernelVersion, kernel.version);
    assert.deepEqual(diag.dependencyGraph.startupOrder, [
      'workflow',
      'context',
    ]);
    assert.equal(diag.configuration.environment, 'test');

    await kernel.stop();
    assert.equal(kernel.platformState, 'stopped');
    assert.ok(types.includes('PlatformStopped'));
  });

  it('fails boot when engine start fails', async () => {
    const kernel = createPrimaCoreKernel({
      env: { NODE_ENV: 'test' },
    });
    kernel.register(createStubCoreEngine('bad', { failOnStart: true }));
    await assert.rejects(() => kernel.start());
    assert.equal(kernel.platformState, 'failed');
  });

  it('supports lazy engine registration', async () => {
    const kernel = createPrimaCoreKernel({ env: { NODE_ENV: 'test' } });
    kernel.registerLazy('lazy-engine', () =>
      createStubCoreEngine('lazy-engine'),
    );
    await kernel.start();
    assert.equal(kernel.platformState, 'ready');
    const engines = await kernel.getServiceRegistry().listModules();
    assert.equal(engines.some((e) => e.id === 'lazy-engine'), true);
    await kernel.stop();
  });

  it('reloads configuration and emits event', async () => {
    const kernel = createPrimaCoreKernel({ env: { NODE_ENV: 'test' } });
    kernel.register(createStubCoreEngine('workflow'));
    await kernel.start();
    const types: string[] = [];
    kernel.on((e) => types.push(e.type));
    await kernel.reloadConfiguration({
      featureFlags: { export: true },
    });
    assert.ok(types.includes('ConfigurationReloaded'));
    assert.equal(kernel.isFeatureEnabled('export'), true);
    await kernel.stop();
  });

  it('exposes DI container without global singletons', () => {
    const a = createPrimaCoreKernel({ env: { NODE_ENV: 'test' } });
    const b = createPrimaCoreKernel({ env: { NODE_ENV: 'test' } });
    assert.notEqual(a.getContainer(), b.getContainer());
    const child = a.getContainer().createChild();
    child.registerValue('mock', { ok: true });
    assert.deepEqual(child.resolve('mock'), { ok: true });
    assert.equal(a.getContainer().tryResolve('mock'), undefined);
    assert.ok(child instanceof DependencyContainer);
  });
});
