import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createKnowledgeEngine,
  KNOWLEDGE_ENGINE_MANIFEST,
} from '../index.js';
import { assertEngineContract } from '@prima/engine-sdk';
import { createEventBus } from '@prima/event-bus';
import type {
  ConfigurationProvider,
  KnowledgeObject,
  KnowledgePack,
  KernelContext,
  KernelEvent,
  KernelEventBus,
  KernelEventListener,
  ServiceLocator,
} from '@prima/contracts';
import { PRIMA_KNOWLEDGE_SCHEMA_VERSION } from '@prima/contracts';

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
  subscribe(_l: KernelEventListener): () => void {
    return () => undefined;
  }
  history(): readonly KernelEvent[] {
    return [];
  }
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

function sampleObject(id = 'obj-math-1'): KnowledgeObject {
  return {
    objectId: id,
    domain: 'curriculum',
    title: 'Fracții — clasa a V-a',
    structure: 'structured',
    origin: 'curated',
    trustLevel: 'authoritative',
    schemaVersion: PRIMA_KNOWLEDGE_SCHEMA_VERSION,
    provenance: [
      {
        sourceId: 'men-ro',
        sourceLabel: 'Curriculum național',
        packId: 'ro-math',
        packVersion: '1.0.0',
        objectId: id,
      },
    ],
    payload: { subject: 'matematica', gradeBand: 'V', competency: 'fractions' },
  };
}

function samplePack(state: KnowledgePack['lifecycleState'] = 'published'): KnowledgePack {
  return {
    packId: 'ro-math',
    domain: 'curriculum',
    version: '1.0.0',
    schemaVersion: PRIMA_KNOWLEDGE_SCHEMA_VERSION,
    trustLevel: 'authoritative',
    lifecycleState: state,
    objectIds: ['obj-math-1'],
  };
}

describe('KnowledgeEngine', () => {
  it('satisfies Engine SDK contract', () => {
    const engine = createKnowledgeEngine();
    const check = assertEngineContract(engine, { kernelVersion: '0.1.0' });
    assert.equal(check.ok, true, check.issues.join('; '));
    assert.equal(engine.manifest.constitutionalCode, 'ENG-02');
    assert.equal(KNOWLEDGE_ENGINE_MANIFEST.engineId, 'knowledge');
  });

  it('imports, publishes, searches, and assembles a package', async () => {
    const bus = createEventBus();
    const events: string[] = [];
    bus.subscribe((e) => {
      events.push(e.eventType);
    });

    const engine = createKnowledgeEngine({ eventBus: bus });
    await engine.initialize(kernelContext());
    await engine.configure({});
    await engine.start({
      correlationId: 'c1',
      startedAt: new Date().toISOString(),
    });

    const imported = await engine.importKnowledge({
      source: 'manual',
      pack: samplePack('published'),
      objects: [sampleObject()],
    });
    assert.equal(imported.ok, true);

    const hits = await engine.search({
      correlationId: 'c1',
      text: 'Fracții',
      domain: 'curriculum',
    });
    assert.ok(hits.length >= 1);
    assert.equal(hits[0]?.object.objectId, 'obj-math-1');

    const pkg = await engine.retrieveForContext({
      correlationId: 'c1',
      text: 'fractions',
      contextHints: { subject: 'matematica', gradeBand: 'V' },
    });
    assert.equal(pkg.unsupportedMarked, false);
    assert.equal(pkg.provenanceComplete, true);
    assert.ok(pkg.objects.length >= 1);

    const resolved = await engine.resolve({
      correlationId: 'c1',
      objectId: 'obj-math-1',
      packId: 'ro-math',
      packVersion: '1.0.0',
    });
    assert.ok(resolved);

    assert.ok(events.includes('KnowledgeImported'));
    assert.ok(events.includes('KnowledgePackageAssembled'));

    // cache hit
    const before = engine.cacheStats().hits;
    await engine.search({
      correlationId: 'c2',
      text: 'Fracții',
      domain: 'curriculum',
    });
    assert.ok(engine.cacheStats().hits >= before + 1);

    await engine.deprecatePack('ro-math', '1.0.0');
    assert.ok(events.includes('KnowledgeDeprecated'));
  });

  it('rejects student domain and forces quarantine for external published imports', async () => {
    const engine = createKnowledgeEngine();
    await engine.initialize(kernelContext());
    await engine.configure({});
    await engine.start({
      correlationId: 'c1',
      startedAt: new Date().toISOString(),
    });

    const bad = await engine.importKnowledge({
      source: 'manual',
      pack: { ...samplePack(), domain: 'student', objectIds: ['s1'] },
      objects: [
        {
          ...sampleObject('s1'),
          domain: 'student',
        },
      ],
    });
    assert.equal(bad.ok, false);

    const ext = await engine.importKnowledge({
      source: 'external',
      pack: samplePack('published'),
      objects: [sampleObject()],
    });
    // validation may pass then force quarantine — still ok import
    assert.equal(ext.ok, true);
    // not searchable until published
    const hits = await engine.search({
      correlationId: 'c1',
      text: 'Fracții',
    });
    assert.equal(hits.length, 0);

    const pub = await engine.publishPack('ro-math', '1.0.0');
    assert.equal(pub.ok, true);
    const hits2 = await engine.search({
      correlationId: 'c1',
      text: 'Fracții',
    });
    assert.ok(hits2.length >= 1);
  });

  it('marks unsupported when no evidence', async () => {
    const engine = createKnowledgeEngine();
    await engine.initialize(kernelContext());
    await engine.configure({});
    await engine.start({
      correlationId: 'c1',
      startedAt: new Date().toISOString(),
    });
    const pkg = await engine.retrieveForContext({
      correlationId: 'c1',
      text: 'nonexistent-topic-xyz',
    });
    assert.equal(pkg.unsupportedMarked, true);
  });
});
