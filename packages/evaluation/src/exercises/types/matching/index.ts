import { z } from "zod";
import type { ValidationIssue } from "@ludicon/domain";
import {
  answerCountMismatch,
  answerOutOfRange,
  duplicateItems,
  firstBlankItem,
  tooFewItems,
  type ItemNoun,
} from "../../checks.js";
import type { ExerciseDefinition } from "../../definition.js";
import { exerciseLayout } from "../../layouts.js";
import { describeOption, positionMarker } from "../../markers.js";
import {
  countMatching,
  countOf,
  numbersFrom,
  proportional,
  unanswered,
} from "../../scoring.js";

/**
 * Potrivire pe coloane — two lists, and a line drawn between them by hand.
 *
 * ## The config is two INDEPENDENT lists
 *
 * The tempting shape is one list of pairs: `items: { left, right }[]`, which
 * reads beautifully and puts the answer in the config. Every printed paper
 * would then be one careless `.map` away from showing the pupil which right
 * item belongs to which left one, and the exercise would have to be scrambled
 * at print time to be usable at all — meaning the same document prints
 * differently on two afternoons. So the two columns are two plain arrays that
 * know nothing about each other, and the pairing lives in `document.answerKey`
 * where the pupil's copy cannot reach it.
 *
 * ## `pairs` is indexed by the LEFT item
 *
 * `pairs[i]` is the position in `right` that the i-th left item belongs to.
 * A list of `[left, right]` tuples would carry the same information and would
 * make three ordinary questions hard: has every left item been answered, has
 * one been answered twice, and which right item does row four point at. As a
 * fixed-length array those are a length check, a `Set` and an index — and the
 * panel becomes one small picker per row, which is what a teacher filling a
 * barem down the page is doing anyway.
 *
 * A right item may legitimately be used by two left items — "substantiv" can be
 * the answer for two words — so duplicates in `pairs` are not an error, and
 * `validateAnswer` deliberately does not look for them. `ordering` next door
 * does, because there a repeat means a place with no item.
 *
 * ## Why the schema is looser than the checks
 *
 * The schema allows nought entries per column; `validate` is what says two a
 * side is the fewest that makes a question. A schema that demanded two would
 * make a freshly dropped exercise fail to parse, and a parse failure reaches
 * the teacher as "nu este completat corect" — true, vague and no help. Kept
 * apart, the same half-written exercise says which column is short.
 */

const NAME = "Potrivire pe coloane";
const LEFT_NOUN: ItemNoun = {
  one: "elementul din stânga",
  many: "elemente în stânga",
};
const RIGHT_NOUN: ItemNoun = {
  one: "elementul din dreapta",
  many: "elemente în dreapta",
};
const PAIR_NOUN: ItemNoun = { one: "perechea", many: "perechi" };
const LEAST_ITEMS = 2;

export const MatchingConfig = z.object({
  left: z.array(z.string().max(200)).max(10).default([]),
  right: z.array(z.string().max(200)).max(10).default([]),
});
export type MatchingConfig = z.infer<typeof MatchingConfig>;

export const MatchingAnswer = z.object({
  /** For each left item, the position in `right` it pairs with. */
  pairs: z.array(z.number().int().min(0).max(9)).max(10),
});
export type MatchingAnswer = z.infer<typeof MatchingAnswer>;

export const matchingExercise: ExerciseDefinition<
  MatchingConfig,
  MatchingAnswer
> = {
  type: "matching",
  category: "matching",

  labels: {
    name: NAME,
    description:
      "Elevul unește printr-o linie fiecare element din stânga cu perechea lui.",
    keywords: [
      "potrivire",
      "uneste",
      "coloane",
      "asociere",
      "sageti",
      "leaga",
      "corespondenta",
    ],
  },

  configSchema: MatchingConfig,
  answerSchema: MatchingAnswer,

  /** Three empty rows a side — enough to see the shape, nothing to delete. */
  defaults: { left: ["", "", ""], right: ["", "", ""] },

  layouts: [
    exerciseLayout("standard", 34),
    exerciseLayout("two-column", 34),
    exerciseLayout("card", 40),
  ],

  validate(config) {
    const issues: ValidationIssue[] = [];

    if (config.left.length < LEAST_ITEMS) {
      issues.push(
        tooFewItems(NAME, LEFT_NOUN, config.left.length, LEAST_ITEMS),
      );
    }
    if (config.right.length < LEAST_ITEMS) {
      issues.push(
        tooFewItems(NAME, RIGHT_NOUN, config.right.length, LEAST_ITEMS),
      );
    }

    issues.push(...firstBlankItem(NAME, LEFT_NOUN, config.left));
    issues.push(...firstBlankItem(NAME, RIGHT_NOUN, config.right));
    issues.push(...duplicateItems(NAME, LEFT_NOUN, config.left));
    issues.push(...duplicateItems(NAME, RIGHT_NOUN, config.right));
    return issues;
  },

  validateAnswer(config, answer) {
    const issues: ValidationIssue[] = [];

    if (answer.pairs.length !== config.left.length) {
      issues.push(answerCountMismatch(NAME, PAIR_NOUN));
    }
    if (answer.pairs.some((pair) => pair >= config.right.length)) {
      issues.push(answerOutOfRange(NAME, RIGHT_NOUN));
    }

    return issues;
  },

  describeAnswer(config, answer) {
    return answer.pairs
      .map(
        (right, left) =>
          `${positionMarker(left)} → ${describeOption(config.right, right, "letters")}`,
      )
      .join("  ");
  },

  score(_config, key, response) {
    const drawn = numbersFrom(response);
    if (drawn === null) return unanswered();

    return proportional(
      countMatching(key.pairs, drawn, (expected, given) => expected === given),
      countOf(key.pairs),
    );
  },
};
