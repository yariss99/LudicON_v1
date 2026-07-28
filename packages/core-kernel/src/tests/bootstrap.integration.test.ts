/**
 * Integration: Core Kernel + Runtime Orchestrator bridge end-to-end.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createPrimaCoreKernel,
  createRuntimeBridge,
  createStubCoreEngine,
} from '../index.js';

describe('Core Kernel integration', () => {
  it('starts runtime bridge and keeps diagnostics consistent', async () => {
    const bridge = createRuntimeBridge({ useStubs: true });
    const kernel = createPrimaCoreKernel({
      platformId: 'integration',
      env: {
        NODE_ENV: 'test',
        PRIMA_FEATURE_TOOLS: '1',
        PRIMA_LOCALE: 'ro-RO',
      },
      configuration: {
        engines: {
          workflow: { catalog: 'default' },
        },
        providers: {
          completion: { enabled: true, model: 'stub' },
        },
        experimental: { shadowMode: false },
      },
      runtime: bridge,
    });

    kernel.register(createStubCoreEngine('workflow'));
    kernel.register(
      createStubCoreEngine('validation', { dependencies: ['workflow'] }),
    );

    const startup = await kernel.start();
    assert.equal(startup.steps.every((s) => s.ok), true);
    assert.ok(startup.steps.some((s) => s.name === 'Start Runtime'));

    const result = await bridge.orchestrator.execute({
      workflowKind: 'create-lesson',
      teacherId: 't-1',
      projectId: 'p-1',
      intent: 'Draft lesson',
      educationalContext: { subject: 'Matematică', topic: 'Fracții' },
    });
    assert.equal(result.status, 'succeeded');

    const diag = await kernel.diagnosticsReport();
    assert.equal(diag.health.providerAvailability.completion, true);
    assert.equal(diag.configuration.locale, 'ro-RO');
    assert.equal(diag.version.runtimeOrchestratorVersion, '0.1.0');
    assert.ok(diag.startup.readyAt);

    await kernel.stop();
    assert.equal(kernel.platformState, 'stopped');
  });

  it('rejects invalid configuration before engines start', async () => {
    const kernel = createPrimaCoreKernel({
      env: { NODE_ENV: 'production' },
      configuration: {
        experimental: { risky: true },
        security: { allowExperimental: false, requireEducationalContext: true },
      },
    });
    kernel.register(createStubCoreEngine('workflow'));
    await assert.rejects(() => kernel.start(), /experimental/);
    assert.equal(kernel.platformState, 'failed');
  });
});
