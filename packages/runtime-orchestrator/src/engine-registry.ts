/**
 * Engine Registry — dynamic discovery, no hardcoded engine imports.
 */

import { RuntimeOrchestratorError } from './errors.js';
import type { EngineId, RuntimeEnginePort } from './types.js';

export class EngineRegistry {
  private readonly engines = new Map<EngineId, RuntimeEnginePort>();

  register(engine: RuntimeEnginePort): void {
    if (this.engines.has(engine.engineId)) {
      throw new RuntimeOrchestratorError(
        'DUPLICATE_ENGINE',
        `Engine already registered: ${engine.engineId}`,
      );
    }
    this.engines.set(engine.engineId, engine);
  }

  unregister(engineId: EngineId): boolean {
    return this.engines.delete(engineId);
  }

  get(engineId: EngineId): RuntimeEnginePort {
    const e = this.engines.get(engineId);
    if (!e) {
      throw new RuntimeOrchestratorError(
        'ENGINE_NOT_FOUND',
        `Engine not registered: ${engineId}`,
      );
    }
    return e;
  }

  tryGet(engineId: EngineId): RuntimeEnginePort | undefined {
    return this.engines.get(engineId);
  }

  list(): readonly RuntimeEnginePort[] {
    return [...this.engines.values()];
  }

  has(engineId: EngineId): boolean {
    return this.engines.has(engineId);
  }
}
