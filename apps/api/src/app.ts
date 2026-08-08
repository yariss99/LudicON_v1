/**
 * The Hono application factory.
 *
 * Everything the app needs is constructed here and passed down explicitly, so a
 * test can build the same app against a different database or a fake queue
 * without touching a module-level singleton.
 *
 * Two structural decisions matter:
 *
 *   - **Authenticated by default.** `requireAuth` is mounted on `/api/v1/*`
 *     before any module is attached. Adding a route inside that subtree cannot
 *     accidentally add an unauthenticated one; the operational endpoints are
 *     deliberately mounted outside it.
 *   - **One unbroken chain.** The mounted routes are chained into a single
 *     expression, and `AppType` is `typeof` that expression. Breaking it into
 *     separate statements would erase the types `hc<AppType>()` depends on.
 */
import { HealthResponse, ok, ReadyResponse } from "@ludicon/contracts";
import { Hono } from "hono";
import { cors } from "hono/cors";

import type { AppEnv } from "./context.js";
import type { DatabaseHandle } from "./db/client.js";
import type { Env } from "./env.js";
import { shouldValidateResponses } from "./env.js";
import { createResponseValidator } from "./lib/response.js";
import {
  clerkAuthConfigFromEnv,
  createRequireAuth,
} from "./middleware/auth.js";
import { createErrorHandler, notFoundHandler } from "./middleware/error.js";
import { createRequestLogger, createRootLogger } from "./middleware/logger.js";
import { createDocumentRoutes } from "./modules/documents/routes.js";
import { createDocumentService } from "./modules/documents/service.js";
import { createEvaluationProjectRoutes } from "./modules/evaluation-projects/routes.js";
import { createEvaluationProjectService } from "./modules/evaluation-projects/service.js";
import { createLessonPlanRoutes } from "./modules/lesson-plans/routes.js";
import { createLessonPlanService } from "./modules/lesson-plans/service.js";
import { createProjectRoutes } from "./modules/projects/routes.js";
import { createProjectService } from "./modules/projects/service.js";
import { createResourceRoutes } from "./modules/resources/routes.js";
import { createResourceService } from "./modules/resources/service.js";
import type { QueueProducer } from "./queue/producer.js";

export const API_PREFIX = "/api/v1";

export type CreateAppOptions = {
  env: Env;
  database: DatabaseHandle;
  queue: QueueProducer;
};

const startedAt = Date.now();

export const createApp = ({ env, database, queue }: CreateAppOptions) => {
  const logger = createRootLogger(env);
  const validateResponse = createResponseValidator(
    shouldValidateResponses(env),
  );

  const projects = createProjectService(database.db);
  const evaluationProjects = createEvaluationProjectService(database.db);
  const lessonPlans = createLessonPlanService(database.db, projects);
  const documents = createDocumentService({
    db: database.db,
    projects,
    lessonPlans,
    queue,
  });
  const resources = createResourceService(database.db);

  const app = new Hono<AppEnv>();

  app.onError(createErrorHandler(logger));
  app.notFound(notFoundHandler);

  // First, so every downstream failure — including one raised inside CORS or
  // authentication — is already correlated by request id.
  app.use("*", createRequestLogger(logger));

  app.use(
    "*",
    cors({
      // An empty allow-list means same-origin only. `*` is never a default:
      // this API answers with a teacher's own materials.
      origin: env.CORS_ORIGINS,
      // `PUT` is here for `evaluation-projects` and only for it — see that
      // module's routes for why a paper is replaced whole at a client-chosen id
      // rather than created by POST. Omitting it is how a preflight silently
      // turns a working handler into a network error in the browser.
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Authorization", "Content-Type", "X-Request-Id"],
      exposeHeaders: ["X-Request-Id"],
      maxAge: env.CORS_MAX_AGE_SECONDS,
      credentials: false,
    }),
  );

  // Authentication for the entire API surface, mounted before the modules.
  app.use(`${API_PREFIX}/*`, createRequireAuth(clerkAuthConfigFromEnv(env)));

  const routes = app
    /** Liveness. Answers as long as the process can serve a request. */
    .get("/health", (c) =>
      c.json(
        ok(
          validateResponse(HealthResponse, {
            status: "ok",
            uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
          }),
        ),
        200,
      ),
    )

    /**
     * Readiness. Distinct from liveness on purpose: a process that cannot reach
     * Postgres should be taken out of the load balancer, not restarted.
     *
     * The envelope stays `ok: true` even at 503 — the probe answered
     * successfully, and what it reports is a degraded dependency. The HTTP
     * status is the signal an orchestrator reads; the body is for a human.
     */
    .get("/ready", async (c) => {
      const databaseStatus = (await database.ping()) ? "up" : "down";
      const body = validateResponse(ReadyResponse, {
        status: databaseStatus === "up" ? "ready" : "degraded",
        checks: { database: databaseStatus },
      });
      return c.json(ok(body), databaseStatus === "up" ? 200 : 503);
    })

    .route(
      `${API_PREFIX}/projects`,
      createProjectRoutes({ service: projects, validateResponse }),
    )
    .route(
      `${API_PREFIX}/evaluation-projects`,
      createEvaluationProjectRoutes({
        service: evaluationProjects,
        validateResponse,
      }),
    )
    .route(
      `${API_PREFIX}/lesson-plans`,
      createLessonPlanRoutes({
        service: lessonPlans,
        projects,
        validateResponse,
      }),
    )
    .route(
      `${API_PREFIX}/documents`,
      createDocumentRoutes({ service: documents, validateResponse }),
    )
    .route(
      `${API_PREFIX}/resources`,
      createResourceRoutes({ service: resources, validateResponse }),
    );

  return { app, routes, logger };
};

/**
 * The RPC contract consumed by `apps/web`:
 *
 * ```ts
 * import { hc } from "hono/client";
 * import type { AppType } from "@ludicon/api/app";
 *
 * const client = hc<AppType>(import.meta.env.VITE_API_URL);
 * ```
 */
export type AppType = ReturnType<typeof createApp>["routes"];
