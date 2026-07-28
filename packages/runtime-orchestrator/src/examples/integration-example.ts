/**
 * Integration example — wire real engines at composition root via ports.
 *
 * RuntimeOrchestrator never imports @prima/engine-* packages.
 * Adapters translate engine APIs ↔ RuntimeEnginePort.
 */

import {
  createRuntimeOrchestrator,
  registerCoreStubs,
  type RuntimeEnginePort,
} from '../index.js';

/**
 * Local/dev bootstrap using stubs.
 * Production: replace stubs with adapters around Workflow/AI/Validation/Memory/Tools.
 */
export function bootstrapPrimaRuntime() {
  const runtime = createRuntimeOrchestrator();
  registerCoreStubs((engine) => runtime.registerEngine(engine));
  return runtime;
}

/**
 * Example adapter shape for AI Orchestrator:
 *
 * const aiPort: RuntimeEnginePort = {
 *   engineId: 'ai',
 *   displayName: 'AI Orchestrator',
 *   version: '0.1.0',
 *   async execute(input, ctx) {
 *     const response = await aiOrchestrator.execute({ ...map from ctx.bag });
 *     return {
 *       ok: response.status === 'succeeded',
 *       output: { aiResult: response.structuredResult },
 *       costUsd: response.costUsd,
 *       tokens: response.tokens.totalTokens,
 *       emit: 'AICompleted',
 *     };
 *   },
 * };
 */
export type AiAdapterExample = RuntimeEnginePort;
