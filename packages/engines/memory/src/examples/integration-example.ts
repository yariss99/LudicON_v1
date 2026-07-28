/**
 * Integration example — Memory Engine with Workflow / AI / Validation.
 */

import {
  createMemoryEngine,
  rememberAiDecision,
  rememberWorkflow,
} from '../core/index.js';

/**
 * After WorkflowEngine.dispatch, persist structured workflow progress.
 */
export function onWorkflowTransition(input: {
  teacherId: string;
  projectId: string;
  workflowId: string;
  workflowKind: string;
  state: string;
  completedSteps: string[];
}): void {
  const memory = createMemoryEngine();
  // In composition root, reuse a singleton MemoryEngine instance.
  rememberWorkflow(memory, {
    actorId: input.teacherId,
    context: {
      teacherId: input.teacherId,
      projectId: input.projectId,
      workflowId: input.workflowId,
    },
    payload: {
      workflowId: input.workflowId,
      workflowKind: input.workflowKind,
      currentState: input.state,
      completedSteps: input.completedSteps,
    },
  });
}

/**
 * After AI Orchestrator + Validation Engine, store decision memory (not prompts).
 */
export function onAiValidated(input: {
  teacherId: string;
  workflowId: string;
  requestId: string;
  provider: string;
  model: string;
  validationStatus: string;
  validationScore: number;
  resultSummary: Record<string, unknown>;
}): void {
  const memory = createMemoryEngine();
  rememberAiDecision(memory, {
    actorId: 'system',
    context: {
      teacherId: input.teacherId,
      workflowId: input.workflowId,
    },
    payload: {
      requestId: input.requestId,
      provider: input.provider,
      model: input.model,
      resultSummary: input.resultSummary,
      validationStatus: input.validationStatus,
      validationScore: input.validationScore,
    },
  });
}
