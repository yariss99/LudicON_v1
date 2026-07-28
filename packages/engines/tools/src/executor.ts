/**
 * ToolExecutor — Command Pattern: validate → authorize → sandbox → execute (+ retry).
 */

import { ToolEngineError } from './errors.js';
import { newId, sleep } from './ids.js';
import type { ToolMonitor } from './monitor.js';
import type { ToolPermissionManager } from './permission-manager.js';
import type { ToolRegistry } from './registry.js';
import type { ToolSandbox } from './sandbox.js';
import type { ToolValidator } from './validator.js';
import type {
  ToolHandler,
  ToolInvokeRequest,
  ToolResult,
  ToolRetryPolicy,
} from './types.js';

export class ToolExecutor {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly validator: ToolValidator,
    private readonly permissions: ToolPermissionManager,
    private readonly sandbox: ToolSandbox,
    private readonly monitor: ToolMonitor,
  ) {}

  async execute(request: ToolInvokeRequest): Promise<ToolResult> {
    const started = Date.now();
    const executionId = newId('tex');
    const logs: string[] = [];
    let attempts = 0;

    let handler: ToolHandler;
    try {
      handler = this.registry.get(request.toolId);
      this.validator.validateDescriptor(handler.descriptor);
      this.validator.validateRequest(handler.descriptor, request);
      this.permissions.authorize(handler.descriptor, request.context);
      this.sandbox.assertAllowed(handler.descriptor, request);
    } catch (err) {
      const result = this.failureResult({
        executionId,
        request,
        started,
        attempts: 0,
        err,
        logs,
      });
      this.monitor.record(
        result,
        request.context.teacherId,
        request.context.workflowId,
      );
      return result;
    }

    const policy = handler.descriptor.retryPolicy;
    const timeoutMs = request.timeoutMs ?? handler.descriptor.timeoutMs;

    try {
      const ran = await this.withRetry(policy, async (attempt) => {
        attempts = attempt;
        logs.push(`attempt=${attempt}`);
        return this.runOnce(handler, request, timeoutMs, logs);
      });

      const result: ToolResult = {
        executionId,
        toolId: request.toolId,
        action: request.action,
        status: ran.partial ? 'partial' : 'succeeded',
        durationMs: Date.now() - started,
        output: Object.freeze({ ...ran.output }),
        logs: Object.freeze([...logs, ...(ran.logs ?? [])]),
        warnings: Object.freeze([...(ran.warnings ?? [])]),
        errors: Object.freeze([]),
        costUsd: ran.costUsd ?? 0,
        attempts,
        metadata: Object.freeze({
          category: handler.descriptor.category,
          version: handler.descriptor.version,
          sandbox: this.sandbox.getPolicy(),
        }),
      };
      this.monitor.record(
        result,
        request.context.teacherId,
        request.context.workflowId,
      );
      return result;
    } catch (err) {
      const result = this.failureResult({
        executionId,
        request,
        started,
        attempts,
        err,
        logs,
      });
      this.monitor.record(
        result,
        request.context.teacherId,
        request.context.workflowId,
      );
      return result;
    }
  }

  private async runOnce(
    handler: ToolHandler,
    request: ToolInvokeRequest,
    timeoutMs: number,
    logs: string[],
  ): Promise<{
    output: Readonly<Record<string, unknown>>;
    logs?: readonly string[];
    warnings?: readonly string[];
    costUsd?: number;
    partial?: boolean;
  }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const result = await handler.execute({
        action: request.action,
        input: request.input,
        context: request.context,
        signal: controller.signal,
      });
      logs.push('handler-complete');
      return result;
    } catch (err) {
      if (controller.signal.aborted) {
        throw new ToolEngineError(
          'TIMEOUT',
          `Tool ${request.toolId} timed out after ${timeoutMs}ms`,
          { retryable: true },
        );
      }
      throw classify(err);
    } finally {
      clearTimeout(timer);
    }
  }

  private async withRetry<T>(
    policy: ToolRetryPolicy,
    op: (attempt: number) => Promise<T>,
  ): Promise<T> {
    let last: unknown;
    for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
      try {
        return await op(attempt);
      } catch (err) {
        last = err;
        const code = err instanceof ToolEngineError ? err.code : 'UNKNOWN';
        const retryable =
          err instanceof ToolEngineError
            ? err.retryable
            : false;
        const mapped = mapRetryCode(code);
        if (
          !retryable ||
          !mapped ||
          !policy.retryOn.includes(mapped) ||
          attempt >= policy.maxAttempts
        ) {
          throw err;
        }
        await sleep(policy.baseDelayMs * attempt);
      }
    }
    throw last;
  }

  private failureResult(input: {
    executionId: string;
    request: ToolInvokeRequest;
    started: number;
    attempts: number;
    err: unknown;
    logs: string[];
  }): ToolResult {
    const err =
      input.err instanceof ToolEngineError
        ? input.err
        : classify(input.err);
    const status =
      err.code === 'PERMISSION_DENIED' || err.code === 'SANDBOX_DENIED'
        ? 'denied'
        : err.code === 'TIMEOUT'
          ? 'timeout'
          : err.code === 'TOOL_UNAVAILABLE'
            ? 'unavailable'
            : 'failed';

    return {
      executionId: input.executionId,
      toolId: input.request.toolId,
      action: input.request.action,
      status,
      durationMs: Date.now() - input.started,
      output: Object.freeze({}),
      logs: Object.freeze([...input.logs]),
      warnings: Object.freeze([]),
      errors: Object.freeze([err.message]),
      costUsd: 0,
      attempts: input.attempts,
      metadata: Object.freeze({ errorCode: err.code }),
    };
  }
}

function classify(err: unknown): ToolEngineError {
  if (err instanceof ToolEngineError) return err;
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  if (lower.includes('timeout') || lower.includes('aborted')) {
    return new ToolEngineError('TIMEOUT', message, { retryable: true });
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return new ToolEngineError('NETWORK', message, { retryable: true });
  }
  if (lower.includes('unavailable')) {
    return new ToolEngineError('TOOL_UNAVAILABLE', message, { retryable: true });
  }
  return new ToolEngineError('EXECUTION_FAILED', message, { retryable: false });
}

function mapRetryCode(
  code: string,
): 'timeout' | 'network' | 'unavailable' | 'transient' | undefined {
  if (code === 'TIMEOUT') return 'timeout';
  if (code === 'NETWORK') return 'network';
  if (code === 'TOOL_UNAVAILABLE') return 'unavailable';
  if (code === 'TRANSIENT') return 'transient';
  return undefined;
}
