/**
 * Lesson design HTTP surface.
 *
 * `by-project` is declared before `/:lessonPlanId` so the literal segment is
 * never swallowed by the parameter.
 */
import {
  ApproveLessonPlanBody,
  ApproveLessonPlanResponse,
  LessonPlanParams,
  LessonPlanResponse,
  ok,
  ProjectParams,
  UpdateLessonPlanBody,
} from "@ludicon/contracts";
import { Hono } from "hono";

import { type AppEnv, requireAuthContext } from "../../context.js";
import type { ResponseValidator } from "../../lib/response.js";
import { validate } from "../../lib/validate.js";
import type { ProjectService } from "../projects/service.js";
import type { LessonPlanService } from "./service.js";

export type LessonPlanRoutesDeps = {
  service: LessonPlanService;
  projects: ProjectService;
  validateResponse: ResponseValidator;
};

export const createLessonPlanRoutes = ({
  service,
  projects,
  validateResponse,
}: LessonPlanRoutesDeps) =>
  new Hono<AppEnv>()
    .get(
      "/by-project/:projectId",
      validate("param", ProjectParams),
      async (c) => {
        const auth = requireAuthContext(c.get("auth"));
        const lessonPlan = await service.getForProject(
          auth,
          c.req.valid("param").projectId,
        );
        return c.json(
          ok(validateResponse(LessonPlanResponse, { lessonPlan })),
          200,
        );
      },
    )

    .get("/:lessonPlanId", validate("param", LessonPlanParams), async (c) => {
      const auth = requireAuthContext(c.get("auth"));
      const lessonPlan = await service.get(
        auth,
        c.req.valid("param").lessonPlanId,
      );
      return c.json(
        ok(validateResponse(LessonPlanResponse, { lessonPlan })),
        200,
      );
    })

    .patch(
      "/:lessonPlanId",
      validate("param", LessonPlanParams),
      validate("json", UpdateLessonPlanBody),
      async (c) => {
        const auth = requireAuthContext(c.get("auth"));
        const lessonPlan = await service.update(
          auth,
          c.req.valid("param").lessonPlanId,
          c.req.valid("json"),
        );
        return c.json(
          ok(validateResponse(LessonPlanResponse, { lessonPlan })),
          200,
        );
      },
    )

    /**
     * The approval gate. A distinct endpoint rather than a PATCH field, so the
     * transition is explicit, auditable and impossible to trigger by accident
     * while editing something else.
     */
    .post(
      "/:lessonPlanId/approve",
      validate("param", LessonPlanParams),
      validate("json", ApproveLessonPlanBody),
      async (c) => {
        const auth = requireAuthContext(c.get("auth"));
        const result = await service.approve(
          auth,
          c.req.valid("param").lessonPlanId,
          c.req.valid("json"),
        );
        const project = await projects.get(auth, result.project.id);
        return c.json(
          ok(
            validateResponse(ApproveLessonPlanResponse, {
              lessonPlan: result.lessonPlan,
              project,
            }),
          ),
          200,
        );
      },
    );
