import type {
  Engine,
  EngineDescriptor,
  EngineDiscoveryFilter,
  EngineId,
  EngineRegistration,
  EngineRegistry,
  EngineValidationResult,
  RegistrationSource,
} from '@prima/contracts';
import { FatalKernelError } from '@prima/contracts';
import type { EngineLifecycleState } from '@prima/contracts';
import { satisfiesMinVersion } from './version.js';

interface Entry {
  engine: Engine;
  source: RegistrationSource;
  enabled: boolean;
  lifecycleState: EngineLifecycleState;
}

export class InMemoryEngineRegistry implements EngineRegistry {
  private readonly entries = new Map<EngineId, Entry>();
  private readonly pendingDescriptors: EngineDescriptor[] = [];

  register(engine: Engine, source: RegistrationSource = 'manual'): void {
    const id = engine.metadata.id;
    if (this.entries.has(id)) {
      throw new FatalKernelError(`Engine already registered: ${id}`, { engineId: id });
    }
    this.entries.set(id, {
      engine,
      source,
      enabled: true,
      lifecycleState: 'registered',
    });
  }

  registerDescriptor(descriptor: EngineDescriptor): void {
    this.pendingDescriptors.push(descriptor);
  }

  /** Materialize descriptor factories (automatic / plugin discovery). */
  materializeDescriptors(): Engine[] {
    const created: Engine[] = [];
    while (this.pendingDescriptors.length > 0) {
      const descriptor = this.pendingDescriptors.shift()!;
      const engine = descriptor.create();
      if (engine.metadata.id !== descriptor.metadata.id) {
        throw new FatalKernelError(
          `Descriptor id mismatch: ${descriptor.metadata.id} vs ${engine.metadata.id}`,
        );
      }
      this.register(engine, descriptor.source);
      created.push(engine);
    }
    return created;
  }

  remove(engineId: EngineId): void {
    const entry = this.require(engineId);
    if (entry.lifecycleState === 'running' || entry.lifecycleState === 'starting') {
      throw new FatalKernelError(`Cannot remove engine in state ${entry.lifecycleState}`, {
        engineId,
      });
    }
    this.entries.delete(engineId);
  }

  enable(engineId: EngineId): void {
    this.require(engineId).enabled = true;
  }

  disable(engineId: EngineId): void {
    const entry = this.require(engineId);
    if (entry.lifecycleState === 'running' || entry.lifecycleState === 'starting') {
      throw new FatalKernelError(`Cannot disable running engine: ${engineId}`, { engineId });
    }
    entry.enabled = false;
  }

  discover(filter: EngineDiscoveryFilter = {}): readonly EngineRegistration[] {
    return this.list().filter((reg) => {
      if (filter.enabledOnly && !reg.enabled) return false;
      if (filter.source && reg.source !== filter.source) return false;
      if (filter.capability && !reg.metadata.capabilities.includes(filter.capability)) {
        return false;
      }
      if (filter.minVersion && !satisfiesMinVersion(reg.metadata.version, filter.minVersion)) {
        return false;
      }
      return true;
    });
  }

  resolve(engineId: EngineId): Engine {
    return this.require(engineId).engine;
  }

  tryResolve(engineId: EngineId): Engine | undefined {
    return this.entries.get(engineId)?.engine;
  }

  validate(engineId: EngineId): EngineValidationResult {
    const issues: string[] = [];
    const entry = this.entries.get(engineId);
    if (!entry) {
      return { engineId, ok: false, issues: [`Engine not found: ${engineId}`] };
    }
    const { metadata } = entry.engine;
    if (!metadata.id) issues.push('Missing engine id');
    if (!metadata.version) issues.push('Missing version');
    if (!metadata.name) issues.push('Missing name');
    for (const dep of metadata.dependencies) {
      if (!this.entries.has(dep)) issues.push(`Missing dependency: ${dep}`);
      else if (!this.entries.get(dep)!.enabled) issues.push(`Dependency disabled: ${dep}`);
    }
    return { engineId, ok: issues.length === 0, issues };
  }

  validateAll(): readonly EngineValidationResult[] {
    return [...this.entries.keys()].map((id) => this.validate(id));
  }

  list(): readonly EngineRegistration[] {
    return [...this.entries.values()].map((e) => ({
      metadata: e.engine.metadata,
      source: e.source,
      enabled: e.enabled,
      lifecycleState: e.lifecycleState,
    }));
  }

  getEngine(engineId: EngineId): Engine {
    return this.require(engineId).engine;
  }

  setLifecycleState(engineId: EngineId, state: EngineLifecycleState): void {
    this.require(engineId).lifecycleState = state;
  }

  getLifecycleState(engineId: EngineId): EngineLifecycleState {
    return this.require(engineId).lifecycleState;
  }

  enabledEngines(): Engine[] {
    return [...this.entries.values()].filter((e) => e.enabled).map((e) => e.engine);
  }

  private require(engineId: EngineId): Entry {
    const entry = this.entries.get(engineId);
    if (!entry) {
      throw new FatalKernelError(`Engine not registered: ${engineId}`, { engineId });
    }
    return entry;
  }
}
