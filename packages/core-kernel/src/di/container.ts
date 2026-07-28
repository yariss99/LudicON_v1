/**
 * Dependency injection container — constructor injection, no global singletons.
 */

import { CoreKernelError } from '../errors.js';

export type ServiceToken<T = unknown> = string & { readonly __brand?: T };

export type Factory<T> = (container: DependencyContainer) => T;

type Registration<T> =
  | { readonly kind: 'value'; readonly value: T }
  | { readonly kind: 'factory'; readonly factory: Factory<T>; readonly lazy: boolean };

export class DependencyContainer {
  private readonly registrations = new Map<string, Registration<unknown>>();
  private readonly cache = new Map<string, unknown>();
  private readonly parent?: DependencyContainer;

  constructor(parent?: DependencyContainer) {
    this.parent = parent;
  }

  /** Register a concrete instance. */
  registerValue<T>(token: ServiceToken<T> | string, value: T): this {
    this.assertNotFrozen(token);
    this.registrations.set(String(token), { kind: 'value', value });
    this.cache.set(String(token), value);
    return this;
  }

  /**
   * Register a factory. Lazy factories resolve on first `resolve`.
   * Eager factories resolve immediately (still via factory — testable).
   */
  registerFactory<T>(
    token: ServiceToken<T> | string,
    factory: Factory<T>,
    options?: { lazy?: boolean },
  ): this {
    this.assertNotFrozen(token);
    const lazy = options?.lazy ?? true;
    this.registrations.set(String(token), { kind: 'factory', factory, lazy });
    this.cache.delete(String(token));
    if (!lazy) {
      this.cache.set(String(token), factory(this));
    }
    return this;
  }

  resolve<T>(token: ServiceToken<T> | string): T {
    const key = String(token);
    if (this.cache.has(key)) return this.cache.get(key) as T;

    const reg = this.registrations.get(key);
    if (reg) {
      if (reg.kind === 'value') return reg.value as T;
      const value = reg.factory(this);
      this.cache.set(key, value);
      return value as T;
    }

    if (this.parent) return this.parent.resolve<T>(token);

    throw new CoreKernelError(
      'SERVICE_NOT_FOUND',
      `Dependency not registered: ${key}`,
    );
  }

  tryResolve<T>(token: ServiceToken<T> | string): T | undefined {
    try {
      return this.resolve<T>(token);
    } catch {
      return undefined;
    }
  }

  has(token: ServiceToken | string): boolean {
    const key = String(token);
    return (
      this.registrations.has(key) ||
      this.cache.has(key) ||
      (this.parent?.has(key) ?? false)
    );
  }

  /** Child container for tests / scoped overrides. */
  createChild(): DependencyContainer {
    return new DependencyContainer(this);
  }

  listTokens(): readonly string[] {
    const keys = new Set<string>([
      ...this.registrations.keys(),
      ...(this.parent?.listTokens() ?? []),
    ]);
    return [...keys].sort();
  }

  private assertNotFrozen(_token: string): void {
    // Reserved for future freeze-after-boot; registration remains open for reload.
  }
}

export function token<T>(name: string): ServiceToken<T> {
  return name as ServiceToken<T>;
}
