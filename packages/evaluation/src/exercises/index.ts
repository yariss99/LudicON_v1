/**
 * The exercise system, in the order a reader meets it.
 *
 * Machinery first, types last, and the split matters: everything above
 * `types/` is what a NEW exercise type is written against, and everything in
 * `types/` is written against it. A reader who wants to know what an exercise
 * IS reads `definition.ts`; a reader who wants to know what exercises EXIST
 * reads the barrel below it.
 *
 * `renderers.ts` is exported from here even though nothing in this package can
 * render anything — it types the app's half of the split generically, so the
 * seam is checked from the side that owns the contract without this package
 * ever naming React. See its own docblock for why the alternative, a
 * `component` field on the definition, was rejected.
 */
export * from "./definition.js";
export * from "./registry.js";
export * from "./renderers.js";
export * from "./layouts.js";
export * from "./markers.js";
export * from "./scoring.js";
export * from "./checks.js";
export * from "./types/index.js";
