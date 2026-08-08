import { z } from "zod";
import type { ValidationIssue } from "@ludicon/domain";
import {
  answerCountMismatch,
  answerEmpty,
  firstBlankItem,
  tooFewItems,
  type ItemNoun,
} from "../../checks.js";
import type { ExerciseDefinition } from "../../definition.js";
import { exerciseLayout } from "../../layouts.js";
import { positionMarker } from "../../markers.js";
import {
  countMatching,
  countOf,
  foldAnswerText,
  numberFrom,
  proportional,
  stringFrom,
  stringsFrom,
  unanswered,
} from "../../scoring.js";

/**
 * Calcul: a column of sums, and a box beside each one for the result.
 *
 * ## A problem is the line the teacher typed, never a parsed sum
 *
 * `problems` holds strings — "24 + 17 =" — and nothing in this file looks
 * inside one. The obvious alternative is `{ left: 24, operator: "+", right: 17 }`,
 * which would let the product print the sum and work out its own answer, and it
 * was rejected twice over. It would put the result in the config, which is the
 * one thing a config may not hold, because the config is what the pupil is
 * handed. And it would decide for the teacher what a calculation looks like:
 * "24 + 17 + 3 =", "(4 + 5) × 2 =" and "24 + ? = 41" are all ordinary clasa a
 * III-a work and none of them fits three fields. A string prints whatever a
 * Romanian textbook prints.
 *
 * ## The working lines belong to the set, not to each sum
 *
 * `workSpaceLines` reserves ruled lines once, under the whole column. Lines per
 * sum were the first design and they turn twenty quick additions into three
 * pages: a teacher who sets twenty wants them tight, and the one who sets four
 * long divisions wants room underneath. One number serves both, and 0 keeps the
 * page as short as the sums are.
 *
 * ## The schema is looser than the check, on purpose
 *
 * Twenty problems of 120 characters is what the schema permits; that a set
 * needs at least one problem and that none of them may be blank is what
 * `validate` says. A schema strict enough to refuse a half-written exercise
 * would make it fail to parse, and `validateProject` turns a parse failure into
 * "nu este completat corect" — true, and no help at all. Split like this, the
 * same unfinished exercise says "exercițiul de pe locul 3 nu are text".
 */

const NAME = "Calcul";
const NOUN: ItemNoun = { one: "exercițiul", many: "exerciții" };
const LEAST_PROBLEMS = 1;
const MOST_PROBLEMS = 20;

const BAREM_REMEDY =
  "Scrie rezultatul fiecărui exercițiu, ca baremul să fie complet.";

export const ArithmeticConfig = z.object({
  /** Each line prints exactly as written, including its "=". */
  problems: z.array(z.string().max(120)).max(MOST_PROBLEMS).default([]),
  /** Ruled lines under the whole set, for working out. 0 means none. */
  workSpaceLines: z.number().int().min(0).max(8).default(0),
});
export type ArithmeticConfig = z.infer<typeof ArithmeticConfig>;

export const ArithmeticAnswer = z.object({
  /** One result per problem, in the same order. */
  results: z.array(z.string().max(60)).max(MOST_PROBLEMS),
});
export type ArithmeticAnswer = z.infer<typeof ArithmeticAnswer>;

/**
 * Whether a written result counts as the one in the barem.
 *
 * When both sides read as numbers they are compared as numbers, so a pupil who
 * wrote "1,5" against a barem of "1.5" is right — the two spell the same
 * quantity, and which separator got typed is an accident of the keyboard rather
 * than a fact about the arithmetic.
 *
 * Everything else falls back to folded text, which is why the fallback exists:
 * a result of "2 lei", "rest 3" or "1 h 20 min" is not a number and must not be
 * coerced into one. `numberFrom` returns null for all three, and the comparison
 * becomes the same case- and diacritic-insensitive one every written answer in
 * the product gets.
 */
const sameResult = (expected: string, given: unknown): boolean => {
  const wanted = numberFrom(expected);
  const written = numberFrom(given);
  if (wanted !== null && written !== null) return wanted === written;

  const text = stringFrom(given);
  if (text === null) return false;

  const folded = foldAnswerText(text);
  return folded !== "" && folded === foldAnswerText(expected);
};

export const arithmeticExercise: ExerciseDefinition<
  ArithmeticConfig,
  ArithmeticAnswer
> = {
  type: "arithmetic",
  category: "computation",

  labels: {
    name: NAME,
    description: "Elevul rezolvă exercițiile de calcul și scrie rezultatul.",
    keywords: [
      "calcul",
      "adunare",
      "scadere",
      "inmultire",
      "impartire",
      "operatii",
      "socoteli",
      "exercitii",
    ],
  },

  disciplines: ["matematica"],

  configSchema: ArithmeticConfig,
  answerSchema: ArithmeticAnswer,

  /**
   * Four empty lines, and no working space.
   *
   * Sample sums would be text the teacher has to delete before they can write
   * their own, and they would make every emptiness check answer "no" for an
   * exercise nobody has touched. Four is the number of sums that fits a row of
   * a Romanian evaluation without crowding it.
   */
  defaults: { problems: ["", "", "", ""], workSpaceLines: 0 },

  layouts: [
    exerciseLayout("standard", 26),
    exerciseLayout("grid", 22),
    exerciseLayout("two-column", 22),
    exerciseLayout("compact", 16),
  ],

  validate(config) {
    const issues: ValidationIssue[] = [];

    if (config.problems.length < LEAST_PROBLEMS) {
      issues.push(
        tooFewItems(NAME, NOUN, config.problems.length, LEAST_PROBLEMS),
      );
    }

    issues.push(...firstBlankItem(NAME, NOUN, config.problems));
    return issues;
  },

  validateAnswer(config, answer) {
    const issues: ValidationIssue[] = [];

    if (answer.results.length !== config.problems.length) {
      issues.push(answerCountMismatch(NAME, NOUN));
    }

    if (answer.results.some((result) => result.trim() === "")) {
      issues.push(answerEmpty(NAME, BAREM_REMEDY));
    }

    return issues;
  },

  /**
   * "1. 41  2. 108  3. 7" — the position, then what the teacher wrote.
   *
   * Numbered rather than run together, because a barem is read against a paper
   * whose sums are numbered too, and a marker working down twenty results needs
   * to be able to lose their place and find it again. Blank results are left
   * out instead of printing as "4. ": the checklist already says the barem is
   * incomplete, and an empty row on a marking sheet reads as "the answer is
   * nothing", which for a subtraction is a plausible answer.
   */
  describeAnswer(_config, answer) {
    return answer.results
      .flatMap((result, index) =>
        result.trim() === ""
          ? []
          : [`${positionMarker(index)} ${result.trim()}`],
      )
      .join("  ");
  },

  score(_config, key, response) {
    const written = stringsFrom(response);
    if (written === null) return unanswered();

    return proportional(
      countMatching(key.results, written, sameResult),
      countOf(key.results),
    );
  },
};
