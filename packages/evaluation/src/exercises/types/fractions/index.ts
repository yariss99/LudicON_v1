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
  proportional,
  stringFrom,
  stringsFrom,
  unanswered,
} from "../../scoring.js";

/**
 * Fracții: work written with `a/b` tokens, and a box for the result.
 *
 * ## A task is a line of text, and `a/b` is the only thing read out of it
 *
 * `tasks` holds "1/2 + 1/4 =" as the teacher typed it. The structured
 * alternative — an operator and two `{ numerator, denominator }` pairs — would
 * let the product compute its own answer, which is precisely the thing that may
 * not be in the config, and it would also fix what a fractions exercise can be.
 * "Scrie fracția echivalentă: 2/4 =", "Colorează 3/8 din întreg" and
 * "1/2 + 1/4 =" are three ordinary tasks and only the last one has two operands.
 * So the line is text, and `a/b` is recognised only well enough to print it
 * stacked.
 *
 * ## `stacked` is about the class, not about taste
 *
 * A fraction written one number over another is how it appears in a Romanian
 * manual from clasa a III-a, and it is what a pupil meeting fractions for the
 * first time must learn to read. The slash form is what a keyboard produces and
 * what an older class writes in a hurry. Both are correct paper; which one this
 * particular sheet wants is the teacher's call, so it is a stored field rather
 * than a rule this file applies.
 *
 * ## Marking accepts an equivalent fraction unless the barem says otherwise
 *
 * `normaliseFraction` reduces both sides before comparing, so a pupil who wrote
 * "2/4" against a barem of "1/2" is marked right. That is the correct default:
 * the two are the same number, and simplification is a separate skill that is
 * taught later and assessed on its own. Marking it wrong here would fail a
 * pupil who did the arithmetic correctly, for a rule nobody wrote on their
 * paper. A teacher who does want the simplified form only says so — in the
 * cerință, and in the barem's own notes — and marks that one by hand.
 */

const NAME = "Fracții";
const NOUN: ItemNoun = { one: "exercițiul", many: "exerciții" };
const LEAST_TASKS = 1;
const MOST_TASKS = 12;

const BAREM_REMEDY =
  "Scrie rezultatul fiecărui exercițiu, ca baremul să fie complet.";

const WHOLE = /^-?\d+$/;
const FRACTION = /^(-?\d+)\s*\/\s*(\d+)$/;

const greatestCommonDivisor = (a: number, b: number): number =>
  b === 0 ? a : greatestCommonDivisor(b, a % b);

/**
 * A fraction reduced to one spelling, or null if it is not a fraction at all.
 *
 * Exists so that "2/4", "1/2" and "3/6" compare equal without the marker
 * knowing anything about the sum they came from. A whole number is accepted and
 * returned as itself, because "4/2" and "2" are the same result and a pupil may
 * legitimately write either; a reduced fraction whose denominator comes out at
 * one is therefore printed bare, so both routes land on the same string.
 *
 * Returns null — rather than throwing or guessing — for anything else: "1,5",
 * "o jumătate", "3 lei", an empty box. Null is what tells the caller to fall
 * back to a text comparison instead of pretending a number was written.
 *
 * Mixed numbers ("1 1/2") are deliberately not handled. They are one more
 * spelling to reduce and one more way to be subtly wrong about a negative
 * quantity, and the exercises this type is for do not use them before the
 * fraction itself is secure.
 */
export const normaliseFraction = (value: string): string | null => {
  const written = value.trim();
  if (written === "") return null;

  if (WHOLE.test(written)) return String(Number(written));

  const parts = FRACTION.exec(written);
  const top = parts?.[1];
  const bottom = parts?.[2];
  if (top === undefined || bottom === undefined) return null;

  const numerator = Number(top);
  const denominator = Number(bottom);
  if (denominator === 0) return null;

  const divisor = greatestCommonDivisor(Math.abs(numerator), denominator) || 1;
  const reducedTop = numerator / divisor;
  const reducedBottom = denominator / divisor;

  return reducedBottom === 1
    ? String(reducedTop)
    : `${reducedTop}/${reducedBottom}`;
};

/** Whether a written result counts as the one in the barem. */
const sameResult = (expected: string, given: unknown): boolean => {
  const written = stringFrom(given);
  if (written === null) return false;

  const wantedFraction = normaliseFraction(expected);
  const writtenFraction = normaliseFraction(written);
  if (wantedFraction !== null && writtenFraction !== null) {
    return wantedFraction === writtenFraction;
  }

  const folded = foldAnswerText(written);
  return folded !== "" && folded === foldAnswerText(expected);
};

export const FractionsConfig = z.object({
  /** Each line prints as written; `a/b` tokens may be drawn stacked. */
  tasks: z.array(z.string().max(120)).max(MOST_TASKS).default([]),
  /** True prints `a/b` as one number over another; false prints it as typed. */
  stacked: z.boolean().default(true),
});
export type FractionsConfig = z.infer<typeof FractionsConfig>;

export const FractionsAnswer = z.object({
  /** One result per task, in the same order. */
  results: z.array(z.string().max(60)).max(MOST_TASKS),
});
export type FractionsAnswer = z.infer<typeof FractionsAnswer>;

export const fractionsExercise: ExerciseDefinition<
  FractionsConfig,
  FractionsAnswer
> = {
  type: "fractions",
  category: "computation",

  labels: {
    name: NAME,
    description: "Elevul lucrează cu fracții și scrie rezultatul.",
    keywords: [
      "fractii",
      "fractie",
      "numarator",
      "numitor",
      "simplificare",
      "fractii echivalente",
      "parte din intreg",
    ],
  },

  disciplines: ["matematica"],
  grades: ["clasa_3", "clasa_4", "clasa_5", "clasa_6", "clasa_7", "clasa_8"],

  configSchema: FractionsConfig,
  answerSchema: FractionsAnswer,

  /**
   * Three empty lines, stacked.
   *
   * Three because a fraction task drawn one number over another is twice the
   * height of a plain sum, so three fill the space four additions would. Sample
   * text is left out for the same reason it is everywhere else: it is text the
   * teacher deletes before they can start.
   */
  defaults: { tasks: ["", "", ""], stacked: true },

  layouts: [
    exerciseLayout("standard", 26),
    exerciseLayout("grid", 22),
    exerciseLayout("two-column", 22),
  ],

  validate(config) {
    const issues: ValidationIssue[] = [];

    if (config.tasks.length < LEAST_TASKS) {
      issues.push(tooFewItems(NAME, NOUN, config.tasks.length, LEAST_TASKS));
    }

    issues.push(...firstBlankItem(NAME, NOUN, config.tasks));
    return issues;
  },

  validateAnswer(config, answer) {
    const issues: ValidationIssue[] = [];

    if (answer.results.length !== config.tasks.length) {
      issues.push(answerCountMismatch(NAME, NOUN));
    }

    if (answer.results.some((result) => result.trim() === "")) {
      issues.push(answerEmpty(NAME, BAREM_REMEDY));
    }

    return issues;
  },

  /**
   * "1. 3/4  2. 1/2" — the position, then the result as the teacher wrote it.
   *
   * Deliberately NOT put through `normaliseFraction`. That function exists to
   * decide whether two spellings mean the same number while marking; using it
   * here would print a barem that disagrees with what the teacher typed — they
   * wrote "2/4", the sheet says "1/2" — and the first thing anyone does with a
   * disagreement like that is doubt the paper.
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
