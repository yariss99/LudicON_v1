import type { ExerciseRegistry } from "@ludicon/evaluation";

import { EXERCISE_REGISTRY } from "../exercises/registry";

/**
 * The one place the output half asks "which exercise types exist?".
 *
 * Everything downstream — the checklist, the barem rows, the printed barem —
 * takes an `ExerciseRegistry` as an argument and iterates it. None of them
 * names an exercise type, and none of them can: `ExerciseBlock.config` is
 * `unknown` in the document model and only the registry entry knows its shape.
 * That is the property being protected here, and it is why the registry is
 * threaded through as a value rather than imported at each use site.
 *
 * A MODULE-LEVEL SINGLETON was the rejected alternative, and
 * `packages/evaluation/src/exercises/registry.ts` argues the case in full:
 * `validateProject(document, registry)` is expected to give the same answer for
 * the same two arguments, which is what lets the browser and the server agree
 * about whether a paper may be printed. A registry that can gain an entry
 * between two calls makes that false, and the failure looks like a paper that
 * passed the checklist in the editor and was refused on the server.
 *
 * ## Why the app's registry is reached through a function at all
 *
 * `features/evaluation/exercises/registry.ts` builds `EXERCISE_REGISTRY` from a
 * build-time glob over the exercise-type directories, and this slice does not
 * own that file. A one-function seam means the output half names it exactly
 * once: if the exercises module moves, is renamed, or grows a way of choosing
 * between several registries, one line here changes rather than every screen
 * that shows a barem or a checklist.
 *
 * The value is returned rather than exported directly so the seam stays a seam.
 * A re-export would read as this module owning the registry, and the next
 * person needing "the registry, but only the types for this discipline" would
 * add a second export beside it instead of a parameter here.
 */
export const outputExerciseRegistry = (): ExerciseRegistry => EXERCISE_REGISTRY;
