/**
 * Service registry — engines / services register; supports lazy materialization.
 */

import { CoreKernelError } from '../errors.js';
import type { CoreEngineModule } from '../types.js';

export type LazyEngineFactory = () => CoreEngineModule | Promise<CoreEngineModule>;

type Entry =
  | { readonly kind: 'instance'; readonly module: CoreEngineModule }
  | { readonly kind: 'lazy'; readonly id: string; readonly factory: LazyEngineFactory; instance?: CoreEngineModule };

export class ServiceRegistry {
  private readonly entries = new Map<string, Entry>();

  register(module: CoreEngineModule): void {
    if (this.entries.has(module.id)) {
      throw new CoreKernelError(
        'DUPLICATE_ENGINE',
        `Engine already registered: ${module.id}`,
      );
    }
    this.entries.set(module.id, { kind: 'instance', module });
  }

  registerLazy(id: string, factory: LazyEngineFactory): void {
    if (this.entries.has(id)) {
      throw new CoreKernelError(
        'DUPLICATE_ENGINE',
        `Engine already registered: ${id}`,
      );
    }
    this.entries.set(id, { kind: 'lazy', id, factory });
  }

  async resolve(id: string): Promise<CoreEngineModule> {
    const entry = this.entries.get(id);
    if (!entry) {
      throw new CoreKernelError('ENGINE_NOT_FOUND', `Engine not registered: ${id}`);
    }
    if (entry.kind === 'instance') return entry.module;
    if (entry.instance) return entry.instance;
    const instance = await entry.factory();
    if (instance.id !== id) {
      throw new CoreKernelError(
        'ENGINE_ID_MISMATCH',
        `Lazy engine id mismatch: expected ${id}, got ${instance.id}`,
      );
    }
    const next: Entry = { kind: 'instance', module: instance };
    this.entries.set(id, next);
    return instance;
  }

  tryGet(id: string): CoreEngineModule | undefined {
    const entry = this.entries.get(id);
    if (!entry) return undefined;
    if (entry.kind === 'instance') return entry.module;
    return entry.instance;
  }

  has(id: string): boolean {
    return this.entries.has(id);
  }

  listIds(): readonly string[] {
    return [...this.entries.keys()].sort();
  }

  async listModules(): Promise<readonly CoreEngineModule[]> {
    const modules: CoreEngineModule[] = [];
    for (const id of this.listIds()) {
      modules.push(await this.resolve(id));
    }
    return modules;
  }
}
