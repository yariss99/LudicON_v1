import type { OrchestratorErrorCode } from './types.js';

export class AIOrchestratorError extends Error {
  readonly code: OrchestratorErrorCode;
  readonly retryable: boolean;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    code: OrchestratorErrorCode,
    message: string,
    options?: {
      retryable?: boolean;
      details?: Readonly<Record<string, unknown>>;
      cause?: unknown;
    },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = 'AIOrchestratorError';
    this.code = code;
    this.retryable = options?.retryable ?? false;
    this.details = options?.details;
  }
}

export function isRetryableError(err: unknown): boolean {
  return err instanceof AIOrchestratorError && err.retryable;
}
