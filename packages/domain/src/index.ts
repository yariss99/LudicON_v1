/**
 * @ludicon/domain — the single source of truth for domain shapes.
 *
 * Every schema here is a Zod schema with its TypeScript type inferred from it,
 * so runtime validation and compile-time types can never drift apart. The API,
 * the worker, the data layer and the UI all import from this one place.
 *
 * This package deliberately replaces a large amount of duplication in the
 * pre-refactor tree: eight identical actor unions, nine validation families,
 * seven version wrappers, five document envelopes, six asset taxonomies and
 * twenty-five status unions.
 */
export * from "./primitives/identifiers.js";
export * from "./primitives/shared.js";
export * from "./entities/document.js";
export * from "./entities/project.js";
export * from "./entities/lesson-plan.js";
export * from "./entities/resource.js";
