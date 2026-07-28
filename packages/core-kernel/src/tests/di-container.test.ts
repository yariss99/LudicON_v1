import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DependencyContainer, token } from '../di/container.js';
import { CoreKernelError } from '../errors.js';

describe('DependencyContainer', () => {
  it('resolves constructor-injected factories lazily', () => {
    const container = new DependencyContainer();
    const Logger = token<{ lines: string[] }>('logger');
    const Service = token<{ ping: () => string }>('service');

    container.registerValue(Logger, { lines: [] });
    let factoryCalls = 0;
    container.registerFactory(Service, (c) => {
      factoryCalls += 1;
      const logger = c.resolve(Logger);
      return {
        ping: () => {
          logger.lines.push('ping');
          return 'pong';
        },
      };
    });

    assert.equal(factoryCalls, 0);
    const svc = container.resolve(Service);
    assert.equal(factoryCalls, 1);
    assert.equal(svc.ping(), 'pong');
    assert.equal(container.resolve(Service), svc);
    assert.equal(factoryCalls, 1);
    assert.deepEqual(container.resolve(Logger).lines, ['ping']);
  });

  it('supports eager factories and child overrides for tests', () => {
    const root = new DependencyContainer();
    root.registerFactory(
      'clock',
      () => () => new Date('2020-01-01T00:00:00.000Z'),
      { lazy: false },
    );
    const child = root.createChild();
    child.registerValue('clock', () => new Date('2021-01-01T00:00:00.000Z'));
    assert.equal(
      (child.resolve('clock') as () => Date)().toISOString(),
      '2021-01-01T00:00:00.000Z',
    );
  });

  it('throws when dependency missing', () => {
    const container = new DependencyContainer();
    assert.throws(
      () => container.resolve('missing'),
      (err: unknown) => err instanceof CoreKernelError,
    );
  });
});
