import type { Discipline, GradeLevel, ValidationIssue } from "@ludicon/domain";
import type { z } from "zod";

/**
 * What an exercise type IS, with no reference to how it looks.
 *
 * There are no components on this interface, and that is the whole design. This
 * package is DOM-free by construction — it runs in the API, in the PDF worker,
 * and in a test with no renderer — so a `component: ComponentType<Props>` field
 * would drag React into every one of those and make the model unusable in the
 * places that need it most.
 *
 * The split is by KEY, not by inheritance. A definition and a renderer are two
 * records that happen to share a `type` string, registered in two registries
 * that live in two packages: this one owns the data (schemas, defaults, scoring),
 * and the app owns the pixels. `../exercises/renderers.ts` types the app's half
 * generically so the seam is checked without either side naming the other's
 * framework.
 *
 * `validate` and `score` are declared as METHODS rather than arrow properties.
 * TypeScript makes method parameters bivariant, which is what lets a
 * `MultipleChoiceDefinition` sit in a `Record<string, AnyExerciseDefinition>`
 * without a cast at every call site. The trade is real — a caller could hand
 * `validate` a config of the wrong shape — and it is why `configSchema` exists
 * and why `validateProject` parses before it validates.
 */

export const EXERCISE_CATEGORIES = [
  "comprehension",
  "vocabulary",
  "grammar",
  "computation",
  "problem_solving",
  "matching",
  "ordering",
  "creative",
  "observation",
] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const EXERCISE_CATEGORY_LABEL: Readonly<
  Record<ExerciseCategory, string>
> = Object.freeze({
  comprehension: "Înțelegerea textului",
  vocabulary: "Vocabular",
  grammar: "Gramatică",
  computation: "Calcul",
  problem_solving: "Rezolvare de probleme",
  matching: "Asociere",
  ordering: "Ordonare",
  creative: "Creativitate",
  observation: "Observare",
});

export interface ExerciseLabels {
  /** Teacher-facing Romanian name, shown in the exercise palette. */
  readonly name: string;
  /** One sentence: what a pupil is asked to do. */
  readonly description: string;
  /**
   * Extra search terms, including the ones teachers actually type — synonyms,
   * regional wording, and the diacritic-free spellings people use in a hurry.
   */
  readonly keywords: readonly string[];
}

/**
 * A way of laying the exercise out on the page.
 *
 * `estimatedHeightMm` is what makes pagination possible before the DOM exists:
 * the PDF worker has to decide where page two starts without a layout engine,
 * and a rough millimetre estimate per exercise is enough to place the break and
 * let the browser refine it.
 */
export interface ExerciseLayoutOption {
  readonly id: string;
  readonly label: string;
  /** Minimum grid units (out of 12) this layout needs to stay readable. */
  readonly minSpan: number;
  readonly estimatedHeightMm: number;
}

/**
 * A mark, OUT OF ONE.
 *
 * `score` below is not given the points, and that is the design: points live on
 * the block and on the barem entry, because the same question is worth two on
 * one paper and five on another. A definition returns the fraction it is
 * entitled to judge; `scaleScore` in `./scoring.ts` turns it into marks for
 * whoever is holding the `AnswerEntry`.
 */
export interface ExerciseScore {
  readonly earned: number;
  readonly max: number;
  readonly correct: boolean;
}

export interface ExerciseDefinition<Config = unknown, Answer = unknown> {
  /** Stable, stored in every `ExerciseBlock`. Renaming one breaks documents. */
  readonly type: string;
  readonly category: ExerciseCategory;
  readonly labels: ExerciseLabels;
  /** Absent means "suits any discipline", not "suits none". */
  readonly disciplines?: readonly Discipline[];
  readonly grades?: readonly GradeLevel[];
  readonly configSchema: z.ZodType<Config>;
  readonly answerSchema: z.ZodType<Answer>;
  /** The config a freshly dropped block starts from. */
  readonly defaults: Config;
  readonly layouts: readonly ExerciseLayoutOption[];

  /**
   * Pedagogical checks the schema cannot express — "four options but three are
   * blank", "the correct answer is not among the choices". Returns Romanian
   * `ValidationIssue`s from `@ludicon/domain`, the same shape every other
   * validator in the product returns.
   */
  validate(config: Config): ValidationIssue[];

  /**
   * Cross-checks the barem against the exercise it belongs to.
   *
   * `validate` sees only the config and `answerSchema` sees only the answer, so
   * neither can catch the one mistake that actually costs a class its marks: a
   * barem naming option four of an exercise that now has three, or holding two
   * answers for a three-blank sentence. Only a function holding both can, and
   * it has to be its own member because the two halves are stored in two places
   * — the block and `document.answerKey` — precisely so an exercise can be
   * moved between pages without its answer following it around.
   *
   * OPTIONAL, so a type that has nothing to cross-check writes nothing, and so
   * adding this did not invalidate any definition that already existed.
   */
  validateAnswer?(config: Config, answer: Answer): ValidationIssue[];

  /**
   * The barem row, in words a teacher reads.
   *
   * REQUIRED, and the one member here that exists for a printed artefact rather
   * than for the model. A stored answer is frequently a POSITION rather than a
   * value — `single-choice` holds `{ correct: 1 }`, meaning the second option —
   * and nothing generic can turn that into "b) Bucureşti", because only this
   * definition knows the number indexes the config. A marking sheet printing
   * "Răspunsul corect: 1" is worse than no marking sheet: it is confidently
   * wrong, and it is wrong in a way a teacher checks against the paper and
   * believes.
   *
   * Not optional, and not duck-typed by whoever prints the barem, because a
   * type that cannot describe its own answer is a type whose barem is broken —
   * that must fail at the compiler, not on a photocopier.
   */
  describeAnswer(config: Config, answer: Answer): string;

  /**
   * Marks one response against the barem answer.
   *
   * Present even though the current product prints on paper: the barem already
   * encodes what "correct" means, and putting scoring anywhere else would mean
   * writing that rule twice the day responses are captured digitally.
   */
  score(config: Config, key: Answer, response: unknown): ExerciseScore;
}

/**
 * The erased form, for storage and iteration.
 *
 * `unknown` rather than `any`: a caller that pulls a definition out of the
 * registry gets a config it must parse before using, which is the correct
 * amount of ceremony for a value whose shape was only known to whoever
 * registered it.
 */
export type AnyExerciseDefinition = ExerciseDefinition<unknown, unknown>;
