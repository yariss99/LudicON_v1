import {
  DISCIPLINE_LABEL,
  GRADE_LEVEL_LABEL,
  type Discipline,
  type GradeLevel,
} from "@ludicon/domain";
import type {
  AnyExerciseDefinition,
  ExerciseCategory,
  ExerciseDefinition,
} from "./definition.js";

/**
 * The registry is IMMUTABLE: `register` returns a new registry rather than
 * adding to this one.
 *
 * A mutable singleton is the usual shape and it breaks the property this
 * package depends on. `validateProject(document, registry)` is expected to give
 * the same answer for the same two arguments — that is what lets a validation
 * result be cached, compared between the editor and the server, or asserted in
 * a test. A registry that can gain an exercise type between two calls makes
 * that false, and the failure is a paper that validated clean in the browser
 * and blocking on the server.
 *
 * The cost is one object allocation per registration, all of which happen once
 * at start-up.
 */

export interface ExerciseQuery {
  /**
   * Free text, matched against the name, the description and the keywords.
   * Diacritics are folded, so "intelegere" finds "Înțelegerea textului" — which
   * is what a teacher typing quickly on a laptop keyboard actually enters.
   */
  readonly text?: string;
  readonly discipline?: Discipline;
  readonly grade?: GradeLevel;
  readonly category?: ExerciseCategory;
}

export interface ExerciseRegistry {
  register<Config, Answer>(
    definition: ExerciseDefinition<Config, Answer>,
  ): ExerciseRegistry;
  get(type: string): AnyExerciseDefinition | undefined;
  has(type: string): boolean;
  list(): readonly AnyExerciseDefinition[];
  search(query: ExerciseQuery): readonly AnyExerciseDefinition[];
}

/**
 * Folds diacritics and case so search compares like with like.
 *
 * `String.normalize("NFD")` splits ă into a + combining breve, and the range
 * strips the combining marks. Romanian ș and ț decompose the same way, so
 * "propozitie" matches "propoziție" without a hand-written substitution table
 * that would have to grow every time a new letter shows up.
 */
const fold = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * The discipline and the class a type declares are SEARCHABLE TEXT, not only
 * filters.
 *
 * A teacher looking for something to put on a maths paper types "matematica",
 * not "fractii" — they are looking for the shelf, not the item. Both the id and
 * the Romanian label go into the haystack: the label is what they read, the id
 * is what they type when the diacritics are too much bother, and folding makes
 * the two meet anyway.
 *
 * This is deliberately additive. `query.discipline` and `query.grade` still
 * narrow the list when a caller passes them, and a type that declares nothing
 * still matches everything — so widening the haystack can only ever find MORE,
 * never hide a type from someone who typed its name.
 */
const facetText = (definition: AnyExerciseDefinition): string[] => [
  ...(definition.disciplines ?? []).flatMap((discipline) => [
    discipline,
    DISCIPLINE_LABEL[discipline],
  ]),
  ...(definition.grades ?? []).flatMap((grade) => [
    grade,
    GRADE_LEVEL_LABEL[grade],
  ]),
];

const matchesText = (
  definition: AnyExerciseDefinition,
  needle: string,
): boolean => {
  const haystack = [
    definition.labels.name,
    definition.labels.description,
    definition.type,
    ...definition.labels.keywords,
    ...facetText(definition),
  ]
    .map(fold)
    .join(" ");

  return fold(needle)
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .every((term) => haystack.includes(term));
};

/**
 * An absent `disciplines` or `grades` means "no restriction".
 *
 * The opposite reading — absent means "nothing matches" — would make every
 * definition that forgot to declare them invisible in search, which is a bug
 * that presents as "my exercise type disappeared" and is very hard to trace
 * back to a missing optional field.
 */
const matchesDiscipline = (
  definition: AnyExerciseDefinition,
  discipline: Discipline,
): boolean =>
  definition.disciplines === undefined ||
  definition.disciplines.includes(discipline);

const matchesGrade = (
  definition: AnyExerciseDefinition,
  grade: GradeLevel,
): boolean =>
  definition.grades === undefined || definition.grades.includes(grade);

const build = (
  definitions: ReadonlyMap<string, AnyExerciseDefinition>,
): ExerciseRegistry => ({
  register(definition) {
    const next = new Map(definitions);
    next.set(definition.type, definition as AnyExerciseDefinition);
    return build(next);
  },

  get: (type) => definitions.get(type),

  has: (type) => definitions.has(type),

  list: () => [...definitions.values()],

  search: (query) =>
    [...definitions.values()].filter((definition) => {
      if (query.category && definition.category !== query.category)
        return false;
      if (
        query.discipline &&
        !matchesDiscipline(definition, query.discipline)
      ) {
        return false;
      }
      if (query.grade && !matchesGrade(definition, query.grade)) return false;
      if (query.text && !matchesText(definition, query.text)) return false;
      return true;
    }),
});

/**
 * A registry, optionally seeded.
 *
 * Seeding exists so the common case — a module that knows all its definitions —
 * is one call rather than a chain of `register`s whose intermediate registries
 * nobody wanted.
 */
export const createExerciseRegistry = (
  definitions: readonly AnyExerciseDefinition[] = [],
): ExerciseRegistry =>
  build(
    new Map(definitions.map((definition) => [definition.type, definition])),
  );

/** The empty registry, for callers that only need a validator to run. */
export const EMPTY_EXERCISE_REGISTRY: ExerciseRegistry =
  createExerciseRegistry();
