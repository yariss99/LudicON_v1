export class ToolEngineError extends Error {
  readonly code: string;
  readonly retryable: boolean;

  constructor(
    code: string,
    message: string,
    options?: { retryable?: boolean; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = 'ToolEngineError';
    this.code = code;
    this.retryable = options?.retryable ?? false;
  }
}
