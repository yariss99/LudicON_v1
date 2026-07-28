/**
 * Pipeline definitions — declarative Core execution paths.
 */

import type { PipelineDefinition } from './types.js';

/** Default PRIMA Core pipeline (sequential with optional repair). */
export const DEFAULT_CORE_PIPELINE: PipelineDefinition = {
  pipelineId: 'prima.core.default',
  displayName: 'PRIMA Core Default Pipeline',
  steps: [
    {
      stepId: 'workflow.start',
      engineId: 'workflow',
      inputFrom: (ctx) => ({
        phase: 'start',
        teacherId: ctx.teacherId,
        projectId: ctx.projectId,
        bag: ctx.bag,
      }),
    },
    {
      stepId: 'context.load',
      engineId: 'context',
      inputFrom: (ctx) => ({
        teacherId: ctx.teacherId,
        projectId: ctx.projectId,
        workflowId: ctx.workflowId,
        bag: ctx.bag,
      }),
    },
    {
      stepId: 'prompt.compile',
      engineId: 'prompt',
      inputFrom: (ctx) => ({
        bag: ctx.bag,
        locale: ctx.locale,
      }),
    },
    {
      stepId: 'ai.generate',
      engineId: 'ai',
      timeoutMs: 60_000,
      retry: { maxAttempts: 2, baseDelayMs: 20 },
      inputFrom: (ctx) => ({
        bag: ctx.bag,
        teacherId: ctx.teacherId,
        workflowId: ctx.workflowId,
      }),
    },
    {
      stepId: 'validation.check',
      engineId: 'validation',
      inputFrom: (ctx) => ({
        bag: ctx.bag,
        profileId: 'Publication',
      }),
    },
    {
      stepId: 'validation.repair',
      engineId: 'validation',
      when: (ctx) => ctx.bag.validationStatus === 'rejected',
      inputFrom: (ctx) => ({
        phase: 'repair',
        bag: ctx.bag,
      }),
      onFailure: 'continue',
    },
    {
      stepId: 'memory.save',
      engineId: 'memory',
      inputFrom: (ctx) => ({
        teacherId: ctx.teacherId,
        projectId: ctx.projectId,
        workflowId: ctx.workflowId,
        bag: ctx.bag,
      }),
    },
    {
      stepId: 'tools.export',
      engineId: 'tools',
      when: (ctx) => Boolean(ctx.bag.readyToExport),
      inputFrom: (ctx) => ({
        capability: 'export.pdf',
        bag: ctx.bag,
        teacherId: ctx.teacherId,
        projectId: ctx.projectId,
      }),
      onFailure: 'continue',
    },
  ],
};

export class PipelineRegistry {
  private readonly pipelines = new Map<string, PipelineDefinition>();

  constructor(seed: readonly PipelineDefinition[] = [DEFAULT_CORE_PIPELINE]) {
    for (const p of seed) this.register(p);
  }

  register(pipeline: PipelineDefinition): void {
    this.pipelines.set(pipeline.pipelineId, pipeline);
  }

  get(pipelineId: string): PipelineDefinition {
    const p = this.pipelines.get(pipelineId);
    if (!p) {
      throw new Error(`Unknown pipeline: ${pipelineId}`);
    }
    return p;
  }

  list(): readonly PipelineDefinition[] {
    return [...this.pipelines.values()];
  }
}
