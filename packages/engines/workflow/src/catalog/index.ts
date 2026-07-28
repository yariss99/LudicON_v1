/**
 * PRIMA Workflow Catalog — product definitions for @prima/engine-workflow.
 */

import {
  WORKFLOW_CATALOG_VERSION,
  WORKFLOW_ENGINE_COMPATIBILITY,
} from './catalog-meta.js';
import { createWorkflowRegistry, WorkflowRegistry } from './registry.js';
import { assertCatalogWorkflow } from './schemas.js';
import type { CatalogWorkflow, WorkflowCatalogDocument } from './types.js';
import { ALL_CATALOG_WORKFLOWS } from './workflows.js';

export { WORKFLOW_CATALOG_VERSION, WORKFLOW_ENGINE_COMPATIBILITY };

export function buildCatalogDocument(
  workflows: readonly CatalogWorkflow[] = ALL_CATALOG_WORKFLOWS,
): WorkflowCatalogDocument {
  for (const wf of workflows) {
    if (wf.version !== '0.0.0') {
      assertCatalogWorkflow(wf);
    }
  }
  return {
    catalogVersion: WORKFLOW_CATALOG_VERSION,
    engineCompatibility: WORKFLOW_ENGINE_COMPATIBILITY,
    workflows,
  };
}

export const PRIMA_WORKFLOW_CATALOG: WorkflowCatalogDocument =
  buildCatalogDocument();

export function createDefaultWorkflowRegistry(): WorkflowRegistry {
  return createWorkflowRegistry(ALL_CATALOG_WORKFLOWS);
}

export * from './types.js';
export * from './shared.js';
export * from './phases.js';
export * from './workflows.js';
export * from './registry.js';
export * from './schemas.js';
export * from './json.js';
export * from './catalog-meta.js';
