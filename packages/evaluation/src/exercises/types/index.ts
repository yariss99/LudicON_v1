/**
 * The fourteen types that were here before the export map, and nothing after.
 *
 * ## DO NOT ADD A LINE HERE FOR A NEW TYPE
 *
 * The rule the exercise system is built to keep is that adding a type touches
 * one new directory and nothing else, and this file used to be the single
 * exception: a module that no module imports is not in the program, so
 * SOMETHING had to name the new directory. That is now
 * `packages/evaluation/package.json`, which carries a wildcard subpath export:
 * the key `"./exercises/*"` mapped onto `./src/exercises/types/` plus the same
 * wildcard plus `/index.ts`. (Spelled out rather than pasted because the
 * literal pattern contains the sequence that ends a block comment.)
 *
 * So a type is reachable at `@ludicon/evaluation/exercises/<slug>` the moment
 * its directory exists — no manifest edit, no line here. The pattern was
 * verified against all three of this repo's resolvers before it was relied on,
 * because the package is source-exported with no build step and two of the
 * three are not Node: TypeScript under `moduleResolution: "bundler"` resolves
 * it with real types (a deliberate wrong-type assignment through the subpath
 * still errors); Vite resolves and transforms it to the `.ts` file; and `tsx`
 * runs it in the API.
 *
 * The three earlier ways out stay rejected, and the wildcard is why the first
 * two are no longer even tempting:
 *
 *  - `import.meta.glob` enumerates a directory and is what the app uses for its
 *    renderers. It is a Vite transform: this package compiles under `lib:
 *    ES2023` with no `vite/client` types and is imported by the API under tsx,
 *    where the call would survive to runtime as a syntax error.
 *  - Reading the directory with `node:fs` would work in the API and break the
 *    moment a browser bundle imported it — which is the one consumer that
 *    definitely does.
 *  - Naming every type in an `EXERCISE_DEFINITIONS` array here would be a
 *    second list beside the app's glob, and the first one to be forgotten.
 *
 * ## Why the fourteen lines are still here
 *
 * They are re-exports, not registrations. Fourteen app modules under
 * `apps/web/src/features/evaluation/exercises/types/` import their schemas and
 * definitions from the package ROOT — `import { singleChoiceExercise } from
 * "@ludicon/evaluation"` — and deleting this file would break every one of
 * them. Moving those fourteen imports onto the subpath and deleting this file
 * is the finishing move; it edits fifteen files in two other slices, so it is
 * reported rather than done here. Nothing is waiting on it: a type added today
 * costs zero existing files either way, which is the property that mattered.
 *
 * The names stay prefixed by type — `SingleChoiceConfig`, not `Config` — which
 * is what keeps fourteen `export *` from colliding. A bare `definition` export
 * per module, the rejected alternative, collides on the second one.
 */
export * from "./arithmetic/index.js";
export * from "./fill-in-the-blank/index.js";
export * from "./fractions/index.js";
export * from "./image-observation/index.js";
export * from "./long-answer/index.js";
export * from "./matching/index.js";
export * from "./multiple-choice/index.js";
export * from "./number-comparison/index.js";
export * from "./ordering/index.js";
export * from "./reading-comprehension/index.js";
export * from "./short-answer/index.js";
export * from "./single-choice/index.js";
export * from "./true-false/index.js";
export * from "./word-problem/index.js";
