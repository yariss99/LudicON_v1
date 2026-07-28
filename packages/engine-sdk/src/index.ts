/**
 * @prima/engine-sdk — constitutional Engine contract helpers.
 * No educational business logic.
 */

export { BasePrimaEngine } from './base-engine.js';
export { MapEngineConfiguration, validateConfiguration, applyConfigDefaults } from './configuration.js';
export { noopObservability, createConsoleLogger } from './observability.js';
export {
  assertEngineContract,
  runEngineContractSuite,
} from './contract-test.js';
export { metadataFromManifest, checkKernelCompatibility } from './compatibility.js';
