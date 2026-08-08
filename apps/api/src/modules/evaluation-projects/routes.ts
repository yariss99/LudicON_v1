/**
 * Evaluation paper HTTP surface.
 *
 * Routes validate, delegate and frame. No database access, no business rules.
 *
 * **`PUT`, and no `POST` or `PATCH`.** The other four modules are POST-create
 * plus PATCH-partial because the server assigns their ids and the client edits
 * their fields. A paper is the opposite on both counts: `createEvaluationProject`
 * mints the id in the browser, and the command layer replaces the whole document
 * on every edit rather than emitting a field diff. So `PUT /:id` — "insert or
 * replace at this id" — is not an emulation of the client's `DataProvider.put`,
 * it is the same operation with an HTTP verb whose defined semantics say so. A
 * POST would hand out a second identity the client cannot use, and a PATCH would
 * accept diffs nothing produces.
 *
 * The chain is unbroken on purpose — `hc<AppType>()` on the web side derives its
 * types from the value returned here, and splitting it into separate
 * `app.get(...)` statements would erase them.
 */
import {
  DeleteEvaluationProjectResponse,
  EvaluationProjectListQuery,
  EvaluationProjectListResponse,
  EvaluationProjectParams,
  EvaluationProjectResponse,
  ok,
  PutEvaluationProjectBody,
} from "@ludicon/contracts";
import { Hono } from "hono";

import { type AppEnv, requireAuthContext } from "../../context.js";
import type { ResponseValidator } from "../../lib/response.js";
import { validate } from "../../lib/validate.js";
import type { EvaluationProjectService } from "./service.js";

export type EvaluationProjectRoutesDeps = {
  service: EvaluationProjectService;
  validateResponse: ResponseValidator;
};

export const createEvaluationProjectRoutes = ({
  service,
  validateResponse,
}: EvaluationProjectRoutesDeps) =>
  new Hono<AppEnv>()
    .get("/", validate("query", EvaluationProjectListQuery), async (c) => {
      const auth = requireAuthContext(c.get("auth"));
      const page = await service.list(auth, c.req.valid("query"));
      return c.json(
        ok(validateResponse(EvaluationProjectListResponse, page)),
        200,
      );
    })

    .get(
      "/:evaluationProjectId",
      validate("param", EvaluationProjectParams),
      async (c) => {
        const auth = requireAuthContext(c.get("auth"));
        const evaluationProject = await service.get(
          auth,
          c.req.valid("param").evaluationProjectId,
        );
        return c.json(
          ok(
            validateResponse(EvaluationProjectResponse, { evaluationProject }),
          ),
          200,
        );
      },
    )

    /**
     * 201 on the write that created the row, 200 on every replace after it.
     *
     * Both are successes and the client treats them identically, so the status
     * is the only place the distinction survives — which is the whole reason the
     * service returns `created` rather than swallowing it. Answering 200 always
     * would make an idempotent PUT indistinguishable from a no-op in a log.
     */
    .put(
      "/:evaluationProjectId",
      validate("param", EvaluationProjectParams),
      validate("json", PutEvaluationProjectBody),
      async (c) => {
        const auth = requireAuthContext(c.get("auth"));
        const { evaluationProject, created } = await service.put(
          auth,
          c.req.valid("param").evaluationProjectId,
          c.req.valid("json"),
        );
        return c.json(
          ok(
            validateResponse(EvaluationProjectResponse, { evaluationProject }),
          ),
          created ? 201 : 200,
        );
      },
    )

    .delete(
      "/:evaluationProjectId",
      validate("param", EvaluationProjectParams),
      async (c) => {
        const auth = requireAuthContext(c.get("auth"));
        const { evaluationProjectId } = c.req.valid("param");
        await service.remove(auth, evaluationProjectId);
        return c.json(
          ok(
            validateResponse(DeleteEvaluationProjectResponse, {
              deleted: true,
              id: evaluationProjectId,
            }),
          ),
          200,
        );
      },
    );
