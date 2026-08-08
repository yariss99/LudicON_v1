/**
 * ══════════════════════════════════════════════════════════════════════════
 *  NOT IMPLEMENTED — there is no rendering or storage backend behind this yet.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Same posture as `generate-materials`: the machinery around the work is real,
 * the work is not. Nothing is rendered, nothing is written to object storage,
 * and no download link is produced — so this returns `outcome: "skipped"`
 * rather than claiming a completed export that has no file behind it.
 *
 * When the publishing/delivery engine exists, replace the simulated delay below
 * and return `JobCompleted` with the produced `documentIds`.
 */
import {
  JOB_NAMES,
  type ExportDocumentJob,
  type JobResult,
} from "@ludicon/contracts";
import { nowTimestamp } from "@ludicon/domain";

import { delay } from "../lib/async.js";
import type { HandlerContext } from "./context.js";

const NOT_IMPLEMENTED_REASON =
  "Exportul documentelor nu este încă disponibil. Cererea a fost înregistrată.";

export const handleExportDocument = async (
  data: ExportDocumentJob,
  ctx: HandlerContext,
): Promise<JobResult> => {
  const { logger, env, signal } = ctx;

  logger.info(
    {
      documentId: data.documentId,
      format: data.format,
      requestId: data.requestId,
    },
    "export-document: accepted",
  );

  await ctx.reportProgress(0);

  // ── Where the real work goes ────────────────────────────────────────────
  await delay(env.STUB_WORK_DURATION_MS, signal);
  // ────────────────────────────────────────────────────────────────────────

  await ctx.reportProgress(100);

  logger.warn(
    { requestId: data.requestId },
    "export-document: no rendering backend is wired; reporting the job as skipped",
  );

  return {
    outcome: "skipped",
    name: JOB_NAMES.EXPORT_DOCUMENT,
    finishedAt: nowTimestamp(),
    reason: NOT_IMPLEMENTED_REASON,
  };
};
