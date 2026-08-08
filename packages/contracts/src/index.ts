/**
 * @ludicon/contracts — the wire between the browser and the server.
 *
 * Built on `@ludicon/domain`, never around it: entity shapes are imported, and
 * this package adds only the framing a transport needs — envelopes, filters,
 * pages, error codes and queue payloads.
 *
 * Both `apps/api` and `apps/web` depend on this package, so anything exported
 * here is, by construction, agreed by both sides.
 */
export * from "./errors.js";
export * from "./evaluation.js";
export * from "./http.js";
export * from "./queue.js";
