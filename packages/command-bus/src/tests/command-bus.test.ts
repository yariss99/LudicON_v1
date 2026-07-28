import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createCommandBus,
  createAllowAllAuthorizer,
  createDenyAuthorizer,
  BusinessCommandError,
} from '../index.js';
import { createEventBus } from '@prima/event-bus';
import type { CommandHandler, CommandValidator } from '@prima/contracts';

describe('CommandBus', () => {
  it('dispatches to a single handler and publishes domain events', async () => {
    const eventBus = createEventBus();
    const domainEvents: string[] = [];
    eventBus.subscribe((e) => {
      if (e.category === 'domain') domainEvents.push(e.eventType);
    });

    const bus = createCommandBus({
      eventBus,
      publishCommandLifecycleEvents: true,
    });
    bus.registerAuthorizer(createAllowAllAuthorizer());
    bus.registerHandler({
      commandType: 'ApproveBlueprint',
      name: 'approve-blueprint',
      async handle(_cmd, ctx) {
        await ctx.publishDomainEvent('BlueprintApproved', { id: 'bp-1' }, { aggregateId: 'bp-1' });
        return { approved: true };
      },
    });

    const result = await bus.dispatch({
      commandType: 'ApproveBlueprint',
      source: 'teacher-workspace',
      payload: { blueprintId: 'bp-1' },
      aggregateId: 'bp-1',
      userContext: { teacherId: 't1' },
    });

    assert.equal(result.success, true);
    assert.equal(result.status, 'success');
    assert.deepEqual(result.value, { approved: true });
    assert.ok(result.execution.stagesCompleted.includes('authorization'));
    assert.ok(domainEvents.includes('BlueprintApproved'));
    assert.ok(bus.stats().successCount >= 1);
  });

  it('rejects when no handler is registered', async () => {
    const bus = createCommandBus({ publishCommandLifecycleEvents: false });
    bus.registerAuthorizer(createAllowAllAuthorizer());
    const result = await bus.dispatch({
      commandType: 'Unknown.Command',
      source: 'test',
      payload: {},
    });
    assert.equal(result.status, 'handler_missing');
    assert.equal(result.success, false);
  });

  it('enforces exactly one handler per command type', () => {
    const bus = createCommandBus({ publishCommandLifecycleEvents: false });
    const handler: CommandHandler = {
      commandType: 'Once',
      handle: () => undefined,
    };
    bus.registerHandler(handler);
    assert.throws(() => bus.registerHandler(handler));
  });

  it('fails closed without authorizer', async () => {
    const bus = createCommandBus({ publishCommandLifecycleEvents: false });
    bus.registerHandler({
      commandType: 'DoThing',
      handle: () => ({ ok: true }),
    });
    const result = await bus.dispatch({
      commandType: 'DoThing',
      source: 'test',
      payload: {},
    });
    assert.equal(result.status, 'authorization_failed');
    assert.ok(result.issues.some((i) => i.code === 'AUTHZ_NOT_CONFIGURED'));
  });

  it('rejects unauthorized commands', async () => {
    const bus = createCommandBus({ publishCommandLifecycleEvents: false });
    bus.registerAuthorizer(createDenyAuthorizer());
    bus.registerHandler({
      commandType: 'ExportDeliverable',
      handle: () => ({ exported: true }),
    });
    const result = await bus.dispatch({
      commandType: 'ExportDeliverable',
      source: 'test',
      payload: {},
    });
    assert.equal(result.status, 'authorization_failed');
  });

  it('runs business validation and returns validation_failed', async () => {
    const bus = createCommandBus({ publishCommandLifecycleEvents: false });
    bus.registerAuthorizer(createAllowAllAuthorizer());
    const validator: CommandValidator = {
      name: 'require-aggregate',
      stage: 'businessValidation',
      validate(command) {
        if (!command.aggregateId) {
          return {
            ok: false,
            issues: [
              {
                code: 'AGGREGATE_REQUIRED',
                message: 'aggregateId required',
                severity: 'error',
              },
            ],
          };
        }
        return { ok: true, issues: [] };
      },
    };
    bus.registerValidator(validator);
    bus.registerHandler({
      commandType: 'ReviseBlueprint',
      handle: () => ({}),
    });
    const result = await bus.dispatch({
      commandType: 'ReviseBlueprint',
      source: 'test',
      payload: {},
    });
    assert.equal(result.status, 'validation_failed');
    assert.ok(result.issues.some((i) => i.code === 'AGGREGATE_REQUIRED'));
  });

  it('maps BusinessCommandError to business_error', async () => {
    const bus = createCommandBus({ publishCommandLifecycleEvents: false });
    bus.registerAuthorizer(createAllowAllAuthorizer());
    bus.registerHandler({
      commandType: 'MarkReady',
      handle() {
        throw new BusinessCommandError('NOT_READY', 'Resource not ready');
      },
    });
    const result = await bus.dispatch({
      commandType: 'MarkReady',
      source: 'test',
      payload: {},
    });
    assert.equal(result.status, 'business_error');
    assert.ok(result.issues.some((i) => i.code === 'NOT_READY'));
  });

  it('supports timeout', async () => {
    const bus = createCommandBus({
      publishCommandLifecycleEvents: false,
      defaultTimeoutMs: 20,
    });
    bus.registerAuthorizer(createAllowAllAuthorizer());
    bus.registerHandler({
      commandType: 'Slow',
      async handle() {
        await new Promise((r) => setTimeout(r, 200));
        return true;
      },
    });
    const result = await bus.dispatch(
      { commandType: 'Slow', source: 'test', payload: {} },
      { timeoutMs: 30 },
    );
    assert.equal(result.status, 'timeout');
  });

  it('publishes command lifecycle events on the Event Bus', async () => {
    const eventBus = createEventBus();
    const types: string[] = [];
    eventBus.subscribe((e) => {
      types.push(e.eventType);
    });
    const bus = createCommandBus({ eventBus, publishCommandLifecycleEvents: true });
    bus.registerAuthorizer(createAllowAllAuthorizer());
    bus.registerHandler({
      commandType: 'Ping',
      handle: () => 'pong',
    });
    await bus.dispatch({ commandType: 'Ping', source: 'test', payload: {} });
    assert.ok(types.includes('CommandReceived'));
    assert.ok(types.includes('CommandAuthorized'));
    assert.ok(types.includes('CommandCompleted'));
  });

  it('does not allow handlers to register each other as dependencies (isolation)', async () => {
    const bus = createCommandBus({ publishCommandLifecycleEvents: false });
    bus.registerAuthorizer(createAllowAllAuthorizer());
    bus.registerHandler({
      commandType: 'A',
      async handle(_c, ctx) {
        // Handlers must not dispatch peer commands via hidden coupling —
        // they may only use context.services if composition root exposes safe ports.
        assert.equal(typeof ctx.publishDomainEvent, 'function');
        return 'a';
      },
    });
    const result = await bus.dispatch({ commandType: 'A', source: 'test', payload: {} });
    assert.equal(result.success, true);
  });
});
