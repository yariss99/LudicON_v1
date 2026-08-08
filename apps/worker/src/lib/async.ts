/**
 * Small async primitives shared by the handlers and the shutdown sequence.
 *
 * Both clear their timers on every path. A leaked `setTimeout` keeps the event
 * loop alive and turns a clean exit into a hang.
 */

const abortReason = (signal: AbortSignal | undefined): Error =>
  signal?.reason instanceof Error ? signal.reason : new Error("aborted");

/**
 * Resolves after `ms`. Rejects immediately if `signal` is already aborted, or
 * as soon as it aborts — BullMQ passes a job's `AbortSignal` to the processor,
 * and a handler that ignores it cannot be interrupted at shutdown.
 */
export const delay = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted === true) {
      reject(abortReason(signal));
      return;
    }

    let timer: NodeJS.Timeout | undefined;

    const onAbort = (): void => {
      if (timer !== undefined) clearTimeout(timer);
      reject(abortReason(signal));
    };

    timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    signal?.addEventListener("abort", onAbort, { once: true });
  });

export type TimeoutOutcome = "settled" | "timed-out";

/**
 * Awaits `promise`, but gives up waiting after `ms`.
 *
 * Returns an outcome instead of throwing, because the caller (shutdown) needs
 * to act on a timeout rather than treat it as an error. A rejection counts as
 * "settled" — the work finished, just unsuccessfully — which also keeps the
 * rejection from escaping as an unhandled promise.
 *
 * The underlying promise is not cancelled; nothing here can cancel it.
 */
export const withTimeout = async (
  promise: Promise<unknown>,
  ms: number,
): Promise<TimeoutOutcome> => {
  let timer: NodeJS.Timeout | undefined;

  const timeout = new Promise<TimeoutOutcome>((resolve) => {
    timer = setTimeout(() => {
      resolve("timed-out");
    }, ms);
  });

  const settled = promise.then(
    (): TimeoutOutcome => "settled",
    (): TimeoutOutcome => "settled",
  );

  try {
    return await Promise.race([settled, timeout]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
};
