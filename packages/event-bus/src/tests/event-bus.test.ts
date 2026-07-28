import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createEventBus } from '../in-memory-bus.js';
import { matchPattern } from '../routing.js';
import { createKernelEventBusBridge } from '@prima/contracts';

describe('routing patterns', () => {
  it('matches wildcards', () => {
    assert.equal(matchPattern('*', 'Anything'), true);
    assert.equal(matchPattern('Kernel.*', 'Kernel.Started'), true);
    assert.equal(matchPattern('Kernel.*', 'Kernel'), true);
    assert.equal(matchPattern('Kernel.*', 'Engine.Started'), false);
    assert.equal(matchPattern('Engine.Started', 'Engine.Started'), true);
  });
});

describe('EventBus', () => {
  it('publishes immutable events with required metadata', async () => {
    const bus = createEventBus({ busId: 'test' });
    const received: string[] = [];
    bus.subscribe((e) => {
      received.push(e.eventType);
      assert.ok(e.eventId);
      assert.ok(e.correlationId);
      assert.ok(e.timestamp);
      assert.equal(e.version, '1.0.0');
      assert.throws(() => {
        (e as { eventType: string }).eventType = 'mutated';
      });
    });

    const event = bus.publishSync({
      eventType: 'Domain.BlueprintApproved',
      category: 'domain',
      source: 'blueprint-engine',
      payload: { blueprintId: 'bp-1' },
      aggregateId: 'bp-1',
    });

    assert.equal(event.eventType, 'Domain.BlueprintApproved');
    assert.deepEqual(received, ['Domain.BlueprintApproved']);
    assert.equal(bus.stats().publishedCount, 1);
    assert.equal(bus.stats().deliveredCount, 1);
  });

  it('supports multiple subscribers and priority order', () => {
    const bus = createEventBus();
    const order: string[] = [];
    bus.subscribe(() => {
      order.push('low');
    }, { id: 'low', priority: 1 });
    bus.subscribe(() => {
      order.push('high');
    }, { id: 'high', priority: 10 });
    bus.publishSync({
      eventType: 'System.Tick',
      category: 'system',
      source: 'test',
      payload: {},
    });
    assert.deepEqual(order, ['high', 'low']);
  });

  it('filters by pattern and category', () => {
    const bus = createEventBus();
    const hits: string[] = [];
    bus.subscribe((e) => {
      hits.push(e.eventType);
    }, {
      filter: { patterns: ['Kernel.*'], categories: ['kernel'] },
    });
    bus.publishSync({
      eventType: 'Kernel.Started',
      category: 'kernel',
      source: 'eos',
      payload: {},
    });
    bus.publishSync({
      eventType: 'Domain.X',
      category: 'domain',
      source: 'x',
      payload: {},
    });
    assert.deepEqual(hits, ['Kernel.Started']);
  });

  it('drops duplicates (at-most-once style detection)', () => {
    const bus = createEventBus({ enableDuplicateDetection: true });
    let count = 0;
    bus.subscribe(() => {
      count += 1;
    });
    const draft = {
      eventId: 'same-id',
      eventType: 'System.Once',
      category: 'system' as const,
      source: 'test',
      payload: {},
    };
    bus.publishSync(draft);
    bus.publishSync(draft);
    assert.equal(count, 1);
    assert.equal(bus.stats().duplicateDrops, 1);
  });

  it('retries then dead-letters on subscriber failure', async () => {
    const bus = createEventBus({ defaultMaxRetries: 2, defaultRetryDelayMs: 1 });
    bus.subscribe(
      () => {
        throw new Error('boom');
      },
      { id: 'failing', delivery: 'at-least-once', maxRetries: 2, retryDelayMs: 1 },
    );
    await bus.publishAsync({
      eventType: 'System.Fail',
      category: 'system',
      source: 'test',
      payload: {},
    });
    await bus.flush();
    assert.ok(bus.deadLetters().length >= 1);
    assert.equal(bus.deadLetters()[0]?.subscriptionId, 'failing');
  });

  it('preserves per-aggregate ordering', async () => {
    const bus = createEventBus({ orderPerAggregate: true });
    const seen: number[] = [];
    bus.subscribe(async (e) => {
      const n = (e.payload as { n: number }).n;
      await new Promise((r) => setTimeout(r, 5 - n));
      seen.push(n);
    });
    await Promise.all([
      bus.publishAsync({
        eventType: 'Domain.Seq',
        category: 'domain',
        source: 't',
        aggregateId: 'agg-1',
        payload: { n: 1 },
      }),
      bus.publishAsync({
        eventType: 'Domain.Seq',
        category: 'domain',
        source: 't',
        aggregateId: 'agg-1',
        payload: { n: 2 },
      }),
      bus.publishAsync({
        eventType: 'Domain.Seq',
        category: 'domain',
        source: 't',
        aggregateId: 'agg-1',
        payload: { n: 3 },
      }),
    ]);
    await bus.flush();
    assert.deepEqual(seen, [1, 2, 3]);
  });

  it('supports delayed publish via flush', async () => {
    const bus = createEventBus();
    await bus.start();
    const hits: string[] = [];
    bus.subscribe((e) => {
      hits.push(e.eventType);
    });
    bus.publishSync(
      {
        eventType: 'System.Delayed',
        category: 'system',
        source: 't',
        payload: {},
      },
      { delayMs: 50 },
    );
    assert.deepEqual(hits, []);
    await bus.flush();
    assert.deepEqual(hits, ['System.Delayed']);
    await bus.stop();
  });

  it('batch publish sorts by priority', async () => {
    const bus = createEventBus();
    const order: string[] = [];
    bus.subscribe((e) => {
      order.push(e.eventType);
    });
    await bus.publishBatch([
      {
        eventType: 'low',
        category: 'system',
        source: 't',
        priority: 'low',
        payload: {},
      },
      {
        eventType: 'critical',
        category: 'system',
        source: 't',
        priority: 'critical',
        payload: {},
      },
    ]);
    assert.deepEqual(order, ['critical', 'low']);
  });

  it('bridges Kernel events onto the platform bus', () => {
    const platform = createEventBus();
    const types: string[] = [];
    platform.subscribe((e) => {
      types.push(e.eventType);
    }, {
      filter: { categories: ['kernel', 'engine'] },
    });
    const kernelBus = createKernelEventBusBridge(platform);
    kernelBus.publish({
      type: 'KernelStarted',
      kernelId: 'k1',
      correlationId: 'c1',
    });
    assert.ok(types.includes('KernelStarted'));
    assert.equal(platform.history().length, 1);
    assert.equal(platform.history()[0]?.category, 'kernel');
  });
});
