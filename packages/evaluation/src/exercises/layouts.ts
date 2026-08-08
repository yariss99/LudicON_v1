import type {
  AnyExerciseDefinition,
  ExerciseLayoutOption,
} from "./definition.js";

/**
 * The five shapes an exercise may take on the page, named ONCE for every type.
 *
 * A layout id is a contract between two packages that never import each other:
 * a definition here says it supports `"two-column"`, and a renderer in the app
 * draws two columns when it sees that string. If each type invented its own
 * vocabulary — `"twoCol"`, `"double"`, `"columns2"` — the app would need a
 * per-type translation table, which is exactly the "one new directory, zero
 * existing files" property this design exists to keep. A shared, closed set of
 * ids means a new type picks from what the renderers already know how to draw.
 *
 * Labels are Romanian and live here rather than in the app's `copy.ts` for the
 * same reason exercise names do: a layout the teacher chooses is part of what
 * the type IS, and moving its name into a shared string table would make adding
 * a type edit a file in another package.
 *
 * `minSpan` and `estimatedHeightMm` exist for the paginator, not for CSS. The
 * PDF worker decides where page two starts before any DOM exists, so it needs a
 * rough height per exercise and a floor on how narrow a column may get before
 * the layout stops being readable. The rejected alternative was measuring in the
 * browser and storing the result, which would make the same document paginate
 * differently depending on which machine last opened it.
 */

export const EXERCISE_LAYOUT_IDS = [
  "standard",
  "compact",
  "two-column",
  "grid",
  "card",
] as const;

export type ExerciseLayoutId = (typeof EXERCISE_LAYOUT_IDS)[number];

interface LayoutShape {
  readonly label: string;
  /** Grid units out of 12 below which this layout stops being readable. */
  readonly minSpan: number;
}

/**
 * `standard` first, and every type must offer it.
 *
 * It is the layout that always works: one thing under another, full measure.
 * A type whose only layout were `two-column` would be unusable in the third
 * column of a four-column row, and the teacher would have no way to tell why.
 */
const LAYOUT_SHAPE: Readonly<Record<ExerciseLayoutId, LayoutShape>> =
  Object.freeze({
    standard: { label: "Obișnuit", minSpan: 4 },
    compact: { label: "Strâns", minSpan: 3 },
    "two-column": { label: "Pe două coloane", minSpan: 6 },
    grid: { label: "În grilă", minSpan: 6 },
    card: { label: "În casetă", minSpan: 5 },
  });

export const EXERCISE_LAYOUT_LABEL: Readonly<Record<ExerciseLayoutId, string>> =
  Object.freeze(
    Object.fromEntries(
      EXERCISE_LAYOUT_IDS.map((id) => [id, LAYOUT_SHAPE[id].label]),
    ) as Record<ExerciseLayoutId, string>,
  );

/**
 * One layout option, with the height this particular type takes in it.
 *
 * The height is a per-type argument rather than a property of the layout
 * because "compact" costs eight millimetres for a true/false pair and thirty
 * for a reading passage. A single number per layout would have made the
 * paginator wrong for every type but one.
 */
export const exerciseLayout = (
  id: ExerciseLayoutId,
  estimatedHeightMm: number,
): ExerciseLayoutOption => ({
  id,
  label: LAYOUT_SHAPE[id].label,
  minSpan: LAYOUT_SHAPE[id].minSpan,
  estimatedHeightMm,
});

/**
 * Which layout a block is actually drawn in.
 *
 * A block stores `layoutId: null` to mean "whatever this type leads with", and
 * it may also store an id the type has since stopped supporting — a document
 * outlives any one version of a registry. Both fall back to the first declared
 * layout rather than throwing, because a paper that fails to open is a worse
 * outcome than a paper that opens in the wrong shape.
 */
export const resolveExerciseLayout = (
  definition: AnyExerciseDefinition,
  layoutId: string | null,
): ExerciseLayoutOption | undefined =>
  definition.layouts.find((layout) => layout.id === layoutId) ??
  definition.layouts[0];

export const isExerciseLayoutId = (value: string): value is ExerciseLayoutId =>
  (EXERCISE_LAYOUT_IDS as readonly string[]).includes(value);
