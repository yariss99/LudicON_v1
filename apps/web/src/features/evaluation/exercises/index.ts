/**
 * The exercise system's surface, for the rest of the builder.
 *
 * Four exports, and each one is the ONLY way into what it names: the canvas
 * draws exercises through `ExerciseView`, the inspector edits them through
 * `ExerciseInspector`, the library places them through `addExercise`, and anything
 * that needs to know what types exist asks `EXERCISE_REGISTRY`.
 *
 * The renderer and field registries are deliberately absent. They are looked up
 * by `type` string, and a component that resolved its own renderer would be a
 * second place that knows how an exercise is drawn — which is exactly the
 * switch statement this design exists to not have.
 */
export { ExerciseView } from "./exercise-view";
export type { ExerciseViewProps } from "./exercise-view";

export { ExerciseInspector } from "./exercise-inspector";
export type { ExerciseInspectorProps } from "./exercise-inspector";

export { addExercise } from "./exercise-actions";

export { EXERCISE_REGISTRY, EXERCISE_DEFINITIONS } from "./registry";
