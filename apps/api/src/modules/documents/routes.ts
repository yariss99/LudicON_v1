/**
 * Document HTTP surface.
 *
 * The literal `/generate/...` path is declared before `/:documentId` so the
 * parameter route never shadows it.
 */
import {
  CreateDocumentBody,
  DocumentListQuery,
  DocumentListResponse,
  DocumentParams,
  DocumentResponse,
  GenerateMaterialsBody,
  GenerateMaterialsResponse,
  ok,
  ProjectParams,
  PublishDocumentBody,
  UpdateDocumentBody,
} from "@ludicon/contracts";
import { Hono } from "hono";

import { type AppEnv, requireAuthContext } from "../../context.js";
import type { ResponseValidator } from "../../lib/response.js";
import { validate } from "../../lib/validate.js";
import type { DocumentService } from "./service.js";

export type DocumentRoutesDeps = {
  service: DocumentService;
  validateResponse: ResponseValidator;
};

export const createDocumentRoutes = ({
  service,
  validateResponse,
}: DocumentRoutesDeps) =>
  new Hono<AppEnv>()
    /**
     * Enqueue generation for an approved project.
     *
     * Answers 202: the work has been accepted, not done. The job id is what the
     * interface polls or subscribes to.
     */
    .post(
      "/generate/:projectId",
      validate("param", ProjectParams),
      validate("json", GenerateMaterialsBody),
      async (c) => {
        const auth = requireAuthContext(c.get("auth"));
        const result = await service.generate(
          auth,
          c.req.valid("param").projectId,
          c.req.valid("json").kinds,
          c.get("requestId"),
        );
        return c.json(
          ok(validateResponse(GenerateMaterialsResponse, result)),
          202,
        );
      },
    )

    .get("/", validate("query", DocumentListQuery), async (c) => {
      const auth = requireAuthContext(c.get("auth"));
      const page = await service.list(auth, c.req.valid("query"));
      return c.json(ok(validateResponse(DocumentListResponse, page)), 200);
    })

    .post("/", validate("json", CreateDocumentBody), async (c) => {
      const auth = requireAuthContext(c.get("auth"));
      const document = await service.create(auth, c.req.valid("json"));
      return c.json(ok(validateResponse(DocumentResponse, { document })), 201);
    })

    .get("/:documentId", validate("param", DocumentParams), async (c) => {
      const auth = requireAuthContext(c.get("auth"));
      const document = await service.get(auth, c.req.valid("param").documentId);
      return c.json(ok(validateResponse(DocumentResponse, { document })), 200);
    })

    .patch(
      "/:documentId",
      validate("param", DocumentParams),
      validate("json", UpdateDocumentBody),
      async (c) => {
        const auth = requireAuthContext(c.get("auth"));
        const document = await service.update(
          auth,
          c.req.valid("param").documentId,
          c.req.valid("json"),
        );
        return c.json(
          ok(validateResponse(DocumentResponse, { document })),
          200,
        );
      },
    )

    .post(
      "/:documentId/publish",
      validate("param", DocumentParams),
      validate("json", PublishDocumentBody),
      async (c) => {
        const auth = requireAuthContext(c.get("auth"));
        const document = await service.publish(
          auth,
          c.req.valid("param").documentId,
          c.req.valid("json"),
        );
        return c.json(
          ok(validateResponse(DocumentResponse, { document })),
          200,
        );
      },
    );
