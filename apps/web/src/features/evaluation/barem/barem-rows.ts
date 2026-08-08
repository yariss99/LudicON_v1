import {
  answerFor,
  exerciseBlocks,
  inlineToPlainText,
  type BlockId,
  type EvaluationProject,
  type ExerciseRegistry,
  type InlineContent,
} from "@ludicon/evaluation";

import { BAREM_COPY } from "./copy";

/**
 * The barem, derived from the document and the registry — never from a list of
 * exercise types.
 *
 * This file is the test of whether the exercise abstraction holds. Twelve
 * exercise types are being written right now by someone else, and not one of
 * their names appears here: a row is built from `exerciseBlocks(document)` in
 * print order, the definition is looked up by the block's own `exerciseType`
 * string, and everything printed comes off the definition's `labels` or off the
 * answer key. Adding a thirteenth type changes nothing in this file.
 *
 * The rejected alternative was a `switch (block.exerciseType)` producing a
 * hand-written sentence per type — which reads better for the four types you
 * thought of and is a merge conflict for every type you did not.
 *
 * ## The answer text comes from the definition, and it has to
 *
 * The barem's middle column is the one thing the registry could not have
 * supplied from `labels`, `answerSchema` and `score` alone, and the gap is not
 * cosmetic. A stored answer is frequently a POSITION rather than a value —
 * `single-choice` holds `{ correct: 1 }`, meaning the second option — so
 * anything generic prints "Răspunsul corect: 1", which is a marking sheet that
 * is confidently wrong in a way a teacher checks against the paper and
 * believes.
 *
 * `describeAnswer(config, answer)` is the member that closes it, and it is
 * REQUIRED on the definition rather than optional: a type that cannot put its
 * own answer into words is a type whose barem is broken, and that should fail
 * at the compiler rather than on a photocopier. This file simply asks for it —
 * there is no fallback here, and there deliberately is not one, because a
 * fallback is how a type ships without the member and nobody notices until the
 * barem is being read in front of a class.
 *
 * The rejected alternative was inferring the text — noticing that an answer's
 * number is within range of a config's array and indexing into it. It is right
 * for `single-choice` and wrong for "câte pagini i-au mai rămas: 80", and a
 * heuristic that is silently wrong on arithmetic is the exact failure being
 * fixed.
 */

export interface BaremRow {
  readonly blockId: BlockId;
  /** 1-based, in print order. Matches the number the pupil sees on the paper. */
  readonly position: number;
  /** The exercise type's Romanian name, from the registry. */
  readonly name: string;
  /** What the pupil is asked to do — the definition's own one-liner. */
  readonly clarification: string;
  /** The instruction the teacher wrote above this exercise, if any. */
  readonly prompt: string;
  readonly answer: string;
  /** False when the barem has no entry, or the entry has nothing in it. */
  readonly answered: boolean;
  readonly points: number;
  /** Marking guidance in the teacher's own words. Often empty. */
  readonly note: InlineContent;
  /** True when the registry does not recognise this exercise's type. */
  readonly unknownType: boolean;
}

/**
 * The rows, in print order.
 *
 * `points` prefers the barem's own figure over the block's. The two can
 * disagree — the paper shows the pupil one number and the marker adds up
 * another — and `validateProject` reports that disagreement as a warning rather
 * than letting either side win silently. Here the marker's document wins,
 * because this IS the marker's document. The block's figure is the fallback for
 * an exercise with no barem entry at all, so the total still counts it.
 */
export const baremRows = (
  document: EvaluationProject,
  registry: ExerciseRegistry,
): BaremRow[] =>
  exerciseBlocks(document).map((block, index) => {
    const definition = registry.get(block.exerciseType);
    const entry = answerFor(document.answerKey, block.id);

    /**
     * `block.config` as well as the answer, because for most types the answer
     * alone is meaningless — a chosen option, an ordering and a pairing are all
     * positions in a list the config holds.
     *
     * An exercise whose type is no longer registered has no definition to ask,
     * so the answer stays empty and the row says the type is gone. Guessing at
     * the stored value would put a number on a marking sheet with no way to
     * check what it counts.
     */
    const answer =
      entry && definition
        ? definition.describeAnswer(block.config, entry.answer).trim()
        : "";

    return {
      blockId: block.id,
      position: index + 1,
      name: definition?.labels.name ?? BAREM_COPY.unknownExercise,
      clarification: definition?.labels.description ?? "",
      prompt: inlineToPlainText(block.prompt).trim(),
      answer,
      answered: answer !== "",
      points: entry?.points ?? block.points,
      note: entry?.notes ?? [],
      unknownType: definition === undefined,
    };
  });

/**
 * The total, added up from the rows every time it is shown.
 *
 * Never stored. A stored total is a number that can disagree with the sheet
 * printed under it, and the one place that disagreement would surface is a
 * classroom — `packages/evaluation/src/model/answer-key.ts` makes the same
 * argument for `answerKeyPoints`, which this deliberately mirrors rather than
 * reuses: that function reads the answer key alone, and a row whose exercise
 * has no barem entry yet still has points on the paper and still belongs in the
 * total the teacher is looking at.
 */
export const baremTotal = (rows: readonly BaremRow[]): number =>
  rows.reduce((sum, row) => sum + row.points, 0);
