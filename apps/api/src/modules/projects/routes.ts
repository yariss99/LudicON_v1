/**
 * Project HTTP surface.
 *
 * Routes do three things and nothing else: validate the request against a
 * contract, hand the parsed input to the service, and frame the answer. No
 * database access, no business rules.
 *
 * The chain is unbroken on purpose — `hc<AppType>()` on the web side derives
 * its types from the value returned here, and breaking the chain into separate
 * `app.get(...)` statements would erase them.
 */
import {
  CreateProjectBody,
  DeleteProjectResponse,
  ok,
  ProjectListQuery,
  ProjectListResponse,
  ProjectParams,
  ProjectResponse,
  UpdateProjectBody,
} from "@ludicon/contracts";
import { Hono } from "hono";

import { type AppEnv, requireAuthContext } from "../../context.js";
import type { ResponseValidator } from "../../lib/response.js";
import { validate } from "../../lib/validate.js";
import type { ProjectService } from "./service.js";

export type ProjectRoutesDeps = {
  service: ProjectService;
  validateResponse: ResponseValidator;
};

export const createProjectRoutes = ({
  service,
  validateResponse,
}: ProjectRoutesDeps) =>
  new Hono<AppEnv>()
    .get("/", validate("query", ProjectListQuery), async (c) => {
      const auth = requireAuthContext(c.get("auth"));
      const page = await service.list(auth, c.req.valid("query"));
      return c.json(ok(validateResponse(ProjectListResponse, page)), 200);
    })

    .post("/", validate("json", CreateProjectBody), async (c) => {
      const auth = requireAuthContext(c.get("auth"));
      const project = await service.create(auth, c.req.valid("json"));
      return c.json(ok(validateResponse(ProjectResponse, { project })), 201);
    })

    .get("/:projectId", validate("param", ProjectParams), async (c) => {
      const auth = requireAuthContext(c.get("auth"));
      const project = await service.get(auth, c.req.valid("param").projectId);
      return c.json(ok(validateResponse(ProjectResponse, { project })), 200);
    })

    .patch(
      "/:projectId",
      validate("param", ProjectParams),
      validate("json", UpdateProjectBody),
      async (c) => {
        const auth = requireAuthContext(c.get("auth"));
        const project = await service.update(
          auth,
          c.req.valid("param").projectId,
          c.req.valid("json"),
        );
        return c.json(ok(validateResponse(ProjectResponse, { project })), 200);
      },
    )

    .delete("/:projectId", validate("param", ProjectParams), async (c) => {
      const auth = requireAuthContext(c.get("auth"));
      const { projectId } = c.req.valid("param");
      await service.remove(auth, projectId);
      return c.json(
        ok(
          validateResponse(DeleteProjectResponse, {
            deleted: true,
            id: projectId,
          }),
        ),
        200,
      );
    });
