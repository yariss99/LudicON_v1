import type { EvaluationProject } from "../model/project.js";

/**
 * EVERY mutation of an evaluation document is a command that knows how to undo
 * itself.
 *
 * This is designed in rather than bolted on, and the difference is the shape of
 * `apply`. The usual retrofit is a history of document snapshots: it is trivial
 * to add later and it costs a full copy of the document per keystroke, which on
 * a paper with a hundred blocks and a 100-step history is the whole document a
 * hundred times over in memory. The other retrofit is a diff engine that infers
 * what changed, which is a lot of machinery to reconstruct information the code
 * that made the change already had.
 *
 * Here the change and its reverse are produced together, by the one function
 * that knows both. `removeBlock` returns an inverse that restores the block at
 * the index it actually came from, because it read that index while removing
 * it. Nothing has to infer it afterwards.
 *
 * Two rules keep this honest:
 *
 *  - `apply` is PURE and time-free. A command that read the clock would produce
 *    a different result each run, so its inverse could not restore the original
 *    and undo would drift. `updatedAt` is stamped once at the persistence
 *    boundary by `touch` in `../model/project.ts`.
 *  - `apply` is TOTAL. A command aimed at something that is no longer there
 *    returns the document unchanged and a no-op inverse rather than throwing —
 *    a redo stack can legitimately outlive the thing it names, and the editor
 *    must not crash on it.
 */

export interface CommandResult {
  readonly next: EvaluationProject;
  readonly inverse: Command;
}

export interface Command {
  /** Romanian, teacher-facing: this is the text the undo menu shows. */
  readonly label: string;
  apply(document: EvaluationProject): CommandResult;
}

/** Changes nothing and reverses to itself. The result of an unaimed command. */
export const noopCommand = (label: string): Command => ({
  label,
  apply: (document) => ({ next: document, inverse: noopCommand(label) }),
});

/** The unchanged result, for the guard clauses at the top of every `apply`. */
export const unchanged = (
  document: EvaluationProject,
  label: string,
): CommandResult => ({ next: document, inverse: noopCommand(label) });
