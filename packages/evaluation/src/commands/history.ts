import type { EvaluationProject } from "../model/project.js";
import type { Command } from "./types.js";

/**
 * Undo/redo as two stacks of COMMANDS, not of document snapshots.
 *
 * A stack of snapshots is the obvious implementation and the expensive one: a
 * hundred entries is a hundred copies of a document that can hold several
 * hundred blocks, all retained because the newest entry pins the oldest. A
 * command holds only what it needs to reverse itself — an id, an index, and for
 * a removal the removed subtree — so the history costs roughly what was
 * actually changed.
 *
 * `past` holds commands that UNDO, `future` holds commands that REDO. Both are
 * recomputed as they are consumed: applying an undo command yields its own
 * inverse, which is exactly the redo for that step, so neither stack ever holds
 * a command derived from a document that has since moved on.
 *
 * There is no React here and there must not be. This is a pure state machine,
 * so the same history works in the editor, in a headless import, and in a test
 * with no renderer at all.
 */

export const HISTORY_LIMIT = 100;

export interface HistoryEntry {
  /** The label of the ORIGINAL action, so the menu reads "Anulează: Adaugă element". */
  readonly label: string;
  readonly command: Command;
}

export interface History {
  readonly past: readonly HistoryEntry[];
  readonly future: readonly HistoryEntry[];
  /** Kept on the value rather than read from the constant, so a test can shrink it. */
  readonly limit: number;
}

export interface HistoryState {
  readonly document: EvaluationProject;
  readonly history: History;
}

export const createHistory = (limit: number = HISTORY_LIMIT): History => ({
  past: [],
  future: [],
  limit,
});

export const canUndo = (history: History): boolean => history.past.length > 0;
export const canRedo = (history: History): boolean => history.future.length > 0;

export const undoLabel = (history: History): string | null =>
  history.past.at(-1)?.label ?? null;

export const redoLabel = (history: History): string | null =>
  history.future[0]?.label ?? null;

/**
 * Records a step and drops the redo stack.
 *
 * Clearing `future` is what makes the history a tree pruned to one branch:
 * after editing following an undo, the abandoned branch is unreachable and
 * keeping it would let a redo apply a command against a document it was never
 * derived from.
 *
 * The cap drops the OLDEST entries, so the hundred steps a teacher can still
 * take back are the hundred most recent ones.
 */
export const pushHistory = (history: History, entry: HistoryEntry): History => {
  const past = [...history.past, entry];
  return {
    past:
      past.length > history.limit
        ? past.slice(past.length - history.limit)
        : past,
    future: [],
    limit: history.limit,
  };
};

/**
 * Applies a command and records how to take it back. This is the one function a
 * store calls; the command factories are never applied directly in app code.
 */
export const applyCommand = (
  state: HistoryState,
  command: Command,
): HistoryState => {
  const { next, inverse } = command.apply(state.document);
  return {
    document: next,
    history: pushHistory(state.history, {
      label: command.label,
      command: inverse,
    }),
  };
};

/** Returns the state unchanged when there is nothing to take back. */
export const undo = (state: HistoryState): HistoryState => {
  const entry = state.history.past.at(-1);
  if (!entry) return state;

  const { next, inverse } = entry.command.apply(state.document);
  return {
    document: next,
    history: {
      past: state.history.past.slice(0, -1),
      future: [
        { label: entry.label, command: inverse },
        ...state.history.future,
      ],
      limit: state.history.limit,
    },
  };
};

export const redo = (state: HistoryState): HistoryState => {
  const entry = state.history.future[0];
  if (!entry) return state;

  const { next, inverse } = entry.command.apply(state.document);
  return {
    document: next,
    history: {
      past: [...state.history.past, { label: entry.label, command: inverse }],
      future: state.history.future.slice(1),
      limit: state.history.limit,
    },
  };
};

/** Forgets every step without touching the document. Used after a save point. */
export const clearHistory = (history: History): History => ({
  past: [],
  future: [],
  limit: history.limit,
});
