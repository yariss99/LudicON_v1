/**
 * RuntimeOrchestrator — Mediator for PRIMA Core engines.
 * Coordinates pipelines; does not implement educational business logic.
 */

import { EngineRegistry } from './engine-registry.js';
import { RuntimeEventBus } from './event-bus.js';
import { RuntimeOrchestratorError } from './errors.js';
import { newId, nowIso } from './ids.js';
import { RuntimeLogger, type LogSink } from './logger.js';
import { PipelineManager } from './pipeline-manager.js';
import { DEFAULT_CORE_PIPELINE, PipelineRegistry } from './pipelines.js';
import type {
  PipelineDefinition,
  RuntimeEnginePort,
  RuntimeExecutionContext,
  RuntimeObservability,
  RuntimeRequest,
  RuntimeResult,
} from './types.js';

export type CreateRuntimeOrchestratorOptions = {
  readonly engines?: EngineRegistry;
  readonly pipelines?: PipelineRegistry;
  readonly events?: RuntimeEventBus;
  readonly clock?: () => Date;
  readonly defaultPipelineId?: string;
  readonly logger?: RuntimeLogger;
  readonly logSink?: LogSink;
};

export class RuntimeOrchestrator {
  private readonly engines: EngineRegistry;
  private readonly pipelines: PipelineRegistry;
  private readonly events: RuntimeEventBus;
  private readonly pipelineManager: PipelineManager;
  private readonly logger: RuntimeLogger;
  private readonly clock: () => Date;
  private readonly defaultPipelineId: string;
  private readonly active = new Map<string, RuntimeExecutionContext>();

  constructor(options: CreateRuntimeOrchestratorOptions = {}) {
    this.clock = options.clock ?? (() => new Date());
    this.engines = options.engines ?? new EngineRegistry();
    this.pipelines = options.pipelines ?? new PipelineRegistry();
    this.events = options.events ?? new RuntimeEventBus(this.clock);
    this.logger =
      options.logger ??
      new RuntimeLogger(options.logSink ?? (() => undefined), this.clock);
    this.pipelineManager = new PipelineManager(
      this.engines,
      this.events,
      this.logger,
    );
    this.defaultPipelineId =
      options.defaultPipelineId ?? DEFAULT_CORE_PIPELINE.pipelineId;
  }

  registerEngine(engine: RuntimeEnginePort): void {
    this.engines.register(engine);
  }

  registerPipeline(pipeline: PipelineDefinition): void {
    this.pipelines.register(pipeline);
  }

  getEventBus(): RuntimeEventBus {
    return this.events;
  }

  getEngineRegistry(): EngineRegistry {
    return this.engines;
  }

  cancel(executionId: string): void {
    const ctx = this.active.get(executionId);
    if (ctx) ctx.cancelled = true;
  }

  /**
   * Run a Core pipeline end-to-end.
   */
  async execute(request: RuntimeRequest): Promise<RuntimeResult> {
    const executionId = newId('rex');
    const requestId = request.requestId ?? newId('req');
    const startedAt = nowIso(this.clock);
    const startedMs = Date.now();

    const ctx: RuntimeExecutionContext = {
      executionId,
      requestId,
      teacherId: request.teacherId,
      projectId: request.projectId,
      locale: request.locale,
      startedAt,
      bag: {
        workflowKind: request.workflowKind,
        intent: request.intent,
        educationalContext: { ...request.educationalContext },
        metadata: { ...(request.metadata ?? {}) },
      },
      warnings: [],
      costsUsd: 0,
      tokenUsage: 0,
      engineTimingsMs: {},
      cancelled: false,
    };

    this.active.set(executionId, ctx);
    this.logger.info(
      'Execution received',
      {
        workflowKind: request.workflowKind,
        teacherId: request.teacherId,
        projectId: request.projectId,
      },
      executionId,
    );

    if (request.signal) {
      const onAbort = () => {
        ctx.cancelled = true;
      };
      if (request.signal.aborted) onAbort();
      else request.signal.addEventListener('abort', onAbort, { once: true });
    }

    const failures: string[] = [];
    let status: RuntimeResult['status'] = 'running';

    this.events.publish({
      type: 'WorkflowStarted',
      executionId,
      payload: {
        workflowKind: request.workflowKind,
        teacherId: request.teacherId,
        projectId: request.projectId,
      },
    });

    try {
      const pipeline = this.pipelines.get(
        request.pipelineId ?? this.defaultPipelineId,
      );

      // Ensure required engines for this pipeline are registered
      for (const step of pipeline.steps) {
        if (!this.engines.has(step.engineId)) {
          throw new RuntimeOrchestratorError(
            'ENGINE_NOT_FOUND',
            `Pipeline ${pipeline.pipelineId} requires engine "${step.engineId}"`,
          );
        }
      }

      await this.pipelineManager.run(pipeline, ctx);
      status =
        ctx.warnings.length > 0 && !ctx.bag.artifact ? 'partial' : 'succeeded';

      this.events.publish({
        type: 'ExecutionCompleted',
        executionId,
        workflowId: ctx.workflowId,
        payload: { status },
      });
      this.logger.info(
        'Execution completed',
        { status, durationHint: Date.now() - startedMs },
        executionId,
      );
    } catch (err) {
      status = ctx.cancelled ? 'cancelled' : 'failed';
      const message = err instanceof Error ? err.message : String(err);
      failures.push(message);
      this.events.publish({
        type: 'ExecutionFailed',
        executionId,
        workflowId: ctx.workflowId,
        payload: { error: message, cancelled: ctx.cancelled },
      });
      this.logger.error('Execution failed', { error: message, status }, executionId);
    } finally {
      this.active.delete(executionId);
    }

    const observability: RuntimeObservability = {
      executionId,
      requestId,
      workflowId: ctx.workflowId,
      status,
      durationMs: Date.now() - startedMs,
      engineTimingsMs: Object.freeze({ ...ctx.engineTimingsMs }),
      failures: Object.freeze(failures),
      warnings: Object.freeze([...ctx.warnings]),
      costUsd: ctx.costsUsd,
      tokenUsage: ctx.tokenUsage,
    };

    const artifact =
      ctx.bag.artifact && typeof ctx.bag.artifact === 'object'
        ? (ctx.bag.artifact as Record<string, unknown>)
        : undefined;

    return {
      executionId,
      status,
      artifact,
      context: ctx,
      observability,
      events: this.events.list(executionId),
    };
  }
}

export function createRuntimeOrchestrator(
  options?: CreateRuntimeOrchestratorOptions,
): RuntimeOrchestrator {
  return new RuntimeOrchestrator(options);
}
