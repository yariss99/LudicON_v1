/**
 * Lightweight schema helpers for catalog validation (no external schema lib).
 */

import type { WorkflowEvent, WorkflowState } from '../types.js';
import { WORKFLOW_EVENTS, WORKFLOW_STATES } from '../types.js';
import { resolveTransition } from '../transition-map.js';
import type { CatalogWorkflow } from './types.js';

export type SchemaIssue = {
  readonly path: string;
  readonly message: string;
};

export function validateCatalogWorkflow(
  workflow: CatalogWorkflow,
): readonly SchemaIssue[] {
  const issues: SchemaIssue[] = [];

  if (!workflow.id?.trim()) {
    issues.push({ path: 'id', message: 'Workflow id is required.' });
  }
  if (workflow.id !== workflow.kind) {
    issues.push({
      path: 'kind',
      message: 'kind must equal id for engine compatibility.',
    });
  }
  if (!workflow.displayName?.trim()) {
    issues.push({ path: 'displayName', message: 'displayName is required.' });
  }
  if (!workflow.version?.trim()) {
    issues.push({ path: 'version', message: 'version is required.' });
  }
  if (workflow.initialState !== 'Idle') {
    issues.push({
      path: 'initialState',
      message: 'initialState must be Idle for WorkflowEngine.startWorkflow.',
    });
  }

  for (const state of workflow.allowedStates) {
    if (!(WORKFLOW_STATES as readonly string[]).includes(state)) {
      issues.push({
        path: 'allowedStates',
        message: `Unknown state: ${state}`,
      });
    }
  }
  for (const event of workflow.allowedEvents) {
    if (!(WORKFLOW_EVENTS as readonly string[]).includes(event)) {
      issues.push({
        path: 'allowedEvents',
        message: `Unknown event: ${event}`,
      });
    }
  }

  // Happy path must be a legal chain from Idle
  let state: WorkflowState = 'Idle';
  for (let i = 0; i < workflow.happyPathEvents.length; i++) {
    const event = workflow.happyPathEvents[i] as WorkflowEvent;
    const next = resolveTransition(state, event);
    if (!next) {
      issues.push({
        path: `happyPathEvents[${i}]`,
        message: `Illegal transition ${state} + ${event}`,
      });
      break;
    }
    state = next;
  }

  for (const phase of workflow.phases) {
    if (!(WORKFLOW_STATES as readonly string[]).includes(phase.engineState)) {
      issues.push({
        path: `phases.${phase.phaseId}.engineState`,
        message: `Unknown engineState: ${phase.engineState}`,
      });
    }
  }

  if (workflow.producedObjects.length === 0 && workflow.version !== '0.0.0') {
    issues.push({
      path: 'producedObjects',
      message: 'Executable workflows must declare producedObjects.',
    });
  }

  return issues;
}

export function assertCatalogWorkflow(workflow: CatalogWorkflow): void {
  const issues = validateCatalogWorkflow(workflow);
  if (issues.length > 0) {
    throw new Error(
      `Invalid catalog workflow ${workflow.id}: ${issues
        .map((i) => `${i.path}: ${i.message}`)
        .join('; ')}`,
    );
  }
}
