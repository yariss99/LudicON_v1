import type { ValidationIssue } from "@ludicon/domain";

/**
 * The half-dozen things that are wrong with an exercise, phrased once.
 *
 * Fourteen types share about six failures — too few options, an option left
 * blank, two options that are the same, a barem pointing at something that is
 * no longer there — and if each type wrote its own sentence the teacher would
 * read six ways of saying "you left one empty" while working down one paper.
 * These are the sentences.
 *
 * The codes are namespaced `evaluation.exercise.*` and live HERE rather than in
 * `../validation/codes.ts`. That file is the document validator's: it names
 * problems with the paper as a whole — a dangling id, a missing title — and a
 * new exercise type must never require editing it. A type ships as one
 * directory or the abstraction has failed, and a shared code table three
 * packages deep is the first thing that would break that.
 *
 * The rejected alternative was returning bare strings and letting the app
 * phrase them. `@ludicon/domain`'s `ValidationIssue` already carries the code,
 * the severity and the remedy, and the whole point of that type is that the
 * teacher sees one list of problems across the product — an exercise that
 * emitted a different shape would have to be translated at exactly the moment
 * its issues joined that list.
 */

export const EXERCISE_ISSUE_CODE = Object.freeze({
  tooFewItems: "evaluation.exercise.too_few_items",
  blankItem: "evaluation.exercise.blank_item",
  duplicateItems: "evaluation.exercise.duplicate_items",
  textMissing: "evaluation.exercise.text_missing",
  answerOutOfRange: "evaluation.exercise.answer_out_of_range",
  answerCountMismatch: "evaluation.exercise.answer_count_mismatch",
  answerEmpty: "evaluation.exercise.answer_empty",
});

/**
 * The two forms Romanian needs to build a sentence about a list.
 *
 * "două dintre variante sunt la fel" and "varianta de pe locul 3 nu are text"
 * cannot be produced from one noun, and a generic word — "elementul" — is both
 * jargon and wrong: a teacher writing a matching exercise has pairs, not
 * elements. Each type names its own parts.
 */
export interface ItemNoun {
  /** Definite singular, as it appears mid-sentence: "varianta", "rândul". */
  readonly one: string;
  /** Bare plural, as it appears after a number: "variante", "rânduri". */
  readonly many: string;
}

const issue = (
  code: string,
  severity: ValidationIssue["severity"],
  message: string,
  remedy: string,
): ValidationIssue => ({ code, severity, message, remedy });

/**
 * Not enough parts to be a question at all.
 *
 * Two sentences, because Romanian will not let one serve.
 * „are nevoie de cel puțin 1 întrebări" is what a single template produces for
 * a type whose minimum is one, and it is wrong in both directions at once — the
 * numeral wants a singular, the noun is plural, and the noun's gender is not
 * knowable from `ItemNoun` without a third form every type would have to
 * supply. A minimum of one is also a different statement: it does not mean "too
 * few", it means there are none.
 *
 * The other branch is safe by construction. It runs only when the minimum is
 * two or more, so the numeral and the plural always agree, and the remedy
 * counts rather than naming — "Ai 1. Mai scrie până ajungi la 3." — which needs
 * no gender at all.
 */
export const tooFewItems = (
  name: string,
  noun: ItemNoun,
  present: number,
  least: number,
): ValidationIssue =>
  least <= 1
    ? issue(
        EXERCISE_ISSUE_CODE.tooFewItems,
        "blocking",
        `„${name}” nu are încă ${noun.many}.`,
        `Scrie ${noun.many} în panoul din dreapta.`,
      )
    : issue(
        EXERCISE_ISSUE_CODE.tooFewItems,
        "blocking",
        `„${name}” are nevoie de cel puțin ${least} ${noun.many}.`,
        `Ai ${present}. Mai scrie până ajungi la ${least}.`,
      );

/** One of the parts prints as an empty line on the pupil's paper. */
export const blankItem = (
  name: string,
  noun: ItemNoun,
  position: number,
): ValidationIssue =>
  issue(
    EXERCISE_ISSUE_CODE.blankItem,
    "blocking",
    `La „${name}”, ${noun.one} de pe locul ${position} nu are text.`,
    "Scrie-l sau scoate-l, ca să nu rămână un rând gol pe foaie.",
  );

/**
 * The first blank part, or nothing.
 *
 * Returns at most one issue rather than one per blank: a teacher who has just
 * added four empty options does not need four sentences telling them so, and
 * fixing the first is what makes the next one visible anyway.
 */
export const firstBlankItem = (
  name: string,
  noun: ItemNoun,
  items: readonly string[],
): ValidationIssue[] => {
  const index = items.findIndex((item) => item.trim() === "");
  return index < 0 ? [] : [blankItem(name, noun, index + 1)];
};

/**
 * Two parts a pupil cannot tell apart.
 *
 * A warning, not blocking. Two identical options are usually a slip, but a
 * teacher may genuinely repeat a word in an ordering exercise, and the product
 * does not get to refuse to print a paper over a judgement call.
 */
export const duplicateItems = (
  name: string,
  noun: ItemNoun,
  items: readonly string[],
): ValidationIssue[] => {
  const seen = new Set<string>();
  for (const item of items) {
    const key = item.trim().toLowerCase();
    if (key === "") continue;
    if (seen.has(key)) {
      return [
        issue(
          EXERCISE_ISSUE_CODE.duplicateItems,
          "warning",
          `La „${name}”, două dintre ${noun.many} sunt la fel.`,
          "Schimbă una dintre ele, altfel elevii nu au cum să le deosebească.",
        ),
      ];
    }
    seen.add(key);
  }
  return [];
};

/** A field the exercise cannot be printed without. */
export const textMissing = (
  name: string,
  what: string,
  remedy: string,
): ValidationIssue =>
  issue(
    EXERCISE_ISSUE_CODE.textMissing,
    "blocking",
    `„${name}” nu are încă ${what}.`,
    remedy,
  );

/** The barem names a position the exercise no longer has. */
export const answerOutOfRange = (
  name: string,
  noun: ItemNoun,
): ValidationIssue =>
  issue(
    EXERCISE_ISSUE_CODE.answerOutOfRange,
    "error",
    `Baremul pentru „${name}” arată către ${noun.one} care nu mai există.`,
    "Alege din nou răspunsul corect.",
  );

/** The barem has fewer answers than the exercise has questions, or more. */
export const answerCountMismatch = (
  name: string,
  noun: ItemNoun,
): ValidationIssue =>
  issue(
    EXERCISE_ISSUE_CODE.answerCountMismatch,
    "error",
    `Baremul pentru „${name}” nu are câte un răspuns pentru fiecare dintre ${noun.many}.`,
    "Completează răspunsurile care lipsesc din barem.",
  );

/** Nothing at all was marked as the right answer. */
export const answerEmpty = (name: string, remedy: string): ValidationIssue =>
  issue(
    EXERCISE_ISSUE_CODE.answerEmpty,
    "blocking",
    `„${name}” nu are încă un răspuns corect în barem.`,
    remedy,
  );
