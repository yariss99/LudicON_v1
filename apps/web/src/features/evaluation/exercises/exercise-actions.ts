import {
  addBlock,
  columnParent,
  locateBlock,
  sectionsOfPage,
  setAnswer,
  updateBlock,
  type AnswerEntry,
  type AnyExerciseDefinition,
  type BlockId,
  type BlockParent,
  type Command,
  type EvaluationProject,
  type ExerciseBlock,
  type InlineContent,
} from "@ludicon/evaluation";

import { newExerciseBlock } from "../block-factory";
import {
  resolveSelection,
  runCommand,
  select,
  type EditorState,
  type EditorStore,
} from "../editor-store";
import type { ExerciseDraft } from "./exercise-module";

/**
 * The gestures that involve an exercise, each ONE step of undo.
 *
 * They live here rather than in `document-actions.ts` because every one of them
 * writes two records at once. An exercise is a block AND a row in
 * `document.answerKey`, kept apart on purpose — the paper and the barem are two
 * printouts and the pupil must never receive the file holding both — and that
 * separation is only safe if nothing can change one without the other. Deleting
 * an option from a question and leaving the barem pointing at it is the exact
 * failure the split is meant to prevent, so the two writes are one command.
 *
 * `document-actions.ts` holds the gestures every piece shares: add, move,
 * duplicate, remove. Nothing there knows what a barem is, and it should not
 * start knowing for one kind of block.
 */

/**
 * Two commands that behave as one.
 *
 * The inverse runs them backwards, which is what makes the pair exactly
 * invertible: undoing "shorten the options and fix the barem" has to put the
 * barem back BEFORE the options, or the restored answer would briefly point
 * past the end of a list that has not grown back yet. Both halves are pure and
 * total, as `commands/types.ts` requires, because both halves already are.
 *
 * The rejected alternative was two `runCommand` calls. They produce two history
 * entries, so one press of ⌘Z leaves the document in the state the split exists
 * to make unreachable.
 */
const asOneStep = (
  label: string,
  first: Command,
  second: Command,
): Command => ({
  label,
  apply: (document) => {
    const stepOne = first.apply(document);
    const stepTwo = second.apply(stepOne.next);
    return {
      next: stepTwo.next,
      inverse: asOneStep(label, stepTwo.inverse, stepOne.inverse),
    };
  },
});

/**
 * Where a new exercise lands: after the selected piece, else at the end of the
 * current page's last row.
 *
 * The same reading-order rule `document-actions.ts` uses for every other piece,
 * restated here rather than exported from there: it is four lines, and reaching
 * into another module for its private insertion policy would couple two files
 * that currently share only a store.
 */
const insertionPoint = (
  state: EditorState,
): { parent: BlockParent; index: number } | null => {
  const resolved = resolveSelection(state.document, state.selection);

  if (resolved?.kind === "block") {
    const location = locateBlock(state.document, resolved.id);
    if (location) return { parent: location.parent, index: location.index + 1 };
  }

  const page = state.document.pages[state.currentPageId];
  const section =
    resolved?.kind === "section"
      ? state.document.sections[resolved.id]
      : page
        ? sectionsOfPage(state.document, page).at(-1)
        : undefined;

  const column = section?.columns[0];
  if (!column) return null;

  return { parent: columnParent(column.id), index: column.blockOrder.length };
};

/**
 * Adds an exercise of one type, and selects it.
 *
 * NO barem row is created. A fresh single-choice question would have to guess
 * that option one is correct, and a guess in a barem is the worst thing this
 * product could produce: it prints, it looks deliberate, and a class is marked
 * against it. Instead the paper's checklist says the exercise has no answer yet
 * — which `validateProject` already treats as blocking — and the teacher fills
 * it in as part of writing the question.
 */
