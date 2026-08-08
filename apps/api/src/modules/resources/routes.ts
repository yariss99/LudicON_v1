/**
 * Library HTTP surface. Read-only: resources are produced by generation and
 * publication, never by a direct POST.
 */
import {
  ok,
  ResourceListQuery,
  ResourceListResponse,
  ResourceParams,
  ResourceResponse,
  ResourceSearchQuery,
} from "@ludicon/contracts";
import { Hono } from "hono";

import { type AppEnv, requireAuthContext } from "../../context.js";
import type { ResponseValidator } from "../../lib/response.js";
import { validate } from "../../lib/validate.js";
import type { ResourceService } from "./service.js";

export type ResourceRoutesDeps = {
  service: ResourceService;
  validateResponse: ResponseValidator;
};

export const createResourceRoutes = ({
  service,
  validateResponse,
}: ResourceRoutesDeps) =>
  new Hono<AppEnv>()
    .get("/search", validate("query", ResourceSearchQuery), async (c) => {
      const auth = requireAuthContext(c.get("auth"));
      const page = await service.search(auth, c.req.valid("query"));
      return c.json(ok(validateResponse(ResourceListResponse, page)), 200);
    })

    .get("/", validate("query", ResourceListQuery), async (c) => {
      const auth = requireAuthContext(c.get("auth"));
      const page = await service.list(auth, c.req.valid("query"));
      return c.json(ok(validateResponse(ResourceListResponse, page)), 200);
    })

    .get("/:resourceId", validate("param", ResourceParams), async (c) => {
      const auth = requireAuthContext(c.get("auth"));
      const resource = await service.get(auth, c.req.valid("param").resourceId);
      return c.json(ok(validateResponse(ResourceResponse, { resource })), 200);
    });
