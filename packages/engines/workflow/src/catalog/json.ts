/**
 * Serialize catalog to JSON-friendly plain objects.
 */

import {
  WORKFLOW_CATALOG_VERSION,
  WORKFLOW_ENGINE_COMPATIBILITY,
} from './catalog-meta.js';
import type { CatalogWorkflow, WorkflowCatalogDocument } from './types.js';
import { ALL_CATALOG_WORKFLOWS } from './workflows.js';

export function catalogToJson(
  workflows: readonly CatalogWorkflow[] = ALL_CATALOG_WORKFLOWS,
): WorkflowCatalogDocument {
  const document: WorkflowCatalogDocument = {
    catalogVersion: WORKFLOW_CATALOG_VERSION,
    engineCompatibility: WORKFLOW_ENGINE_COMPATIBILITY,
    workflows,
  };
  return JSON.parse(JSON.stringify(document)) as WorkflowCatalogDocument;
}

export function workflowToJson(workflow: CatalogWorkflow): CatalogWorkflow {
  return JSON.parse(JSON.stringify(workflow)) as CatalogWorkflow;
}

export function allWorkflowsToJson(): readonly CatalogWorkflow[] {
  return ALL_CATALOG_WORKFLOWS.map(workflowToJson);
}
