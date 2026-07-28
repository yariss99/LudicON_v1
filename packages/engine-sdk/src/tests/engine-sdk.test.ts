import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BasePrimaEngine,
  assertEngineContract,
  checkKernelCompatibility,
  metadataFromManifest,
  runEngineContractSuite,
  validateConfiguration,
  applyConfigDefaults,
} from '../index.js';
import type {
  ConfigurationProvider,
  EngineCapabilityManifest,
  EngineConfigSchema,
  ExecutionContext,
  KernelContext,
  KernelEvent,
  KernelEventBus,
  KernelEventListener,
  ServiceLocator,
} from '@prima/contracts';

class TestLocator implements ServiceLocator {
  private readonly m = new Map<string, unknown>();
  register<T>(token: string, instance: T): void {
    this.m.set(token, instance);
  }
  resolve<T>(token: string): T {
    return this.m.get(token) as T;
  }
  tryResolve<T>(token: string): T | undefined {
    return this.m.get(token) as T | undefined;
  }
  has(token: string): boolean {
    return this.m.has(token);
  }
}

class TestConfig implements ConfigurationProvider {
  get<T>(_key: string, fallback?: T): T | undefined {
    return fallback;
  }
  getEngineConfig(): Readonly<Record<string, unknown>> {
    return {};
  }
  getAll(): Readonly<Record<string, unknown>> {
    return {};
  }
}

class TestEventBus implements KernelEventBus {
  publish(): void {}
  subscribe(_listener: KernelEventListener): () => void {
    return () => undefined;
  }
  history(): readonly KernelEvent[] {
    return [];
  }
}

class SampleContextEngine extends BasePrimaEngine {
  getConfigurationSchema(): EngineConfigSchema {
    return {
      keys: [
        { key: 'mode', required: false, defaultValue: 'standard' },
        { key: 'strict', required: true },
      ],
    };
  }

  protected async onInitialize(): Promise<void> {}
  protected async onConfigure(): Promise<void> {}
  protected async onStart(): Promise<void> {}
}

function sampleManifest(
  overrides: Partial<EngineCapabilityManifest> = {},
): EngineCapabilityManifest {
  return {
    engineId: 'context',
    constitutionalCode: 'ENG-01',
    name: 'Context Engine',
    version: '1.0.0',
    compatibleKernelVersions: ['0.1.0'],
    capabilities: ['context.assemble'],
    features: [{ id: 'working-context', enabled: true }],
    supportedCommands: ['AssembleWorkingContext'],
    publishedEvents: ['WorkingContextAssembled'],
    consumedEvents: ['MemoryItemAccepted'],
    dependencies: [],
    configurationKeys: ['mode', 'strict'],
    ...overrides,
  };
}

function kernelContext(): KernelContext {
  return {
    kernelId: 'k1',
    correlationId: 'c1',
    configuration: new TestConfig(),
    services: new TestLocator(),
    events: new TestEventBus(),
    clock: () => new Date(),
  };
}

function executionContext(): ExecutionContext {
  return {
    correlationId: 'c1',
    startedAt: new Date().toISOString(),
  };
}

describe('Engine SDK', () => {
  it('builds metadata from manifest', () => {
    const meta = metadataFromManifest(sampleManifest());
    assert.equal(meta.id, 'context');
    assert.equal(meta.constitutionalCode, 'ENG-01');
  });

  it('rejects invalid manifest at construction', () => {
    assert.throws(
      () =>
        new SampleContextEngine(
          sampleManifest({
            capabilities: ['invoke-peer-engine'],
          }),
        ),
    );
    assert.throws(
      () =>
        new SampleContextEngine(
          sampleManifest({
            name: '',
          }),
        ),
    );
  });

  it('validates configuration defaults and required keys', async () => {
    const engine = new SampleContextEngine(sampleManifest());
    await engine.initialize(kernelContext());
    await assert.rejects(() => engine.configure({}));
    await engine.configure({ strict: true });
    assert.equal(engine.diagnostics().configKeysLoaded.includes('mode'), true);
    assert.equal(engine.diagnostics().configKeysLoaded.includes('strict'), true);
  });

  it('runs lifecycle and reports health/operational state', async () => {
    const engine = new SampleContextEngine(sampleManifest());
    await engine.initialize(kernelContext());
    await engine.configure({ strict: true });
    await engine.start(executionContext());
    assert.equal(engine.getOperationalState(), 'ready');
    assert.equal(engine.health().status, 'healthy');
    assert.ok(engine.diagnostics().uptimeMs !== undefined);
    await engine.pause();
    assert.equal(engine.getOperationalState(), 'busy');
    await engine.resume();
    await engine.recover('test');
    assert.equal(engine.getOperationalState(), 'ready');
    await engine.stop();
    await engine.shutdown();
    await engine.destroy();
    assert.equal(engine.getOperationalState(), 'offline');
  });

  it('passes contract assertion and suite', async () => {
    const engine = new SampleContextEngine(sampleManifest());
    const check = assertEngineContract(engine, { kernelVersion: '0.1.0' });
    assert.equal(check.ok, true, check.issues.join('; '));

    const suite = await runEngineContractSuite(engine, {
      kernelVersion: '0.1.0',
      createKernelContext: kernelContext,
      createExecutionContext: executionContext,
      config: { strict: true },
    });
    assert.equal(suite.ok, true, suite.issues.join('; '));
  });

  it('checks kernel compatibility', () => {
    const ok = checkKernelCompatibility(sampleManifest(), '0.2.0');
    assert.equal(ok.ok, true);
    const bad = checkKernelCompatibility(sampleManifest(), '0.0.1');
    assert.equal(bad.ok, false);
  });

  it('applies config defaults helper', () => {
    const schema: EngineConfigSchema = {
      keys: [{ key: 'a', defaultValue: 1, required: false }],
    };
    const values = applyConfigDefaults(schema, {});
    assert.equal(values.a, 1);
    const v = validateConfiguration(schema, values);
    assert.equal(v.ok, true);
  });
});
