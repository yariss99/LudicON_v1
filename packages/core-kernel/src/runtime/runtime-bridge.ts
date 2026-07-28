/**
 * Fail-closed Runtime bridge.
 * Production must use @prima/composition createProductionComposition.
 * Stubs require explicit useStubs: true (unit tests only).
 */

import {
  createRuntimeOrchestrator,
  registerCoreStubs,
  type RuntimeOrchestrator,
} from '@prima/runtime-orchestrator';
import type { RuntimeStarter } from '../types.js';

export type RuntimeBridge = RuntimeStarter & {
  readonly orchestrator: RuntimeOrchestrator;
  readonly stubMode: boolean;
};

export function createRuntimeBridge(options?: {
  /**
   * Explicit opt-in for isolated unit tests.
   * Default false — empty orchestrator (engines must be registered by Composition Root).
   */
  readonly useStubs?: boolean;
}): RuntimeBridge {
  const orchestrator = createRuntimeOrchestrator();
  const useStubs = options?.useStubs === true;
  if (useStubs) {
    registerCoreStubs((e) => orchestrator.registerEngine(e));
  }
  let started = false;
  return {
    orchestrator,
    stubMode: useStubs,
    version: '0.1.0',
    async start() {
      if (!useStubs && orchestrator.getEngineRegistry().list().length === 0) {
        throw new Error(
          'Runtime bridge has no engines registered. Use @prima/composition createProductionComposition for production, or pass useStubs: true for isolated unit tests only.',
        );
      }
      started = true;
    },
    async stop() {
      started = false;
    },
    async health() {
      return started ? 'healthy' : 'unknown';
    },
  };
}
