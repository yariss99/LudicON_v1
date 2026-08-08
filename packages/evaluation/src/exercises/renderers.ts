import type { AnyExerciseDefinition } from "./definition.js";

/**
 * The app's half of the exercise split, typed here so the seam is checked from
 * the side that owns the contract — without this package ever naming React.
 *
 * `TComponent` is a bare type parameter. The app instantiates it with
 * `ComponentType<ExerciseRendererProps>`; the PDF worker instantiates it with
 * whatever it draws with; a test instantiates it with a string. This module
 * imports nothing from any framework and compiles under `lib: ES2023` with no
 * DOM types available, which is the property that lets `@ludicon/evaluation` be
 * imported by the API and the worker.
 *
 * The rejected alternative was `component` as a field on `ExerciseDefinition`.
 * It reads better at the registration site — one object per exercise type — and
 * it makes the document model depend on React, which means the worker that
 * renders a PDF and the endpoint that validates an upload both have to pull in
 * a UI framework to parse a schema. The one-string-key indirection is the price
 * of not doing that.
 *
 * The two registries are kept honest by `missingRenderers` below, which the app
 * should call once at start-up: a type registered as data with no renderer is a
 * blank rectangle on a printed paper, and that must fail loudly at boot rather
 * than quietly in a classroom.
 */

export interface ExerciseRendererRegistry<TComponent> {
  register(
    type: string,
    component: TComponent,
  ): ExerciseRendererRegistry<TComponent>;
  get(type: string): TComponent | undefined;
  has(type: string): boolean;
  types(): readonly string[];
}

const build = <TComponent>(
  components: ReadonlyMap<string, TComponent>,
): ExerciseRendererRegistry<TComponent> => ({
  register(type, component) {
    const next = new Map(components);
    next.set(type, component);
    return build(next);
  },

  get: (type) => components.get(type),

  has: (type) => components.has(type),

  types: () => [...components.keys()],
});

export const createExerciseRendererRegistry = <TComponent>(
  entries: Readonly<Record<string, TComponent>> = {},
): ExerciseRendererRegistry<TComponent> =>
  build(new Map(Object.entries(entries)));

/**
 * Exercise types that have data but nothing to draw them with.
 *
 * Returns the offending type names rather than a boolean so the start-up check
 * can say which ones — "one of your exercise types has no renderer" is not
 * something anybody can act on at 08:00 before a lesson.
 */
export const missingRenderers = <TComponent>(
  definitions: readonly AnyExerciseDefinition[],
  renderers: ExerciseRendererRegistry<TComponent>,
): readonly string[] =>
  definitions
    .map((definition) => definition.type)
    .filter((type) => !renderers.has(type));

/** The mirror check: a renderer for a type nothing registered as data. */
export const orphanRenderers = <TComponent>(
  definitions: readonly AnyExerciseDefinition[],
  renderers: ExerciseRendererRegistry<TComponent>,
): readonly string[] => {
  const known = new Set(definitions.map((definition) => definition.type));
  return renderers.types().filter((type) => !known.has(type));
};
