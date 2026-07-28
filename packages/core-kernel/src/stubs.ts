/**
 * Test / local stub Core engines.
 */

import type { CoreEngineModule } from './types.js';

export function createStubCoreEngine(
  id: string,
  options?: {
    dependencies?: readonly string[];
    failOnStart?: boolean;
    healthStatus?: 'healthy' | 'degraded' | 'unhealthy';
  },
): CoreEngineModule {
  let configured = false;
  let initialized = false;
  return {
    id,
    displayName: `Stub ${id}`,
    version: '0.0.0',
    dependencies: options?.dependencies ?? [],
    async configure() {
      configured = true;
    },
    async initialize() {
      if (!configured) throw new Error(`${id} not configured`);
      initialized = true;
    },
    async start() {
      if (!initialized) throw new Error(`${id} not initialized`);
      if (options?.failOnStart) throw new Error(`${id} start failed`);
    },
    async stop() {
      /* ok */
    },
    health() {
      return { status: options?.healthStatus ?? 'healthy' };
    },
  };
}
