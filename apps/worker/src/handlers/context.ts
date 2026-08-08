/**
 * What a handler is given to do its work.
 *
 * Handlers receive this instead of the raw BullMQ `Job` so they stay free of
 * queue-transport concerns: nothing in a handler should know that the job
 * arrived via Redis, or be able to move it between BullMQ states.
 */
import type { Logger } from "pino";

import type { Env } from "../env.js";

export interface HandlerContext {
  /** Already bound to this job — carries `jobId`, `jobName`, `queue`, `attempt`. */
  readonly logger: Logger;

  readonly env: Env;

  /**
   * Aborted when the worker is shutting down or the job's lock could not be
   * renewed. Long-running handlers must pass it into whatever they await;
   * a handler that ignores it cannot be interrupted and will be killed mid-work.
   */
  readonly signal: AbortSignal | undefined;

  /** Publishes progress (0-100) to `QueueEvents` subscribers. */
  readonly reportProgress: (percent: number) => Promise<void>;
}
