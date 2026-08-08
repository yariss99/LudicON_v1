/**
 * Queue producers.
 *
 * The API only ever enqueues. It never runs a job, and it never imports the
 * worker: the two agree through `@ludicon/contracts` alone, so a payload change
 * fails to compile on both sides at once.
 *
 * Each queue is typed with its payload, its result and its job name, which is
 * what lets the worker exhaustively switch on `job.name` later.
 */
import type {
  ExportDocumentJob,
  GenerateMaterialsJob,
  JobResult,
} from "@ludicon/contracts";
import { JOB_NAMES, QUEUE_NAMES } from "@ludicon/contracts";
import { Queue } from "bullmq";

import type { Env } from "../env.js";
import { InternalError } from "../lib/errors.js";

export type QueueProducer = {
  enqueueGenerateMaterials: (data: GenerateMaterialsJob) => Promise<string>;
  enqueueExportDocument: (data: ExportDocumentJob) => Promise<string>;
  close: () => Promise<void>;
};

/** BullMQ types `job.id` as optional; a job we cannot name is a job we cannot report on. */
const requireJobId = (id: string | undefined, queue: string): string => {
  if (id === undefined) {
    throw new InternalError("queue accepted a job without returning an id", {
      context: { queue },
    });
  }
  return id;
};

export const createQueueProducer = (env: Env): QueueProducer => {
  const connection = { url: env.REDIS_URL };

  const defaultJobOptions = {
    attempts: env.QUEUE_JOB_ATTEMPTS,
    // Exponential, because the usual reason a generation job fails is an
    // upstream rate limit, and retrying at a fixed interval makes that worse.
    backoff: { type: "exponential", delay: env.QUEUE_JOB_BACKOFF_MS },
    // Completed jobs are kept briefly so the interface can report on them;
    // failures are kept a day so they can be investigated.
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86400 },
  };

  const generateMaterials = new Queue<
    GenerateMaterialsJob,
    JobResult,
    typeof JOB_NAMES.GENERATE_MATERIALS
  >(QUEUE_NAMES.GENERATE_MATERIALS, { connection, defaultJobOptions });

  const exportDocument = new Queue<
    ExportDocumentJob,
    JobResult,
    typeof JOB_NAMES.EXPORT_DOCUMENT
  >(QUEUE_NAMES.EXPORT_DOCUMENT, { connection, defaultJobOptions });

  return {
    enqueueGenerateMaterials: async (data): Promise<string> => {
      const job = await generateMaterials.add(
        JOB_NAMES.GENERATE_MATERIALS,
        data,
      );
      return requireJobId(job.id, QUEUE_NAMES.GENERATE_MATERIALS);
    },

    enqueueExportDocument: async (data): Promise<string> => {
      const job = await exportDocument.add(JOB_NAMES.EXPORT_DOCUMENT, data);
      return requireJobId(job.id, QUEUE_NAMES.EXPORT_DOCUMENT);
    },

    close: async (): Promise<void> => {
      await Promise.all([generateMaterials.close(), exportDocument.close()]);
    },
  };
};
