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
import { positionMarker } from "../../markers.js";
import {
  countMatching,
  countOf,
  numbersFrom,
  proportional,
  unanswered,
} from "../../scoring.js";

/**
 * Pune în ordine — a jumbled list, and a box beside each item for its number.
 *
 * ## The items print in the order the teacher typed them
 *
 * The rejected design stored the items already in the right sequence and
 * shuffled them for printing. It fails twice over. It puts the answer in the
 * config, where a pupil's copy can reach it; and a shuffle makes the printed
 * paper a different document every time it is opened, so a teacher cannot hand
 * out a second copy that matches the first, cannot check the barem against the
 * sheet in their hand, and cannot reprint after a jam. `config.items` is
 * therefore exactly what appears on the page, in that order, forever — and how
 * jumbled it is is the teacher's decision, which is where the difficulty of the
 * question actually lives.
 *
 * ## `order` reads places, not ranks
 *
 * `order[place]` is the index of the item that belongs in that place, so
 * `[2, 0, 1]` means "third item first". The inverse — a rank stored per item —
 * holds the same facts and is read in the wrong direction: a teacher fills a
 * barem by going down the places asking "what comes first, what comes second",
 * which is what `order` is a list of, and what the panel draws.
 *
 * ## The schema stays looser than the checks
 *
 * Nought items parse. `validate` is what says three is the fewest that makes a
 * sequence — with two there is one decision and a coin would pass. Making the
 * schema demand it would turn a half-written exercise into a parse failure, and
 * a parse failure reaches the teacher as "nu este completat corect" instead of
 * the sentence naming what to add.
 */

const NAME = "Pune în ordine";
const NOUN: ItemNoun = { one: "elementul", many: "elemente" };
const LEAST_ITEMS = 3;

/**
 * Which side of the item the empty box is printed on.
 *
 * Left is the Romanian default and is what a pupil scans down. Right is for the
 * papers where the items are short and the boxes want to line up against the
 * margin — a decision about the sheet, so it is config rather than a theme.
 */
export const OrderingBoxSide = z.enum(["left", "right"]);
export type OrderingBoxSide = z.infer<typeof OrderingBoxSide>;

export const OrderingConfig = z.object({
  items: z.array(z.string().max(200)).max(10).default([]),
  boxSide: OrderingBoxSide.default("left"),
});
export type OrderingConfig = z.infer<typeof OrderingConfig>;

export const OrderingAnswer = z.object({
  /** The item indices, in the sequence they belong in. */
  order: z.array(z.number().int().min(0).max(9)).max(10),
});
export type OrderingAnswer = z.infer<typeof OrderingAnswer>;

export const orderingExercise: ExerciseDefinition<
  OrderingConfig,
  OrderingAnswer
> = {
  type: "ordering",
  category: "ordering",

  labels: {
    name: NAME,
    description: "Elevul numerotează elementele în ordinea corectă.",
    keywords: [
      "ordine",
      "ordoneaza",
      "numeroteaza",
      "cronologic",
      "succesiune",
      "pune in ordine",
      "crescator",
    ],
  },

  configSchema: OrderingConfig,
  answerSchema: OrderingAnswer,

  /** Three empty rows: the fewest that make a sequence, none of them to delete. */
  defaults: { items: ["", "", ""], boxSide: "left" },

  layouts: [
    exerciseLayout("standard", 28),
    exerciseLayout("compact", 20),
    exerciseLayout("card", 34),
  ],

  validate(config) {
    const issues: ValidationIssue[] = [];

    if (config.items.length < LEAST_ITEMS) {
      issues.push(tooFewItems(NAME, NOUN, config.items.length, LEAST_ITEMS));
    }

    issues.push(...firstBlankItem(NAME, NOUN, config.items));
    issues.push(...duplicateItems(NAME, NOUN, config.items));
    return issues;
  },

  validateAnswer(config, answer) {
    const issues: ValidationIssue[] = [];

    if (answer.order.length !== config.items.length) {
      issues.push(answerCountMismatch(NAME, NOUN));
    }

    // One item twice means some place has none, so it is the same fault as an
    // index past the end of the list and gets the same sentence.
    const withinList = answer.order.every(
      (index) => index < config.items.length,
    );
    const allDifferent = new Set(answer.order).size === answer.order.length;
    if (!withinList || !allDifferent) {
      issues.push(answerOutOfRange(NAME, NOUN));
    }

    return issues;
  },

  describeAnswer(config, answer) {
    return answer.order
      .map((itemIndex, place) =>
        `${positionMarker(place)} ${config.items[itemIndex] ?? ""}`.trim(),
      )
      .join("  ");
  },

  /**
   * Marked place by place, not all-or-nothing.
   *
   * A pupil who has the first four steps of a story right and swapped the last
   * two understood most of it, and a rule that gave them nothing would say the
   * same about a pupil who wrote the sequence backwards. Position-by-position
   * also keeps the mark stable: with all-or-nothing, adding a seventh item to
   * an exercise changes what six correct placements are worth.
   */
  score(_config, key, response) {
    const written = numbersFrom(response);
    if (written === null) return unanswered();

    return proportional(
      countMatching(
        key.order,
        written,
        (expected, given) => expected === given,
      ),
      countOf(key.order),
    );
  },
};