export const addExercise = (
  store: EditorStore,
  definition: AnyExerciseDefinition,
): void => {
  const target = insertionPoint(store.state);
  if (!target) return;

  const block = newExerciseBlock(definition);
  runCommand(store, addBlock(target.parent, target.index, block));
  select(store, block.id);
};

const entryFor = (
  block: ExerciseBlock,
  answer: unknown,
  previous: AnswerEntry | undefined,
): AnswerEntry => ({
  blockId: block.id,
  exerciseType: block.exerciseType,
  answer,
  points: block.points,
  notes: previous?.notes ?? [],
});

export const answerOf = (
  document: EvaluationProject,
  blockId: BlockId,
): AnswerEntry | undefined => document.answerKey[blockId];

/**
 * The block as the store holds it NOW, not as the panel last rendered it.
 *
 * Every write below is handed a block by a React component, which captured it
 * when it rendered. `updateBlock` replaces the whole block — the model has no
 * partial patch, deliberately — so writing back a captured copy also writes
 * back every field that changed since. Two edits inside one tick therefore lose
 * the first: setting the cerință and then the options in the same breath saved
 * the options over a block that still carried the old cerință, and the panel
 * looked right because it re-rendered from the same stale value.
 *
 * Re-reading here rather than asking every caller to pass an id keeps the
 * signatures the components already use, and makes the guarantee a property of
 * the write instead of a rule each control has to remember. Falls back to the
 * captured block if the id has gone — an undo can remove it between render and
 * press, and `applyCommand` is total, so the command is simply a no-op.
 */
const asStored = (store: EditorStore, block: ExerciseBlock): ExerciseBlock => {
  const current = store.state.document.blocks[block.id];
  return current && current.kind === "exercise" ? current : block;
};

/**
 * Writes what the teacher changed about the question and about its answer.
 *
 * `draft.answer === null` clears the barem row, which is how a type says "the
 * teacher has un-chosen the answer" — removing the last correct option of a
 * multiple-choice question, for instance. `setAnswer` already treats `null` as
 * a clear and produces the right inverse, so nothing here has to special-case
 * it.
 *
 * The marking notes are carried across from the previous entry. They are the
 * teacher's own words about what else to accept, and re-picking the right
 * option is not a reason to lose them.
 */
export const writeExercise = (
  store: EditorStore,
  block: ExerciseBlock,
  draft: ExerciseDraft,
): void => {
  const stored = asStored(store, block);
  const previous = store.state.document.answerKey[stored.id];

  runCommand(
    store,
    asOneStep(
      "Modifică exercițiul",
      updateBlock({ ...stored, config: draft.config }),
      setAnswer(
        stored.id,
        draft.answer === null || draft.answer === undefined
          ? null
          : entryFor(stored, draft.answer, previous),
      ),
    ),
  );
};

/**
 * Changes what the question is worth, on the paper AND in the barem.
 *
 * Both, always. `validateProject` reports a disagreement between the two as a
 * warning rather than picking a winner, so a control that wrote only one of
 * them would manufacture that warning on every press.
 */
export const writePoints = (
  store: EditorStore,
  block: ExerciseBlock,
  points: number,
): void => {
  const stored = asStored(store, block);
  const previous = store.state.document.answerKey[stored.id];

  runCommand(
    store,
    asOneStep(
      "Modifică punctajul",
      updateBlock({ ...stored, points }),
      setAnswer(stored.id, previous ? { ...previous, points } : null),
    ),
  );
};

/** Changes the cerință. One field, one step, no barem. */
export const writePrompt = (
  store: EditorStore,
  block: ExerciseBlock,
  prompt: InlineContent,
): void => {
  runCommand(store, updateBlock({ ...asStored(store, block), prompt }));
};

/** Changes how the exercise is laid out. One field, one step, no barem. */
export const writeLayout = (
  store: EditorStore,
  block: ExerciseBlock,
  layoutId: string,
): void => {
  runCommand(store, updateBlock({ ...asStored(store, block), layoutId }));
};
