/**
 * @prima/composition — Production Composition Root for PRIMA Core
 */

export {
  createProductionEngines,
  registerProductionPorts,
  createWorkflowAdapter,
  createContextAdapter,
  createPromptAdapter,
  createAiAdapter,
  createValidationAdapter,
  createMemoryAdapter,
  createToolsAdapter,
  assertPromptGate,
} from './adapters.js';
export type {
  ProductionEngines,
  CreateProductionEnginesOptions,
} from './adapters.js';

export {
  createProductionComposition,
  createDeterministicCompletionTransport,
} from './composition-root.js';
export type {
  CompositionMode,
  CreateCompositionOptions,
  PrimaComposition,
} from './composition-root.js';
