/**
 * WorkflowRegistry — resolve catalog entries for the Workflow Engine.
 */

import type { WorkflowDefinition } from '../types.js';
import type { CatalogWorkflow, WorkflowId } from './types.js';
import { toEngineDefinition } from './types.js';
import { ALL_CATALOG_WORKFLOWS } from './workflows.js';

export class WorkflowRegistry {
  private readonly byId = new Map<WorkflowId, CatalogWorkflow>();

  constructor(workflows: readonly CatalogWorkflow[] = ALL_CATALOG_WORKFLOWS) {
    for (const wf of workflows) {
      if (this.byId.has(wf.id)) {
        throw new Error(`Duplicate workflow id in catalog: ${wf.id}`);
      }
      this.byId.set(wf.id, wf);
    }
  }

  get(id: WorkflowId): CatalogWorkflow {
    const wf = this.byId.get(id);
    if (!wf) {
      throw new Error(`Unknown workflow id: ${id}`);
    }
    return wf;
  }

  tryGet(id: WorkflowId): CatalogWorkflow | undefined {
    return this.byId.get(id);
  }

  has(id: WorkflowId): boolean {
    return this.byId.has(id);
  }

  list(): readonly CatalogWorkflow[] {
    return [...this.byId.values()];
  }

  listExecutable(): readonly CatalogWorkflow[] {
    return this.list().filter((w) => w.version !== '0.0.0');
  }

  /** Thin definition accepted by WorkflowEngine.startWorkflow. */
  toEngineDefinition(id: WorkflowId): WorkflowDefinition {
    return toEngineDefinition(this.get(id));
  }

  register(workflow: CatalogWorkflow): void {
    if (this.byId.has(workflow.id)) {
      throw new Error(`Workflow already registered: ${workflow.id}`);
    }
    this.byId.set(workflow.id, workflow);
  }
}

export function createWorkflowRegistry(
  workflows?: readonly CatalogWorkflow[],
): WorkflowRegistry {
  return new WorkflowRegistry(workflows);
}
