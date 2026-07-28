import { FatalKernelError, RecoverableKernelError } from '@prima/contracts';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  if (timeoutMs <= 0) return promise;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new RecoverableKernelError(`Timeout after ${timeoutMs}ms: ${label}`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function toKernelError(error: unknown, engineId?: string): Error {
  if (error instanceof FatalKernelError || error instanceof RecoverableKernelError) {
    return error;
  }
  if (error instanceof Error) {
    return new RecoverableKernelError(error.message, { engineId, cause: error });
  }
  return new RecoverableKernelError(String(error), { engineId, cause: error });
}
