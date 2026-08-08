import { z } from "zod";
import type { ValidationIssue } from "@ludicon/domain";
import {
  answerCountMismatch,
  firstBlankItem,
  textMissing,
  tooFewItems,
  type ItemNoun,
} from "../../checks.js";
import type { ExerciseDefinition } from "../../definition.js";
import { exerciseLayout } from "../../layouts.js";
import {
  countMatching,
  countOf,
  proportional,
  stringsFrom,
  unanswered,
} from "../../scoring.js";

/**
 * Compară numerele: two numbers on a row, and the sign that goes between them.
 *
 * ## One line per pair, not two parallel lists
 *
 * `rows` holds "45 54" — the whole comparison as one string. The alternative
 * was `left: string[]` and `right: string[]`, two textareas side by side, and
 * it is worse in the one way that matters: two lists can silently fall out of
 * step. A teacher who deletes a line from the left-hand list shifts every pair
 * below it, and the paper still prints — 45 against 63, 54 against 72, all
 * plausible, all wrong, with nothing on the sheet looking odd. One line cannot
 * come apart from itself. It is also how the pair is thought of: a teacher
 * writing this exercise says "forty-five, fifty-four" in one breath, and the
 * control should take it in one.
 *
 * ## The sign is the answer, so it is not on the row
 *
 * The instinct is to let the teacher write "45 < 54" and have the product blank
 * the sign out at print time. That would put the answer in the config — in the
 * block itself, surviving every copy, every export and every move between pages
 * — and the blanking would be a pass that only has to miss once for a class to
 * be handed the marking scheme. The sign lives in `document.answerKey` with
 * every other answer in the product.
 *
 * ## What `splitPair` gives up, and why that is the right trade
 *
 * The rule is: first token is the left, everything after the first gap is the
 * right. It is total — any row with two parts yields two sides, and no row ever
 * yields three — so a stray double space or a trailing unit costs nothing. The
 * cost it does have is worth naming: a number grouped with a space, "1 200",
 * cannot be the left-hand side, because the space is where the split happens.
 * Thousands are written closed up here, which is what the answer boxes on the
 * rest of the paper expect anyway. The rejected alternative — demanding exactly
 * two tokens — turns a typing slip into a blocking issue on a paper that would
 * otherwise have printed correctly.
 */

const NAME = "Compară numerele";
const NOUN: ItemNoun = { one: "perechea", many: "perechi" };
const LEAST_ROWS = 2;
const MOST_ROWS = 16;

/**
 * The two numbers of one row.
 *
 * Returns empty strings rather than null for a row that has no second part, so
 * every caller can read `.left` and `.right` without a guard; "has this row
 * both sides" is then one comparison against "" rather than a shape check.
 */
export const splitPair = (row: string): { left: string; right: string } => {
  const parts = row
    .trim()
    .split(/\s+/)
    .filter((part) => part !== "");

  const [left, ...rest] = parts;
  if (left === undefined || rest.length === 0) return { left: "", right: "" };
  return { left, right: rest.join(" ") };
};

/**
 * The three signs, and only these three.
 *
 * "≤" and "≥" are not here on purpose: they arrive in the Romanian curriculum
 * with inequations in gimnaziu, where the exercise is no longer "which of these
 * two numbers is bigger" but a different question with a different paper. Five
 * choices in a row-by-row picker for an exercise that needs three is five
 * chances to pick the wrong one.
 */
export const ComparisonSign = z.enum(["<", ">", "="]);
export type ComparisonSign = z.infer<typeof ComparisonSign>;

export const NumberComparisonConfig = z.object({
  /** One comparison per row: the two numbers, separated by whitespace. */
  rows: z.array(z.string().max(60)).max(MOST_ROWS).default([]),
});
export type NumberComparisonConfig = z.infer<typeof NumberComparisonConfig>;

export const NumberComparisonAnswer = z.object({
  /** One sign per row, in the same order. */
  signs: z.array(ComparisonSign).max(MOST_ROWS),
});
export type NumberComparisonAnswer = z.infer<typeof NumberComparisonAnswer>;

export const numberComparisonExercise: ExerciseDefinition<
  NumberComparisonConfig,
  NumberComparisonAnswer
> = {
  type: "number-comparison",
  category: "computation",

  labels: {
    name: NAME,
    description: "Elevul pune semnul potrivit între două numere.",
    keywords: [
      "compara",
      "mai mare",
      "mai mic",
      "egal",
      "semn",
      "compara numerele",
      "ordonare numere",
    ],
  },

  disciplines: ["matematica"],

  configSchema: NumberComparisonConfig,
  answerSchema: NumberComparisonAnswer,

  /**
   * Four empty rows, not four filled with "45 54".
   *
   * A sample pair is a pair the teacher has to delete before they can write
   * their own, and it would make an untouched exercise look finished to every
   * emptiness check in the product.
   */
  defaults: { rows: ["", "", "", ""] },

  layouts: [
    exerciseLayout("standard", 22),
    exerciseLayout("grid", 18),
    exerciseLayout("two-column", 18),
    exerciseLayout("compact", 14),
  ],

  validate(config) {
    const issues: ValidationIssue[] = [];

    if (config.rows.length < LEAST_ROWS) {
      issues.push(tooFewItems(NAME, NOUN, config.rows.length, LEAST_ROWS));
    }

    issues.push(...firstBlankItem(NAME, NOUN, config.rows));

    /**
     * Blank rows are already reported above, so only rows with something on
     * them are checked here — otherwise an unfinished exercise would say the
     * same thing twice in two different words.
     */
    const halfWritten = config.rows.some((row) => {
      if (row.trim() === "") return false;
      const pair = splitPair(row);
      return pair.left === "" || pair.right === "";
    });

    if (halfWritten) {
      issues.push(
        textMissing(
          NAME,
          "al doilea număr pe unul dintre rânduri",
          "Scrie două numere pe fiecare rând, despărțite printr-un spațiu.",
        ),
      );
    }

    return issues;
  },

  validateAnswer(config, answer) {
    return answer.signs.length === config.rows.length
      ? []
      : [answerCountMismatch(NAME, NOUN)];
  },

  /**
   * "45 < 54  108 > 89" — the whole comparison, never a bare sign.
   *
   * A barem row reading "<" tells a marker nothing they can check against the
   * paper: they would have to count down to the third row, read the two numbers
   * there, and hold both in their head. Printing the numbers with the sign
   * between them makes each row of the marking sheet legible on its own, which
   * is the only state in which a barem is faster than working it out again.
   */
  describeAnswer(config, answer) {
    return answer.signs
      .map((sign, index) => {
        const pair = splitPair(config.rows[index] ?? "");
        return `${pair.left} ${sign} ${pair.right}`.trim();
      })
      .join("  ");
  },

  score(_config, key, response) {
    const written = stringsFrom(response);
    if (written === null) return unanswered();

    return proportional(
      countMatching(
        key.signs,
        written,
        (expected, given) => expected === given,
      ),
      countOf(key.signs),
    );
  },
};
