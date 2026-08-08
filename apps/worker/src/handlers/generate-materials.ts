/**
 * ══════════════════════════════════════════════════════════════════════════
 *  NOT IMPLEMENTED — there is no generation backend behind this handler yet.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * This is a deliberate, honest stub. It does everything a real handler does
 * *around* the work — receives a payload already validated against
 * `@ludicon/contracts`, reports progress, respects the abort signal, returns a
 * well-formed `JobResult` — and nothing at all for the work itself. It does not
 * call a model, does not read curriculum data, and does not produce teaching
 * materials.
 *
 * It therefore returns `outcome: "skipped"`, never `"completed"`. That is the
 * point: a `completed` result with an empty `documentIds` would tell the API
 * and the interface that generation succeeded and produced nothing, which is a
 * lie the teacher would eventually see. `skipped` carries a reason and is
 * honest about having done no work.
 *
 * When the generation pipeline lands, replace the simulated delay below and
 * return `JobCompleted` with the real `documentIds`. The signature holds.
 */
import {
  JOB_NAMES,
  type GenerateMaterialsJob,
  type JobResult,
} from "@ludicon/contracts";
import { nowTimestamp } from "@ludicon/domain";

import { delay } from "../lib/async.js";
import type { HandlerContext } from "./context.js";

const NOT_IMPLEMENTED_REASON =
  "Generarea materialelor nu este încă disponibilă. Cererea a fost înregistrată.";

export const handleGenerateMaterials = async (
  data: GenerateMaterialsJob,
  ctx: HandlerContext,
): Promise<JobResult> => {
  const { logger, env, signal } = ctx;

  // Identifiers only — never the lesson content itself.
  logger.info(
    {
      projectId: data.projectId,
      lessonPlanId: data.lessonPlanId,
      kinds: data.kinds,
      requestId: data.requestId,
    },
    "generate-materials: accepted",
  );

  await ctx.reportProgress(0);

  // ── Where the real work goes ────────────────────────────────────────────
  // Simulating it keeps the timing characteristics roughly honest — a job that
  // takes measurable time exercises locks, stall detection and shutdown — while
  // making it obvious in the logs that nothing was generated.
  await delay(env.STUB_WORK_DURATION_MS, signal);
  // ────────────────────────────────────────────────────────────────────────

  await ctx.reportProgress(100);

  logger.warn(
    { requestId: data.requestId },
    "generate-materials: no generation backend is wired; reporting the job as skipped",
  );

  return {
    outcome: "skipped",
    name: JOB_NAMES.GENERATE_MATERIALS,
    finishedAt: nowTimestamp(),
    reason: NOT_IMPLEMENTED_REASON,
  };
};
