/**
 * Pipeline Manager — sequential / parallel / conditional / retry / timeout / cancel / rollback.
 */

import { RuntimeOrchestratorError } from './errors.js';
import { sleep } from './ids.js';
import type { RuntimeLogger } from './logger.js';
import type { EngineRegistry } from './engine-registry.js';
import type { RuntimeEventBus } from './event-bus.js';
import type {
  EngineStepResult,
  PipelineDefinition,
  PipelineStep,
  RuntimeExecutionContext,
} from './types.js';

function snapshotBag(bag: Record<string, unknown>): Record<string, unknown> {
  return structuredClone(bag);
}

function restoreBag(
  bag: Record<string, unknown>,
  snapshot: Record<string, unknown>,
): void {
  for (const key of Object.keys(bag)) {
    delete bag[key];
  }
  Object.assign(bag, snapshot);
}

export class PipelineManager {
  constructor(
    private readonly engines: EngineRegistry,
    private readonly events: RuntimeEventBus,
    private readonly logger?: RuntimeLogger,
  ) {}

  async run(
    pipeline: PipelineDefinition,
    ctx: RuntimeExecutionContext,
  ): Promise<void> {
    this.logger?.info(
      'Pipeline started',
      { pipelineId: pipeline.pipelineId },
      ctx.executionId,
    );
    const remaining = [...pipeline.steps];
    while (remaining.length > 0) {
      if (ctx.cancelled) {
        throw new RuntimeOrchestratorError(
          'CANCELLED',
          'Execution cancelled.',
        );
      }

      const next = remaining[0]!;
      if (next.parallelGroup) {
        const groupId = next.parallelGroup;
        const group: PipelineStep[] = [];
        while (
          remaining.length > 0 &&
          remaining[0]!.parallelGroup === groupId
        ) {
          group.push(remaining.shift()!);
        }
        await Promise.all(group.map((step) => this.runStep(step, ctx)));
        continue;
      }

      remaining.shift();
      await this.runStep(next, ctx);
    }
    this.logger?.info(
      'Pipeline completed',
      { pipelineId: pipeline.pipelineId },
      ctx.executionId,
    );
  }

  private async runStep(
    step: PipelineStep,
    ctx: RuntimeExecutionContext,
  ): Promise<void> {
    if (step.when && !step.when(ctx)) {
      this.events.publish({
        type: 'StepCompleted',
        executionId: ctx.executionId,
        workflowId: ctx.workflowId,
        engineId: step.engineId,
        stepId: step.stepId,
        payload: { skipped: true },
      });
      return;
    }

    const bagSnapshot =
      step.onFailure === 'rollback' ? snapshotBag(ctx.bag) : undefined;

    this.events.publish({
      type: 'StepStarted',
      executionId: ctx.executionId,
      workflowId: ctx.workflowId,
      engineId: step.engineId,
      stepId: step.stepId,
      payload: {},
    });

    const engine = this.engines.get(step.engineId);
    const input = step.inputFrom?.(ctx) ?? { bag: ctx.bag };
    const maxAttempts = step.retry?.maxAttempts ?? 1;
    const baseDelay = step.retry?.baseDelayMs ?? 20;

    let lastError: string | undefined;
    let result: EngineStepResult | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (ctx.cancelled) {
        throw new RuntimeOrchestratorError('CANCELLED', 'Execution cancelled.');
      }
      const started = Date.now();
      try {
        result = await this.withTimeout(
          engine.execute(input, ctx),
          step.timeoutMs,
          step.engineId,
        );
        ctx.engineTimingsMs[step.stepId] =
          (ctx.engineTimingsMs[step.stepId] ?? 0) + (Date.now() - started);

        if (result.ok) {
          this.applyResult(ctx, result);
          this.events.publish({
            type: 'StepCompleted',
            executionId: ctx.executionId,
            workflowId: ctx.workflowId,
            engineId: step.engineId,
            stepId: step.stepId,
            payload: { attempt, outputKeys: Object.keys(result.output ?? {}) },
          });
          if (result.emit) {
            this.events.publish({
              type: result.emit,
              executionId: ctx.executionId,
              workflowId: ctx.workflowId,
              engineId: step.engineId,
              stepId: step.stepId,
              payload: result.output ?? {},
            });
          }
          return;
        }

        lastError = result.error ?? 'Step failed';
        if (!result.retryable || attempt >= maxAttempts) {
          break;
        }
        await sleep(baseDelay * attempt);
      } catch (err) {
        ctx.engineTimingsMs[step.stepId] =
          (ctx.engineTimingsMs[step.stepId] ?? 0) + (Date.now() - started);
        lastError = err instanceof Error ? err.message : String(err);
        const retryable =
          err instanceof RuntimeOrchestratorError
            ? err.retryable
            : false;
        if (!retryable || attempt >= maxAttempts) {
          break;
        }
        await sleep(baseDelay * attempt);
      }
    }

    this.events.publish({
      type: 'StepFailed',
      executionId: ctx.executionId,
      workflowId: ctx.workflowId,
      engineId: step.engineId,
      stepId: step.stepId,
      payload: { error: lastError },
    });

    this.logger?.warn(
      'Pipeline step failed',
      { stepId: step.stepId, error: lastError, onFailure: step.onFailure },
      ctx.executionId,
    );

    if (step.onFailure === 'continue') {
      ctx.warnings.push(
        `${step.stepId}: ${lastError ?? 'failed (continued)'}`,
      );
      return;
    }

    if (step.onFailure === 'rollback' && bagSnapshot) {
      restoreBag(ctx.bag, bagSnapshot);
      this.events.publish({
        type: 'StepFailed',
        executionId: ctx.executionId,
        workflowId: ctx.workflowId,
        engineId: step.engineId,
        stepId: step.stepId,
        payload: { error: lastError, rolledBack: true },
      });
    }

    throw new RuntimeOrchestratorError(
      'STEP_FAILED',
      `Pipeline step ${step.stepId} failed: ${lastError}`,
    );
  }

  private applyResult(
    ctx: RuntimeExecutionContext,
    result: EngineStepResult,
  ): void {
    if (result.output) {
      Object.assign(ctx.bag, result.output);
    }
    if (result.costUsd) ctx.costsUsd += result.costUsd;
    if (result.tokens) ctx.tokenUsage += result.tokens;
    if (result.warnings) ctx.warnings.push(...result.warnings);
    if (typeof result.output?.workflowId === 'string' && !ctx.workflowId) {
      ctx.workflowId = result.output.workflowId as string;
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number | undefined,
    engineId: string,
  ): Promise<T> {
    if (!timeoutMs || timeoutMs <= 0) return promise;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timer = setTimeout(() => {
            reject(
              new RuntimeOrchestratorError(
                'TIMEOUT',
                `Engine ${engineId} timed out after ${timeoutMs}ms`,
                { retryable: true },
              ),
            );
          }, timeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
