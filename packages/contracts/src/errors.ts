/** Kernel error taxonomy. */

export type KernelErrorSeverity = 'recoverable' | 'fatal';

export class KernelError extends Error {
  readonly severity: KernelErrorSeverity;
  readonly engineId?: string;
  readonly cause?: unknown;

  constructor(
    message: string,
    severity: KernelErrorSeverity,
    options?: { engineId?: string; cause?: unknown },
  ) {
    super(message);
    this.name = 'KernelError';
    this.severity = severity;
    this.engineId = options?.engineId;
    this.cause = options?.cause;
  }
}

export class RecoverableKernelError extends KernelError {
  constructor(message: string, options?: { engineId?: string; cause?: unknown }) {
    super(message, 'recoverable', options);
    this.name = 'RecoverableKernelError';
  }
}

export class FatalKernelError extends KernelError {
  constructor(message: string, options?: { engineId?: string; cause?: unknown }) {
    super(message, 'fatal', options);
    this.name = 'FatalKernelError';
  }
}

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly delayMs: number;
  shouldRetry(error: unknown, attempt: number): boolean;
}

export const defaultStartRetryPolicy = (
  maxAttempts: number,
  delayMs: number,
): RetryPolicy => ({
  maxAttempts,
  delayMs,
  shouldRetry(error, attempt) {
    if (attempt >= maxAttempts) return false;
    if (error instanceof FatalKernelError) return false;
    if (error instanceof KernelError) return error.severity === 'recoverable';
    return true;
  },
});
