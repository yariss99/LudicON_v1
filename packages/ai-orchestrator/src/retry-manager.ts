/**
 * RetryManager — retries only recoverable failures.
 */

import { AIOrchestratorError, isRetryableError } from './errors.js';
import type { RecoverableErrorCode, RetryPolicy } from './types.js';

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 50,
  retryOn: [
    'TIMEOUT',
    'RATE_LIMIT',
    'PROVIDER_UNAVAILABLE',
    'NETWORK_FAILURE',
    'TRANSIENT',
  ],
};

export class RetryManager {
  constructor(
    private readonly policy: RetryPolicy = DEFAULT_RETRY_POLICY,
    private readonly sleep: (ms: number) => Promise<void> = defaultSleep,
  ) {}

  get maxAttempts(): number {
    return this.policy.maxAttempts;
  }

  shouldRetry(err: unknown, attempt: number): boolean {
    if (attempt >= this.policy.maxAttempts) return false;
    if (!isRetryableError(err)) return false;
    const code = (err as AIOrchestratorError).code as RecoverableErrorCode;
    return this.policy.retryOn.includes(code);
  }

  async execute<T>(
    operation: (attempt: number) => Promise<T>,
  ): Promise<{ result: T; attempts: number }> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.policy.maxAttempts; attempt++) {
      try {
        const result = await operation(attempt);
        return { result, attempts: attempt };
      } catch (err) {
        lastError = err;
        if (!this.shouldRetry(err, attempt)) throw err;
        const delay =
          this.policy.baseDelayMs * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }
    throw lastError;
  }
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Map unknown provider failures into typed orchestrator errors. */
export function classifyProviderFailure(err: unknown): AIOrchestratorError {
  if (err instanceof AIOrchestratorError) return err;
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  if (lower.includes('timeout')) {
    return new AIOrchestratorError('TIMEOUT', message, { retryable: true });
  }
  if (lower.includes('rate') || lower.includes('429')) {
    return new AIOrchestratorError('RATE_LIMIT', message, { retryable: true });
  }
  if (lower.includes('unavailable') || lower.includes('503')) {
    return new AIOrchestratorError('PROVIDER_UNAVAILABLE', message, {
      retryable: true,
    });
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return new AIOrchestratorError('NETWORK_FAILURE', message, {
      retryable: true,
    });
  }
  return new AIOrchestratorError('UNKNOWN', message, { retryable: false });
}
