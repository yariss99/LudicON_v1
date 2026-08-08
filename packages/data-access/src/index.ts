/**
 * @ludicon/data-access
 *
 * The boundary between the UI and wherever data actually lives.
 *
 *   UI -> TanStack Query -> repositories -> DataProvider -> localStorage | API
 *
 * Only the last hop changes when the backend arrives.
 */
export * from "./collections.js";
export * from "./api-surface.js";
export * from "./cascade.js";
export * from "./provider.js";
export * from "./migrations.js";
export * from "./local-storage-provider.js";
export * from "./http-provider.js";
export * from "./repository.js";
export * from "./query-keys.js";
export * from "./repositories.js";
