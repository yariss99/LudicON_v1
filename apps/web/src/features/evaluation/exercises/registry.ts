import {
  createExerciseRegistry,
  createExerciseRendererRegistry,
  type AnyExerciseDefinition,
  type ExerciseRegistry,
  type ExerciseRendererRegistry,
} from "@ludicon/evaluation";

import { type ExerciseModule } from "./exercise-module";

/**
 * Every exercise type, found rather than listed.
 *
 * `import.meta.glob` enumerates `./types/*` at build time, so adding a type is
 * adding a directory: there is no array here to append to and therefore no way
 * to write a type and forget to register it. That failure — a definition that
 * exists, compiles, and never appears in the palette — is silent, and it is the
 * one this file exists to make impossible.
 *
 * `eager` because the palette lists every type the moment the builder opens and
 * the canvas draws whichever ones the paper already holds. Lazy modules would
 * turn the library panel into a set of suspense boundaries and make the printed
 * page arrive in pieces, which is the opposite of what a preview is for. The
 * whole set is a few tens of kilobytes of schemas and small components.
 *
 * ## The glob is unchecked, so the shape is checked here
 *
 * Vite types `import.meta.glob<T>` by assertion — nothing verifies that a file
 * under `types/` actually exports what it promised. A module missing its `Body`
 * would reach the canvas as `undefined` and render an exercise as nothing at
 * all, on a paper about to be printed. So every module is checked once, at
 * load, and a bad one THROWS with its own path in the message. A white screen
 * during development is the correct outcome for a mistake that can only be
 * committed by a developer; the alternative is a blank rectangle discovered by
 * a teacher at 08:00.
 *
 * ## One glob for both registries, and what that trades away
 *
 * The definitions and the components come from the same modules, so
 * `missingRenderers` — the check `@ludicon/evaluation` provides for a type
 * registered as data with nothing to draw it — can no longer fire. It is not
 * that the check was dropped; the state it detects is unreachable.
 *
 * The failure it traded for is a definition in the package that nobody wrote a
 * module for here. That type is simply absent: it never appears in the palette,
 * so a developer meets it on the first press. And a stored paper naming it
 * cannot fail quietly either — `ExerciseView` says so on the canvas and
 * `validateProject` refuses to let the paper print at all. Both halves are
 * loud, and neither is a blank rectangle on a printed sheet.
 */

const modules = import.meta.glob<unknown>("./types/*/index.tsx", {
  eager: true,
});

const isExerciseModule = (value: unknown): value is ExerciseModule => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<ExerciseModule>;
  return (
    typeof candidate.definition === "object" &&
    candidate.definition !== null &&
    typeof candidate.definition.type === "string" &&
    typeof candidate.Body === "function" &&
    typeof candidate.Fields === "function"
  );
};

const loaded: readonly ExerciseModule[] = Object.entries(modules).map(
  ([path, value]) => {
    if (!isExerciseModule(value)) {
      throw new Error(
        `Modulul de exercițiu ${path} nu exportă definition, Body și Fields.`,
      );
    }
    return value;
  },
);

/**
 * Sorted by the teacher-facing name, folded for Romanian.
 *
 * The glob's own order is the file system's, which is alphabetical by SLUG —
 * so the palette would run "arithmetic, fill-in-the-blank, fractions…" and a
 * teacher scanning it would see "Calcul, Completează spațiile, Fracții" in an
 * order that is alphabetical in a language they are not reading. Sorting by the
 * label is sorting by the only thing on screen.
 */
const byName = (left: AnyExerciseDefinition, right: AnyExerciseDefinition) =>
  left.labels.name.localeCompare(right.labels.name, "ro");

const definitions: readonly AnyExerciseDefinition[] = loaded
  .map((entry) => entry.definition)
  .sort(byName);

/**
 * The registry the whole app validates and searches against.
 *
 * Built once at module scope and never mutated — `@ludicon/evaluation`'s
 * registry returns a new registry from `register` for exactly this reason:
 * `validateProject(document, registry)` has to give the same answer every time
 * it is asked, or a paper that passed in the editor can block on the server.
 */
export const EXERCISE_REGISTRY: ExerciseRegistry =
  createExerciseRegistry(definitions);

export const EXERCISE_BODIES: ExerciseRendererRegistry<ExerciseModule["Body"]> =
  createExerciseRendererRegistry(
    Object.fromEntries(
      loaded.map((entry) => [entry.definition.type, entry.Body]),
    ),
  );

export const EXERCISE_FIELDS: ExerciseRendererRegistry<
  ExerciseModule["Fields"]
> = createExerciseRendererRegistry(
  Object.fromEntries(
    loaded.map((entry) => [entry.definition.type, entry.Fields]),
  ),
);

/** Every type, in the order the palette shows them. */
export const EXERCISE_DEFINITIONS = definitions;
